var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');

var info = require('./lib/detect');
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
  } catch(err) {
    // Ignore
  }
}

// First download the archive
download(url, version, dest, function(err, result) {
  if (err) {
    process.exit(1);
  }

  // Now try to run post-installation scripts
  var inst_dir = path.dirname(process.argv[1]);

  var installer = path.join(inst_dir, 'bin/installers', info.platform, 'installer.sh');
  var icdir;
  if (dest) {
    icdir = path.join(dest, 'instantclient');
  } else {
    // First check the child module
    icdir = path.join(inst_dir, 'node_modules/instantclient');
    if (!fs.existsSync(icdir)) {
      // Now the peer module
      icdir = path.join(inst_dir, '../instantclient');
    }
  }

  var args = [ installer, icdir ];
  var cmd = '/bin/sh';

// console.log('DEBUG: Running command %s %s = ', installer, args);
  if (process.platform === 'win32') {
    installer = path.join(inst_dir, 'bin/installers/Windows/installer.bat');
    args = ['/c', installer];
    cmd = 'cmd';
  }
  var child = spawn(cmd, args, {stdio: 'inherit'});
  child.on('exit', function () {
    process.exit(child.exitCode);
  });
});

