// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback-oracle-installer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is a workaround to node-tar which writes in chunks of 512 bytes by monkey-patching the fs api
 */
require('./fstream-patch');

var zlib = require('zlib');
var tar = require('tar');
var fs = require('fs');
var fse = require('fs-extra');
var homedir = require('os-homedir');
var path = require('path');
var url = require('url');
var request = require('request');
var spawn = require('cross-spawn');
var info = require('./detect.js');

/*
 * Get the http/https proxy for the give url string from the npm configuration
 * The npm configuration properties are passed into the script as
 * process.env.npm_config_<npm_property_name>
 */
function getProxyFor(urlStr) {

  var urlObj = url.parse(urlStr);

  if (urlObj.protocol === 'http:') {
    // https://www.npmjs.org/doc/misc/npm-config.html#proxy
    return process.env.npm_config_proxy;
  }
  if (urlObj.protocol === 'https:') {
    // https://www.npmjs.org/doc/misc/npm-config.html#https-proxy
    return process.env.npm_config_https_proxy || process.env.npm_config_proxy;
  }
  return null;
}

module.exports = function (url, version, dest, cb) {
  var abi = '';
  if (info.nodeVersion !== undefined) {
    abi = '-abi' + info.nodeVersion;
  }
  var targz = 'loopback-oracle-' + info.platform + '-' + info.arch + abi +
    '-' + (version || info.version) + '.tar.gz';
  if (!url) {
    url = path.join(__dirname, '../../loopback-oracle-builder/build', info.platform, targz);
  } else {
    url = url + '/' + targz;
  }

  console.log('Downloading/Extracting ' + url + '\n');
  if (!dest) {
    dest = './node_modules';
  }
  var gunzip = zlib.createGunzip({chunkSize: 1024 * 1024});
  var src = null;
  if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
    var options = {};
    var proxyUrl = getProxyFor(url);
    if (proxyUrl) {
      console.log('HTTP proxy: ' + proxyUrl);
      options = {
        proxy: proxyUrl
      };
    }
    src = request.get(url, options);
  } else {
    if (fs.existsSync(url)) {
      src = fs.createReadStream(url);
    } else {
      checkPrereqsAndInstallOracledb(url,cb);
    }
  }
  var fileFound = true;
  if (src) {
    src.on('error', function (error) {
      checkPrereqsAndInstallOracledb(url,cb);
    });
    src.on('response', function(response) {
      //pre-packaged tarball not found. Attempt to install oracledb if user has installed oracle pre-requisites offline.
      if (response.statusCode === 404) {
        checkPrereqsAndInstallOracledb(url,cb);
      } else { //pre-packaged tarball found. Extract the tarball.
        src.pipe(gunzip).pipe(tar.Extract({path: dest}))
            .on('end', function() {
              console.log(url + ' is now extracted to ' + dest);
              var err;
              var home = homedir();
              var icDir = path.join(home, 'oracle-instant-client');
              if (!fs.existsSync(icDir)) {
                try {
                  fse.copySync(path.join(dest, 'instantclient'), icDir,
                      {preserveTimestamps: true});
                  console.log('Oracle instant client is installed to %s', icDir);
                } catch (e) {
                  err = e;
                  console.error(e);
                }
              } else {
                console.warn('Oracle instant client found at %s', icDir);
              }
              cb && cb(err);
            }).on('error', function(error) {
          cb && cb(error);
        });
      }
    });
  }
};

function checkPrereqsAndInstallOracledb(url, cb) {
  console.log('Pre-packaged file ' +  url  + ' doesn\'t exist.' + ' Checking if user has installed pre-requisites offline as per instructions in https://github.com/oracle/node-oracledb/blob/master/INSTALL.md' + '\n');
  //can not find the oracle instance client prepackaged tarball.  Check if user has installed offline oracle instance client
  //libraries and necessary pre-reqs as per instructions https://github.com/oracle/node-oracledb/blob/master/INSTALL.md
  if (process.env.OCI_LIB_DIR != null && process.env.OCI_INC_DIR != null) { // check the oracle pre-req variables are set
    //save current working dir
    var currentDir = process.cwd();
    //when loopback-connector-oracle is installed from apiconnect project, loopback-oracle-installer is installed
    //at the same level as loopback-connector-oracle. oracledb should also need to be installed at the same level.
    //traverse to the apiconnct project level and install oracledb. This will also work in loopback-connector-oracle dev env
    //where loopback-oracle-installer is installed as dependent module to loopback-connector-oracle. In this case, oracledb
    //is installed as dependent module of  loopback-connector-oracle.
    var dirName =  path.join(__dirname, '..', '..', '..');
    process.chdir(dirName);
    console.log('Attempting to install oracledb node module under ' + dirName + '.' + ' If the installation fails with errors, please install pre-requisites for oracledb offline as per https://github.com/oracle/node-oracledb/blob/master/INSTALL.md'
        + ' and retry installing loopback-oracle-connector.' + '\n');
    console.log();
    // Spawn NPM asynchronously
    var child = spawn('npm', ['install', 'oracledb', '-depth', '0'], { stdio: 'inherit' });
    //restore back to the orginal working directory. (not sure if this step is needed)
    process.chdir(currentDir);
  } else {
    var notFound = 'Pre-packaged File ' +  url  + ' doesn\'t exist.' + ' User needs to install pre-requisites for oracledb offline as per https://github.com/oracle/node-oracledb/blob/master/INSTALL.md'
        + ' and retry installing loopback-oracle-connector.';
    console.error(notFound);
    cb && cb(notFound);
  }
}

if (require.main === module) {
  module.exports(process.argv[2], process.argv[3]);
}
