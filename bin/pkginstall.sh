#!/bin/bash

SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
INSTALL_DIR=$(cd -P -- "$SCRIPT_DIR/.." && pwd -P)
source "$INSTALL_DIR/lib/utils"

detect_platform

platform_dir=$SCRIPT_DIR/installers/$STRONGLOOP_INSTALL_PLATFORM

arch_specific_installer=$platform_dir/$STRONGLOOP_INSTALL_ARCH/installer.sh

if [ -f "$arch_specific_installer" ]; then
  echo "install.sh: @@@ invoking $arch_specific_installer ..."
  exec "$arch_specific_installer" "$@"
else
  platform_specific_installer=$platform_dir/installer.sh
  echo "install.sh: @@@ invoking $platform_specific_installer ..."
  exec "$platform_specific_installer" "$@"
fi

