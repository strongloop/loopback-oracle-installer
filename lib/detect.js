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
if (pkg.config &&
  (pkg.config.excludeAbi === true || pkg.config.excludeAbi === abi)) {
  abi = undefined;
}

module.exports = {
  version: pkg.version,
  platform: platforms[process.platform] || process.platform,
  arch: archs[process.arch] || process.arch,
  nodeVersion: abi
};

if (require.main === module) {
  console.log(module.exports);
}
