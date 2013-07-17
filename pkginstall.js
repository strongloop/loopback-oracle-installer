var spawn = require('child_process').spawn;
var path = require('path');

var info = require('./lib/detect');
var download = require('./lib/download');

// First download the archive
download(process.argv[2], process.argv[3], function (err, result) {
    if(err) {
        process.exit(1);
    }

    // Now try to run post-installation scripts
    var inst_dir = path.dirname(process.argv[1]);

    var installer = path.join(inst_dir, 'bin/installers', info.platform, 'installer.sh');
    var args = [ path.join(inst_dir, 'node_modules/instantclient') ];

// console.log('DEBUG: Running command %s %s = ', installer, args);
    if (process.platform === 'win32') {
        installer = path.join(inst_dir, 'bin/installers/Windows/installer.bat');
        args = ['/s', '/c', installer];
        installer = 'cmd';
    }
    var child = spawn(installer, args, {stdio: 'inherit'});
    child.on('exit', function () {
        process.exit(child.exitCode);
    });
});

