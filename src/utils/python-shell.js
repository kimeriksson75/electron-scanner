const { resolve } = require('path');
const { PythonShell } = require('python-shell');

const awaitScan = async () => {
    return new Promise((resolve, reject) => {
        let result;
        let pyshell = new PythonShell('./src/python/reader.py');
        
        pyshell.on('message', function (message) {
            console.log('message', message);
            resolve(message);
        });
        
        pyshell.on('stderr', function (stderr) {
          console.log(stderr);
        });
        
        pyshell.end(function (err, code, signal) {
          if (err) reject(err);
          console.log('The exit code was: ' + code);
          console.log('The exit signal was: ' + signal);
          console.log('finished');
          resolve(result);
        });
        
      });
}

module.exports = {
    awaitScan,
}