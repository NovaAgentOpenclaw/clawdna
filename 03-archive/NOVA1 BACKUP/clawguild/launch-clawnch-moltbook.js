const https = require('https');

const postData = JSON.stringify({
  moltbook_key: "moltbook_sk_Tqjl2KJo-iRnPb4EnBxHd4w81k_cSySb",
  post_id: "e40cdc43-62ef-4518-a12b-fc8913425b27"
});

const options = {
  hostname: 'clawn.ch',
  path: '/api/launch',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    if (res.statusCode === 200 || res.statusCode === 201) {
      try {
        const j = JSON.parse(data);
        if (j.contractAddress) {
          console.log('\\n✅ TOKEN LAUNCHED!');
          console.log('CA:', j.contractAddress);
          console.log('Clanker:', j.clankerUrl);
        }
      } catch (e) {}
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(postData);
req.end();