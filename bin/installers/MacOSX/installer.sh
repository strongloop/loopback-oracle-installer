#!/bin/sh

SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
INSTALL_DIR=$(cd -P -- "$SCRIPT_DIR/.." && pwd -P)
source "$INSTALL_DIR/../../lib/utils"

#  Detect platform and set variables.
detect_platform

platform=$STRONGLOOP_INSTALL_PLATFORM
arch=$STRONGLOOP_INSTALL_ARCH

echo "  - StrongLoop Node Oracle $platform installer"
echo "  - Architecture = $arch"

#  Downloadable gzipped tarball.
targz="${ASTEROID_ORACLE_BASE_PACKAGE}_${platform}_${ASTEROID_ORACLE_INSTALL_VERSION}_${arch}.tar.gz"

#  Install to node modules directory.
nmdir="../node_modules"
[ -d "$nmdir" ] ||  nmdir="`pwd`/node_modules"

mkdir -p "$nmdir"

pushd "$nmdir" > /dev/null
echo " - Downloading $ASTEROID_DOWNLOAD_URI/$targz ..."
curl -o ./$targz  $ASTEROID_DOWNLOAD_URI/$targz

echo " - Extracting $ASTEROID_DOWNLOAD_URI/$targz ..."
tar -zxf $targz

instantclient_dir="$(pwd)/instantclient/"
popd > /dev/null

cat << MYEOF

The Node oracle module + the Oracle specific libraries have been installed
in `pwd`.  Please remember to set the DYLD_LIBRARY_PATH prior to using node.

Example:
  export DYLD_LIBRARY_PATH="$DYLD_LIBRARY_PATH:$instantclient_dir"

MYEOF

