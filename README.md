# loopback-oracle-installer

LoopBack Oracle Installer is a utility module that downloads and extracts the
prebuilt LoopBack Oracle binary dependencies into parent module's node_modules
folder and sets up the environment for [Oracle Database Instant Client](http://www.oracle.com/technetwork/database/features/instant-client/index.html).
The main purpose is to remove the inconvenience to build [node-oracle module](https://github.com/strongloop/node-oracle),
install and configure Oracle Database Instant Client.

## Use as a dependency for loopback-connector-oracle

The loopback-oracle-installer module can be used as a dependency for
[loopback-connector-oracle](https://github.com/strongloop/loopback-connector-oracle) module.
It can be declared in package.json as follows:


    "dependencies": {
        "loopback-oracle-installer": "git+ssh://git@github.com:strongloop/loopback-oracle-installer.git",
             ...
        },
        "config": {
            "oracleUrl": "http://7e9918db41dd01dbf98e-ec15952f71452bc0809d79c86f5751b6.r22.cf1.rackcdn.com"
        },

During `npm install` of the loopback-connector-oracle module, it will detect the
local platform and download the corresponding prebuilt [oracle module](https://github.com/strongloop/node-oracle)
and Oracle Database Instant Client into the node_modules folder as illustrated below.

    loopback-connector-oracle
        +--- node_modules
            +-- oracle
            +-- instantclient


## Standalone use for local tests

1. First ensure that you run the make/build.sh from the `loopback-oracle-builder`
and the package (gzipped tarball) is built correctly and uploaded to a publicly
available site.

2. Make sure the loopback-oracle-builder and the loopback-oracle-installer
projects are siblings within the same directory hierarchy. This is only required
if you want to test with the locally built gzipped tarball.

3. To run/test a local install, run:


    cd loopback-oracle-installer
    npm install

4. For production release, make sure you have the LOOPBACK_ORACLE_URL
appropriately. For example:


    export LOOPBACK_ORACLE_URL=http://7e9918db41dd01dbf98e-ec15952f71452bc0809d79c86f5751b6.r22.cf1.rackcdn.com
    or
    export LOOPBACK_ORACLE_URL=/Users/rfeng/Projects/loopback/loopback-oracle-builder/build/MacOSX

and then run:


    npm install loopback-oracle-installer

## Changes made to your environment

To configure Oracle Database Instant Client for Node.js modules, the installer
sets up the environment variable depending on the target platform.

### MacOSX

The change is made into $HOME/.bash_profile or $HOME/.profile.

    # __loopback-oracle-installer__:  Fri Aug 30 15:11:11 PDT 2013
    export DYLD_LIBRARY_PATH="$DYLD_LIBRARY_PATH:/Users/<user>/<myapp>/node_modules/loopback-connector-oracle/node_modules/instantclient"

**You need to open a terminal window to make it effective.**

### Linux

The change is made into $HOME/.bash_profile or $HOME/.profile.

    # __loopback-oracle-installer__:  Fri Aug 30 15:11:11 PDT 2013
    export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:/Users/<user>/<myapp>/node_modules/loopback-connector-oracle/node_modules/instantclient"

**You need to open a terminal window to make it effective.**

### Windows

The change is made to the PATH environment variable for the logged in user.

**You need to log out and log in again to make it effective.**
