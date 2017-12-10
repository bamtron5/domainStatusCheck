const exec = require('child_process').exec;

function getWho() {
  return new Promise((resolve, reject) => {
    return exec(`whois ${process.argv[2]}`, function(err, stdout, stderr) {
      if (stderr || err) return reject({stderr, err});
      return resolve(stdout);
    });
  });
}

getWho()
  .then(res => console.log(res))
  .catch(e => console.log(e));