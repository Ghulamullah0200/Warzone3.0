const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/seed/legendary',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Legendary user seeded successfully!');
      console.log(JSON.parse(data));
    } else {
      console.error(`❌ Failed with status: ${res.statusCode}`);
      console.error(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error requesting seed:', error.message);
  console.log('Ensure the server is running on port 3001');
});

req.end();
