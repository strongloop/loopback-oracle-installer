var zlib = require('zlib');
var tar = require('tar');
var fs = require('fs');
var request = require('request');

module.exports = function(url, dest) {
  if(!dest) {
    dest = './node_modules';
  }
  var gunzip = zlib.createGunzip();
  var src = null;
  if(url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
    src = request.get(url);
  } else {
    src = fs.createReadStream(url);
  }
  src.pipe(gunzip).pipe(tar.Extract({ path: dest }))
    .on('end', function() {
      console.log(url + ' is now extracted to ' + dest);
  });
}

if(require.main === module) {
  module.exports(process.argv[2], process.argv[3]);
}
