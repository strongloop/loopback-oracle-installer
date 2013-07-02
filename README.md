asteroid-oracle-installer
=========================

Asteroid Oracle Installer


Notes:

1. The ubuntu 32 bit installer requires libaio:

    sudo apt-get install libaio1

2. First ensure that you run the make/build.sh from the
   `asteroid-oracle-builder` and the package (gzipped tarball) is
   built correctly and uploaded to a publicly available site.

3. Make sure the asteriod-oracle-builder and the asteroid-oracle-installer
   projects are siblings within the same directory heirarchy.
   This is only required if you want to test w/ the locally built
   gzipped tarball.

4. To you want to run/test a local install, simply comment the
   ASTEROID_DOWNLOAD_URI in the `lib/utils` script and run:

     cd asteroid-oracle-installer
     npm install

5. For production release, make sure you have edited the `lib/utils`
   script and set the ASTEROID_DOWNLOAD_URI appropriately.
   Example:

       base_uri=http://www.strongloop.com/
       export ASTEROID_DOWNLOAD_URI="$base_uri/downloads/$ASTEROID_ORACLE_INSTALL_PACKAGE"

   and then run:

       npm install asteroid-oracle-installer

   Note this requires the packages to be available in npm. So please
   package and submit those to npmjs.org appropriately.

