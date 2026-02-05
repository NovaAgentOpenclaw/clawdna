const https = require('https');

https.get('https://clawn.ch/api/launches?limit=200', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const token = json.launches.find(l => l.symbol === 'CLAWGUILD');
      if (token) {
        console.log('✅ CLAWGUILD FOUND!');
        console.log('CA:', token.contractAddress);
        console.log('Clanker URL:', token.clankerUrl);
        console.log('Launched at:', token.launchedAt);
      } else {
        console.log('❌ CLAWGUILD not found yet');
        const recent = json.launches.slice(0, 5).map(l => l.symbol + '@' + l.launchedAt);
        console.log('Recent launches:', recent);
      }
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    }
  });
}).on('error', e => console.error('Request error:', e.message));