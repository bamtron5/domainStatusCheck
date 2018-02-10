const exec = require('child_process').exec;
import * as fs from 'fs';
import * as notifier from 'node-notifier';
import * as moment from 'moment';
import * as nodemailer from 'nodemailer';

let result = null;
let filter = null;
let text = null;
const fileName = 'status.txt';
// const interval = 1000 * 60 * 60; // every hr
const interval = 1000 * 60; // every 1 min

function getWho() {
  return new Promise((resolve, reject) => {
    return exec(`whois ${process.argv[2]}`, function(err, stdout, stderr) {
      if (stderr || err) return reject({stderr, err});
      result = stdout;
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
      notify();
      exec(`rm ${fileName}`); // just remove it and it will recheck on next pass
    } else {
      console.log(`${process.argv[2]} domain status is the same`);
      console.log(`next run at ${moment().add(interval).format('LLLL')}`);
    }
  });
}

function notify() {
  const message = `${process.argv[2]} has a status change. ${text}`;
  const title = 'DOMAIN STATUS CHANGE';

  console.log(message);
  console.log(`next run at ${moment().add(interval).format('LLLL')}`);

  notifier.notify({
    title,
    message
  });

  nodemailer.createTestAccount((err, account) => {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP,
      port: 587,
      secure: false,
      auth: {
        user: process.env.FROM,
        pass: process.env.PW
      }
    });

    let mailOptions = {
      from: process.env.FROM,
      to: process.env.TO,
      subject: title,
      text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    });
  });
}

async function init() {
  try {
    const whoRes = await getWho();
    const statusRes = await getStatus();
    const evaluateRes = await evaluateFile();
  } catch(e) {
    console.log(e);
  }
}

init();

setInterval(() => {
  init();
}, interval);