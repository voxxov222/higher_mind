const http = require('http');
http.get('http://localhost:3000/app/routes/_index.tsx?import', (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => console.log(data));
}).on('error', err => console.log('Error:', err.message));
