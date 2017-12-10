const exec = require('child_process').exec;
import * as fs from 'fs';
import * as notifier from 'node-notifier';
import * as moment from 'moment';

let result = null;
let filter = null;
let text = null;
const fileName = 'status.txt';
const interval = 1000 * 60 * 60; // every hr

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
    text = filter.join('/n');
    return resolve();
  });
}

function writeFile() {
  return new Promise((resolve) => {
    text = filter.join('/n');
    return fs.writeFile(fileName, text, (res) => {
      return resolve();
    });
  });
}

function evaluateFile() {
  return new Promise((resolve, reject) => {
    fs.stat(fileName, (err, stats) => {
      if (err) {
        writeFile()
          .then(() => {
            console.log(`${fileName} written.`);
            return resolve();
          });
      } else {
        readFile();
      }
    });
  });
}

function readFile() {
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (text !== data) {
      const msg = `${process.argv[2]} has a status change`;
      // Object
      notifier.notify({
        'title': `DOMAIN STATUS CHANGE`,
        'message': msg
      });

      exec(`rm ${fileName}`); // just remove it and it will recheck on next pass

      console.log(msg);
    } else {

      console.log(`${process.argv[2]} domain status is the same`);
      console.log(`next run at ${moment().add(interval).format('LLLL')}`);
    }
  });
}

function init() {
  getWho()
    .then((res) => {
      result = res;
      return getStatus();
    })
    .catch(e => console.log(e))
    .then((res) => evaluateFile())
    .catch(e => console.log(e));
}

init();

setInterval(() => {
  init();
}, interval);