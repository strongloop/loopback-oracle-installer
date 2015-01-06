#!/bin/bash

export OCI_DIR=$1

SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
INSTALL_DIR=$(cd -P -- "$SCRIPT_DIR/.." && pwd -P)

source "$INSTALL_DIR/../../lib/utils"

setup_configuration "$OCI_DIR" "$HOME/strong-oracle.rc"
cat << MYEOF
-------------------------------------------------------------------------------
"strong-oracle.rc" has been created in \$HOME. Please manually add the
following to your ".bash_profile":

  source $HOME/strong-oracle.rc

If you do not use bash as your default shell, please remember to set
\$DYLD_LIBRARY_PATH prior to using node:

  export DYLD_LIBRARY_PATH="$DYLD_LIBRARY_PATH:$OCI_DIR"

-------------------------------------------------------------------------------
MYEOF
