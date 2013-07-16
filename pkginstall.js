var spawn = require('child_process').spawn;
var path = require('path');

var inst_dir = path.dirname(process.argv[1] );
var script = path.basename(process.argv[1] ).replace('\.js', '\.sh');

var installer = path.join(inst_dir, 'bin', script);
var args = [ '-d', '3' ];

// console.log('DEBUG: Running command %s %s = ', installer, args);
if(process.platform === 'win32') {
  installer = path.join(inst_dir, 'bin/installers/Windows/installer.bat');
  args = ['/s', '/c', installer];
  installer = 'cmd';
}
var child = spawn(installer, args, {stdio: 'inherit'});
child.on('exit', function() {
  // console.log('DEBUG: %s exited: %s', installer, JSON.stringify(child) );
  process.exit(child.exitCode);
});

