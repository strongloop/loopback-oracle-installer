#!/bin/sh

SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
INSTALL_DIR=$(cd -P -- "$SCRIPT_DIR/.." && pwd -P)
source "$INSTALL_DIR/../../lib/utils"

#  Detect platform and set variables.
detect_platform > /dev/null

if extract_package_files; then
  setup_configuration "$OCI_DIR"
  cat << MYEOF

---------------------------------------------------------------------------
The node-oracle module and the Oracle specific libraries have been
installed in `pwd`. 

The default bashrc (/etc/bashrc) or  user's bash_profile (~/.bash_profile)
paths have been modified to use this path. If you use a shell other than
bash, please remember to set the DYLD_LIBRARY_PATH prior to using node.

Example:
  \$ export DYLD_LIBRARY_PATH="$DYLD_LIBRARY_PATH:$OCI_DIR"

MYEOF
fi

