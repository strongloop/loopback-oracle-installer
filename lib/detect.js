// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback-oracle-installer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var pkg = require('../package.json');

var platforms = {
  darwin: 'MacOSX',
  linux: 'Linux',
  win32: 'Windows'
};

var archs = {
  ia32: 'x86',
  x64: 'x64'
};

var abi = process.versions.modules;

module.exports = {
  version: pkg.version,
  platform: platforms[process.platform] || process.platform,
  arch: archs[process.arch] || process.arch,
  nodeVersion: abi
};

if (require.main === module) {
  console.log(module.exports);
}
