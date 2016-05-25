// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback-oracle-installer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var path = require('path');
var download = require('./lib/download');

var url = process.argv[2] || process.env.LOOPBACK_ORACLE_URL;
var dest = process.argv[3];
var version = null;

if (!dest) {
  // Check if it is within the loopback-connector-oracle node_modules
  var connectorPath;
  try {
    var connector = require.resolve('loopback-connector-oracle');
    connectorPath = path.dirname(connector);
    dest = path.normalize(path.join(connectorPath, '..'));
    // Find the package.json for loopback-connector-oracle
    var pkg = require(path.join(connectorPath, 'package.json'));
    if (pkg.config && pkg.config.oracleUrl) {
      // Allow env var to override config.oracleUrl
      url = url || pkg.config.oracleUrl;
      version = pkg.config.oracleVersion;
    }
  } catch (err) {
    try {
      // Now assume the installer is dep of loopback-connector-oracle
      var pkg = require(path.join(__dirname, '../../package.json'));
      if (pkg.config && pkg.config.oracleUrl) {
        // Allow env var to override config.oracleUrl
        url = url || pkg.config.oracleUrl;
        version = pkg.config.oracleVersion;
        dest = path.normalize(path.join(__dirname, '..'));
      }
    } catch (err) {
      // Ignore
    }
  }
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
  download(url, version, dest, function(err, result) {
    if (err) {
      process.exit(1);
    }
  });
}


