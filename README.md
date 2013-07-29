loopback-oracle-installer
=========================

Loopback Oracle Installer downloads/extracts the prebuilt Loopback Oracle installable bundle into parent module's
node_modules folder and sets up the environment for Oracle instant client.

1. First ensure that you run the make/build.sh from the
   `loopback-oracle-builder` and the package (gzipped tarball) is
   built correctly and uploaded to a publicly available site.

2. Make sure the loopback-oracle-builder and the loopback-oracle-installer
   projects are siblings within the same directory heirarchy.
   This is only required if you want to test w/ the locally built
   gzipped tarball.

3. To you want to run/test a local install, run:

     cd loopback-oracle-installer
     npm install

4. For production release, make sure you have the LOOPBACK_ORACLE_URL appropriately.
   Example:

        export LOOPBACK_ORACLE_URL=http://7e9918db41dd01dbf98e-ec15952f71452bc0809d79c86f5751b6.r22.cf1.rackcdn.com
        or
        export LOOPBACK_ORACLE_URL=/Users/rfeng/Projects/loopback/loopback-oracle-builder/build/MacOSX


   and then run:

       npm install loopback-oracle-installer

5. Use loopback-oracle-installer as dependency for loopback-connector-oracle module

Declare in package.json:

           "dependencies": {
             "loopback-oracle-installer": "git+ssh://git@github.com:strongloop/loopback-oracle-installer.git",
             ...
           },
           "config": {
             "oracleUrl": "http://7e9918db41dd01dbf98e-ec15952f71452bc0809d79c86f5751b6.r22.cf1.rackcdn.com"
           },


   Note this requires the packages to be available in npm. So please
   package and submit those to npmjs.org appropriately.

