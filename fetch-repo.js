import https from 'https';
import fs from 'fs';

const url = 'https://api.github.com/repos/Sairamg18814/shvayambhu/contents';
const options = {
  headers: {
    'User-Agent': 'Node.js'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
