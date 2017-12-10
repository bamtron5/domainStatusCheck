const exec = require('child_process').exec;
import * as fs from 'fs';
import * as notifier from 'node-notifier';
import * as moment from 'moment';

let result = null;
let filter = null;
let text = null;
const interval = 1000 * 60 * 60; // every hr

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
    text = filter.join('/n');
    return resolve();
  });
}

function writeFile() {
  return new Promise((resolve) => {
    text = filter.join('/n');
    return fs.writeFile('status.txt', text, (res) => {
      return resolve();
    });
  });
}

function readFile() {
  return new Promise((resolve, reject) => {
    fs.stat('status.txt', (err, stats) => {
      if (err) {
        writeFile()
          .then(() => {
            return resolve();
          });
      } else {
        fs.readFile('status.txt', 'utf8', (err, data) => {
          if (text !== data) {
            // Object
            notifier.notify({
              'title': `DOMAIN STATUS CHANGE`,
              'message': `${process.argv[2]} has a status change`
            });

            exec('rm status.txt', function(err, stdout, stderr) {
              //null;
              // remove file so it can be written with the next status
            });
          } else {
            //null;
            console.log(`${process.argv[2]} domain status is the same`);
            console.log(`next run in ${moment().add(interval).format('LLLL')}`);
          }
        });
      }
    });
  });
}

function init() {
  getWho()
    .then((res) => {
      result = res;
      return getStatus();
    })
    .catch(e => console.log(e))
    .then((res) => readFile())
    .catch(e => console.log(e));
}

init();

setInterval(() => {
  init();
}, interval);