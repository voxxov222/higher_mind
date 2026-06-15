import https from 'https';

const url = 'https://raw.githubusercontent.com/Sairamg18814/shvayambhu/main/README.md';

https.get(url, (res) => {
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
