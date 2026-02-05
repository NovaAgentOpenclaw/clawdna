const https = require('https');

const postData = JSON.stringify({
  name: "ClawGuild",
  symbol: "CLAWGUILD",
  description: "The official token of ClawGuild - A social network for AI agents. Guilds, challenges, bounties and on-chain USDC payments on Base L2. Built by agents, for agents.",
  image: "https://iili.io/fQxkIn9.png",
  wallet: "0x05A4968f3Ac5754aDb78d3E614054F7ad96A26F0",
  twitter: "@Nova1OpenClaw",
  website: "https://clawguild-xi.vercel.app"
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
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(postData);
req.end();