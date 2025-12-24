const { spawn } = require('child_process');
const fs = require('fs');

const build = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'build'], {
    stdio: ['ignore', 'pipe', 'pipe']
});

const log = fs.createWriteStream('build_debug.log');

build.stdout.pipe(log);
build.stderr.pipe(log);

build.on('close', (code) => {
    console.log(`Build exited with code ${code}`);
    log.end();
});
