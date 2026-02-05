#!/usr/bin/env npx ts-node
/**
 * Twitter OAuth 2.0 PKCE Authorization Flow
 * 
 * Step 1: Run this script to get the authorization URL
 * Step 2: Open the URL in a browser and authorize
 * Step 3: Copy the code from the redirect URL
 * Step 4: Run with --code=<code> to exchange for tokens
 * 
 * Usage:
 *   npx ts-node scripts/twitter-auth.ts                    # Get auth URL
 *   npx ts-node scripts/twitter-auth.ts --code=<code>      # Exchange code for tokens
 *   npx ts-node scripts/twitter-auth.ts --refresh          # Refresh access token
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Load credentials
const envPath = path.join(process.env.HOME!, '.credentials/twitter.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

// Use OAuth 2.0 credentials (not API keys)
const CLIENT_ID = env.TWITTER_CLIENT_ID || env.TWITTER_CONSUMER_KEY;
const CLIENT_SECRET = env.TWITTER_CLIENT_SECRET || env.TWITTER_CONSUMER_SECRET;
const REDIRECT_URI = 'https://localhost:3000/callback'; // We'll use localhost

// Token file path
const tokenPath = path.join(process.env.HOME!, '.credentials/twitter-tokens.json');

// PKCE helper
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

// Generate state for CSRF protection
function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}

async function getAuthorizationUrl() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();
  
  // Save verifier for later
  fs.writeFileSync(
    path.join(process.env.HOME!, '.credentials/twitter-pkce.json'),
    JSON.stringify({ codeVerifier, state })
  );
  
  const scopes = [
    'tweet.read',
    'tweet.write',
    'users.read',
    'follows.read',
    'like.read',
    'like.write',
    'offline.access'  // For refresh tokens
  ];
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(' '),
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });
  
  const url = `https://x.com/i/oauth2/authorize?${params.toString()}`;
  
  console.log('\n🔐 Twitter OAuth 2.0 Authorization\n');
  console.log('1. Open this URL in your browser:');
  console.log(`\n${url}\n`);
  console.log('2. Authorize the app');
  console.log('3. Copy the "code" parameter from the redirect URL');
  console.log('4. Run: npx ts-node scripts/twitter-auth.ts --code=<your_code>');
  console.log('\n⚠️  The redirect will fail (localhost) - just copy the code from the URL bar');
}

async function exchangeCode(code: string) {
  const pkcePath = path.join(process.env.HOME!, '.credentials/twitter-pkce.json');
  const pkce = JSON.parse(fs.readFileSync(pkcePath, 'utf-8'));
  
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch('https://api.x.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: new URLSearchParams({
      code: code,
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code_verifier: pkce.codeVerifier
    })
  });
  
  const data = await response.json() as any;
  
  if (data.error) {
    console.error('❌ Error:', data.error_description || data.error);
    process.exit(1);
  }
  
  // Save tokens
  const tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
    scope: data.scope,
    updated_at: new Date().toISOString()
  };
  
  fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
  console.log('\n✅ Tokens saved to ~/.credentials/twitter-tokens.json');
  console.log(`   Access token expires: ${new Date(tokens.expires_at).toISOString()}`);
  console.log(`   Scopes: ${tokens.scope}`);
  
  // Cleanup PKCE file
  fs.unlinkSync(pkcePath);
}

async function refreshToken() {
  if (!fs.existsSync(tokenPath)) {
    console.error('❌ No tokens found. Run authorization first.');
    process.exit(1);
  }
  
  const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch('https://api.x.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: new URLSearchParams({
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
      client_id: CLIENT_ID
    })
  });
  
  const data = await response.json() as any;
  
  if (data.error) {
    console.error('❌ Error:', data.error_description || data.error);
    process.exit(1);
  }
  
  // Update tokens
  const newTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || tokens.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
    scope: data.scope,
    updated_at: new Date().toISOString()
  };
  
  fs.writeFileSync(tokenPath, JSON.stringify(newTokens, null, 2));
  console.log('\n✅ Tokens refreshed');
  console.log(`   New expiry: ${new Date(newTokens.expires_at).toISOString()}`);
}

// Main
const args = process.argv.slice(2);
const codeArg = args.find(a => a.startsWith('--code='));
const refreshArg = args.includes('--refresh');

if (codeArg) {
  const code = codeArg.replace('--code=', '');
  exchangeCode(code);
} else if (refreshArg) {
  refreshToken();
} else {
  getAuthorizationUrl();
}
