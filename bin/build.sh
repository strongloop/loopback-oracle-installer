#!/bin/bash

thisdir=$(dirname "${BASH_SOURCE[0]}")
SCRIPT_DIR=$(cd -P -- "$thisdir" && pwd -P)
source "$SCRIPT_DIR/../../lib/utils"

DEBUG_BUILD_SCRIPT=""  #  Set to any string to debug.
TEMP_BUILD_DIR="$SCRIPT_DIR/temp_build_dir"


#
#  Initializes the build (currently just cleans up + creates build directories).
#
#  Example:
#    initialize_build
#
function initialize_build() {
  rm -rf "$TEMP_BUILD_DIR"
  mkdir -p "$TEMP_BUILD_DIR"

}  #  End of function  initialize_build.


#
#  Extracts the Oracle InstantClient basiclite and sdk packages for the
#  specific platform and architecture we are building on/for.
#
#  Example:
#    extract_ic_packages
#
function extract_ic_packages() {
  packages=( instantclient-basiclite instantclient-sdk )

  build_os=$(echo "$BUILD_OS" | tr '[A-Z]' '[a-z]')
  zipdir=$ORA_PACKAGES_DIR/$BUILD_PLATFORM/$BUILD_ARCH

  pushd "$TEMP_BUILD_DIR" > /dev/null

  for pkg in $(echo ${packages[@]}); do
    print_message ""
    print_message "- Extracting package $pkg ..."
    zipf=$(ls $zipdir/${pkg}-${build_os}*.zip | head -1)
    if [ -n "$DEBUG_BUILD_SCRIPT" ]; then
      print_message "    zip file = $zipf"
      print_message "    dest dir = $pkg"
    fi

    mkdir -p "$pkg"
    unzip -u "$zipf" -d "$pkg" > /dev/null
    print_message "- Done extracting package $pkg"
  done
  popd > /dev/null

}  #  End of function  extract_ic_packages.


#
#  Creates symbolic links to the Oracle shared libraries.
#
#  Example:
#    create_ic_dso_symlinks
#
function create_ic_dso_symlinks() {
  pkg="instantclient-basiclite"
  libs_to_link=( libclntsh.so libocci.so )

  pushd "$TEMP_BUILD_DIR/$pkg" > /dev/null
  instantclient_dir=$(ls -d instantclient_*_* | head -n 1)

  cd "$instantclient_dir"
  for dso in $(echo "${libs_to_link[@]}"); do
    zdso=$(ls ${dso}.*.* | head -n 1)
    ln -sf $zdso $dso
  done

  popd > /dev/null

}  #  End of function  create_ic_dso_symlinks.


#
#  Returns the location of the Oracle InstantClient SDK include directory.
#
#  Example:
#    get_oracle_sdk_include_dir
#
function get_oracle_sdk_include_dir() {
  pushd "$TEMP_BUILD_DIR/instantclient-sdk" > /dev/null
  instantclient_dir=$(ls -d instantclient_*_* | head -n 1)
  popd > /dev/null
  echo "$TEMP_BUILD_DIR/instantclient-sdk/$instantclient_dir/sdk/include/"

}  #  End of function  get_oracle_sdk_include_dir.


#
#  Returns the location of the Oracle InstantClient library directory.
#
#  Example:
#    get_oracle_lib_dir
#
function get_oracle_lib_dir() {
  pushd "$TEMP_BUILD_DIR/instantclient-basiclite" > /dev/null
  instantclient_dir=$(ls -d instantclient_*_* | head -n 1)
  popd > /dev/null
  echo "$TEMP_BUILD_DIR/instantclient-basiclite/$instantclient_dir/"

}  #  End of function  get_oracle_lib_dir.


#
#  Installs and builds the node oracle npm module.
#
#  Example:
#    install_node_oracle_module
#
function install_node_oracle_module() {
  export OCI_INCLUDE_DIR=$(get_oracle_sdk_include_dir)
  export OCI_LIB_DIR=$(get_oracle_lib_dir)

  print_message ""
  print_message "- Installing/Building node-oracle module ..."
  print_message "    OCI_INCLUDE_DIR = $OCI_INCLUDE_DIR"
  print_message "        OCI_LIB_DIR = $OCI_LIB_DIR"
  print_message ""

  rm -rf "$TEMP_BUILD_DIR/install"
  mkdir -p "$TEMP_BUILD_DIR/install"

  pushd "$TEMP_BUILD_DIR/install" > /dev/null
  pwd
  if npm install oracle; then
    print_message ""
    print_message "- Local install/build completed."
  else
    print_message ""
    print_message "ERROR: ***  Local install/build of node oracle FAILED! *** "
    echo  "ERROR: Exiting due to build failure."
    exit 255
  fi

  popd > /dev/null

}  #  End of function  install_node_oracle_module.


#
#  Generates a dummy source tarball so that we can do a debuild.
#
#  Example:
#    generate_dummy_source_tarball
#
function generate_dummy_source_tarball() {
   version=$(echo $BUILD_VERSION | cut -f 1 -d '-')
   pkg_source_dir=${BUILD_PACKAGE}_$version
   gz_tarball="../packages/${pkg_source_dir}.orig.tar.gz"

   print_message "- Generating dummy source tarball for packaging ..."

   mkdir -p "$TEMP_BUILD_DIR/source"

   pushd "$TEMP_BUILD_DIR/source" > /dev/null
   mkdir -p "$pkg_source_dir"
   echo "Dummy file for building debian package." > "$pkg_source_dir/README"
   rm -f  "$gz_tarball"
   tar -zcf "$gz_tarball" "$pkg_source_dir"
   popd > /dev/null

}  #  End of function  generate_dummy_source_tarball.


#
#  Ensure build requirements are satisfied and we have the build-essential,
#  devscripts and debhelper packages installed.
#
#  Example:
#    check_build_requirements
#
function check_build_requirements() {
  required_packages=( build-essential devscripts debhelper )

  print_message "- Checking build requirements ..."

  for pkg in $(echo ${required_packages[@]}); do
    if ! dpkg -l | grep "$pkg" &> /dev/null; then
      print_message "- Missing installed package $pkg - aborting packaging ..."
      echo "ERROR: Package $pkg is NOT installed - need it for packaging."
      exit 2  #  ENOENT.
    fi
  done

}  #  End of function  check_build_requirements.


#
#  Initialize package environment.
#
#  Example:
#    initialize_package_env
#
function initialize_package_env() {
  pkg_dir="$TEMP_BUILD_DIR/packages"

  print_message "- Cleaning old package directory ..."
  rm -rf "$pkg_dir"
  mkdir -p "$pkg_dir/$BUILD_ARCH/"

  print_message "- Initializing package directory ..."
  cp -r "$SCRIPT_DIR/packages/debian" "$pkg_dir/$BUILD_ARCH/"

  arch=$BUILD_ARCH
  [ "$arch" == "x86_64" ] && arch="amd64"

  print_message "- Fixing up build architecture ($arch) in control file ..."
  sed -i "s#@@BUILD_ARCH@@#$arch#" $pkg_dir/$BUILD_ARCH/debian/control

  generate_dummy_source_tarball

}  #  End of function  initialize_package_env.


#
#  Package up the node module and dependencies.
#
#  Example:
#    package_module_and_dependencies
#
function package_module_and_dependencies() {
  #  TODO: Just putting it all into 1 package for now. It makes more sense to
  #  split it into 2 separate packages (one for the oracle libs + one for the
  #  node module).

  check_build_requirements
  
  initialize_package_env

  print_message "- Packaging $BUILD_PACKAGE - $BUILD_ARCH version ..."

  pushd  "$pkg_dir/$BUILD_ARCH" > /dev/null
  debuild -us -uc
  popd > /dev/null

  print_message "- Done packaging $BUILD_PACKAGE - $BUILD_ARCH version"
  print_message "- PACKAGES directory = $pkg_dir"

}  #  End of function  package_module_and_dependencies.


#
#  Build a downloadable tarball
#
#  Example:
#    build_downloadable_tarball
#
function build_downloadable_tarball() {
  tarball="$SCRIPT_DIR/${BUILD_PACKAGE}_${BUILD_PLATFORM}_${BUILD_VERSION}_${BUILD_ARCH}.tar"
  package="${tarball}.gz"

  ora_lib_dir=$(get_oracle_lib_dir)

  print_message "- Cleaning old package directory ..."
  rm -rf  "$TEMP_BUILD_DIR/tarball"
  mkdir -p "$TEMP_BUILD_DIR/tarball/instantclient"

  pushd "$TEMP_BUILD_DIR/tarball" > /dev/null
  cp -r "$TEMP_BUILD_DIR/install/node_modules"/*  ./
  cp -r "$ora_lib_dir"/*  instantclient/ 

  print_message "- Creating downloadable tarball ..."
  tar -cf "$tarball" oracle/ instantclient/

  print_message "- Gzipping tarball ..."
  rm -f "$package"
  gzip "$tarball"
  popd > /dev/null

  print_message "- Done creating a downloable tarball."
  print_message "- Gzipped tarball = $package"

}  #  End of function  build_downloadable_tarball.


#
#  main():
#
detect_platform

initialize_build

extract_ic_packages  &&  create_ic_dso_symlinks

install_node_oracle_module

# package_module_and_dependencies

build_downloadable_tarball

