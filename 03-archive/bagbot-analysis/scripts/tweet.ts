#!/usr/bin/env npx ts-node
/**
 * Post a tweet via Twitter API
 * 
 * Usage:
 *   npx ts-node scripts/tweet.ts "Your tweet text here"
 *   npx ts-node scripts/tweet.ts --reply=<tweet_id> "Reply text"
 */

import * as fs from 'fs';
import * as path from 'path';

const tokenPath = path.join(process.env.HOME!, '.credentials/twitter-tokens.json');

interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
}

async function refreshTokens(): Promise<Tokens> {
  const envPath = path.join(process.env.HOME!, '.credentials/twitter.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  });
  
  const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
  const credentials = Buffer.from(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch('https://api.x.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: new URLSearchParams({
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
      client_id: env.TWITTER_CLIENT_ID
    })
  });
  
  const data = await response.json() as any;
  
  if (data.error) {
    throw new Error(`Token refresh failed: ${data.error_description || data.error}`);
  }
  
  const newTokens: Tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || tokens.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
    scope: data.scope
  };
  
  fs.writeFileSync(tokenPath, JSON.stringify(newTokens, null, 2));
  return newTokens;
}

async function getValidToken(): Promise<string> {
  if (!fs.existsSync(tokenPath)) {
    throw new Error('No tokens found. Run twitter-auth.ts first.');
  }
  
  let tokens: Tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
  
  // Refresh if expired or expiring in next 5 minutes
  if (tokens.expires_at < Date.now() + 300000) {
    console.log('🔄 Refreshing token...');
    tokens = await refreshTokens();
  }
  
  return tokens.access_token;
}

interface TweetOptions {
  replyTo?: string;
  quoteTweet?: string;
}

export async function tweet(text: string, options: TweetOptions = {}): Promise<{ id: string; url: string }> {
  const token = await getValidToken();
  
  const body: any = { text };
  
  if (options.replyTo) {
    body.reply = { in_reply_to_tweet_id: options.replyTo };
  }
  
  if (options.quoteTweet) {
    body.quote_tweet_id = options.quoteTweet;
  }
  
  const response = await fetch('https://api.x.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  const data = await response.json() as any;
  
  if (!response.ok) {
    throw new Error(`Tweet failed (${response.status}): ${JSON.stringify(data)}`);
  }
  
  const tweetId = data.data.id;
  const url = `https://x.com/BagBotx/status/${tweetId}`;
  
  return { id: tweetId, url };
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npx ts-node scripts/tweet.ts "Your tweet text"');
    console.log('       npx ts-node scripts/tweet.ts --reply=<id> "Reply text"');
    process.exit(1);
  }
  
  let replyTo: string | undefined;
  let text = '';
  
  for (const arg of args) {
    if (arg.startsWith('--reply=')) {
      replyTo = arg.replace('--reply=', '');
    } else {
      text = arg;
    }
  }
  
  if (!text) {
    console.error('❌ No tweet text provided');
    process.exit(1);
  }
  
  try {
    const result = await tweet(text, { replyTo });
    console.log(`✅ Tweet posted: ${result.url}`);
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
