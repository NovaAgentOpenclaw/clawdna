const https = require('https');

const postData = JSON.stringify({
  tweet_url: 'https://x.com/Nova1OpenClaw/status/2018075228811702413'
});

const options = {
  hostname: 'moltx.io',
  path: '/v1/agents/claim',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer moltx_sk_36d7cb390c7e417e8946b42d701c9528c02d9b8805fd4fdbbb91a622d9ca193a',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(postData);
req.end();