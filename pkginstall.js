// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback-oracle-installer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var path = require('path');
var download = require('./lib/download');

var url = process.argv[2] || process.env.LOOPBACK_ORACLE_URL;
var dest = process.argv[3];
var version = null;
var oracledbModule = null;

if (typeof dest === 'undefined' || dest == null) {
  var connector = false;
  var oracleConnectorPath;

  //find the directory of oracle-cocnnector-installer
  var installerIndex = require.resolve('.');
  installerPath = path.dirname(installerIndex);

  try {
    //loopback-connector-oracle can be resolved only in apiconnect project env where loopback-connector-oracle
    //is a pier module of loopback-oracle-installer
    var connector = require.resolve('loopback-connector-oracle');
    oracleConnectorPath = path.dirname(connector);
    connector = true;
  } catch (err) {
    //check if parent module is loopback-connector-oracle for loopback-oracler-installer by traversing to /loopback-oracler-installer/../../loopback-connector-oracle
    var parentDir = path.dirname(path.join(installerPath, '..'));
    if (parentDir.includes('loopback-connector-oracle')) {
      //this is a dev env usecase where developer has checked out loopback-connector-oracle repo for dev/test.
      //In this case loopback-connector-oracle exists as a parent of loopback-oracler-installer.
      //traverse to loopback-connector-oracle installation location
      oracleConnectorPath = parentDir;
      connector = true;
    } else {
      //this is a dev env usecase where developer has checked out loopback-oracler-installer repo for dev/test.
      connector = false;
    }
  }
  //calculate the location to install 'oracledb' node module
  if (connector) { //loopback-connector-oracle is either a pier or a parent module of loopback-oracle-installer.
      //In apiconnect project env and loopback-connector-oracle dev env, oracledb will be
      //installed under /loopback-connector-oracle/node_modules
      dest = path.normalize(path.join(oracleConnectorPath, 'node_modules'));
  } else { //loopback-connector-oracle is neither a pier nor a parent module of loopback-oracle-installer.
      //This is just a loopback-oracle-installer dev env. Install oracledb under loopback-oracle-installer/node_modules.
      dest = path.normalize(path.join(installerPath, 'node_modules'));
  }

  // Find the package.json for loopback-oracle-installer
  var pkg = require(path.join(installerPath, 'package.json'));
  if (pkg.config && pkg.config.oracleUrl) {
    // Allow env var to override config.oracleUrl
    url = url || pkg.config.oracleUrl;
    version = pkg.config.oracleVersion;
    oracledbModule = pkg.config.driverModule;
  }

  var installValues =  "Installation values -> oracledb location: " + dest + ' Prepackaged tarball url: ' + url + "  oracleversion: " + version + " oracledbmodule: " + oracledbModule;
  console.log(installValues);
}

var downloadRequired = false;
try {
  if (!process.env.npm_config_force) {
    var found = require.resolve('oracledb');
    console.log('** Skipping oracledb as it already exists at %s)', path.dirname(found));
    console.log('** To force download and re-installation, run npm install -f.');
  } else {
    downloadRequired = true;
  }
} catch (e) {
  downloadRequired = true;
}

if (downloadRequired) {
  // First download the archive
  download(url, version, dest, oracledbModule, function(err, result) {
    if (err) {
      process.exit(1);
    }
  });
}


