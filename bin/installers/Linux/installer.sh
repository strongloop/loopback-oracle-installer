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
\$LD_LIBRARY_PATH prior to using node:

  export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:$OCI_DIR"

The node-oracle module and Oracle specific libraries have been installed in
`pwd`. Alternatively, you can add that path to /etc/ld.so.conf (sudo required):

  echo "$OCI_DIR" | sudo tee -a /etc/ld.so.conf.d/loopback_oracle.conf
  sudo ldconfig

-------------------------------------------------------------------------------
MYEOF
