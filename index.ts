const exec = require('child_process').exec;
import * as fs from 'fs';
let result = null;
let filter = null
const domainStatus = [];

function getWho() {
  return new Promise((resolve, reject) => {
    return exec(`whois ${process.argv[2]}`, function(err, stdout, stderr) {
      if (stderr || err) return reject({stderr, err});
      return resolve(stdout);
    });
  });
}

function getStatus() {
  return new Promise((resolve, reject) => {
    const lines = result.split('\n');
    filter = lines.filter(line => line.indexOf('Domain Status:') > -1);
    return resolve(filter.join('/n'));
  });
}

function writeFile() {

}

function readFile() {
  return new Promise((resolve, reject) => {
    fs.stat('status.txt', (err, stats) => {
      if (err) return fs.writeFile('status.txt', filter);
      console.log(stats);
      return resolve();
    });
  });
}

getWho()
  .then((res) => {
    result = res;
    return getStatus();
  })
  .catch(e => console.log(e))
  .then((res) => readFile())
  .catch(e => console.log(e));
