#!/usr/bin/env npx ts-node
/**
 * BagBot Twitter API Client
 * Full-featured Twitter API v2 client with OAuth 2.0
 * 
 * Usage:
 *   npx ts-node scripts/twitter-api.ts me                      # Get my user info
 *   npx ts-node scripts/twitter-api.ts mentions [limit]        # Get mentions
 *   npx ts-node scripts/twitter-api.ts search "query" [limit]  # Search tweets
 *   npx ts-node scripts/twitter-api.ts tweet "text"            # Post tweet
 *   npx ts-node scripts/twitter-api.ts reply <id> "text"       # Reply to tweet
 *   npx ts-node scripts/twitter-api.ts like <id>               # Like a tweet
 *   npx ts-node scripts/twitter-api.ts timeline [limit]        # Get my timeline
 */

import * as fs from 'fs';
import * as path from 'path';

const credPath = path.join(process.env.HOME!, '.credentials/twitter.env');
const tokenPath = path.join(process.env.HOME!, '.credentials/twitter-tokens.json');

// Load env file
function loadEnv(): Record<string, string> {
  const content = fs.readFileSync(credPath, 'utf-8');
  const env: Record<string, string> = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  });
  return env;
}

interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
}

// Refresh tokens
async function refreshTokens(): Promise<Tokens> {
  const env = loadEnv();
  const tokens: Tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
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
  if (data.error) throw new Error(`Token refresh failed: ${data.error_description || data.error}`);
  
  const newTokens: Tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || tokens.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
    scope: data.scope
  };
  
  fs.writeFileSync(tokenPath, JSON.stringify(newTokens, null, 2));
  console.log('🔄 Token refreshed');
  return newTokens;
}

// Get valid access token
async function getToken(): Promise<string> {
  if (!fs.existsSync(tokenPath)) {
    throw new Error('No tokens found. Run twitter-auth.ts first.');
  }
  
  let tokens: Tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
  
  // Refresh if expired or expiring in 5 min
  if (tokens.expires_at < Date.now() + 300000) {
    tokens = await refreshTokens();
  }
  
  return tokens.access_token;
}

// API request helper
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getToken();
  
  const response = await fetch(`https://api.x.com/2${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  const data = await response.json() as any;
  
  if (!response.ok) {
    throw new Error(`API error (${response.status}): ${JSON.stringify(data)}`);
  }
  
  return data;
}

// BagBot's user ID (cached)
const BAGBOT_USER_ID = '1939335167031861248';

// ============ API Functions ============

export async function getMe() {
  const data = await apiRequest('/users/me?user.fields=public_metrics,description,created_at');
  return data.data;
}

export async function getMentions(limit = 10, sinceId?: string) {
  let endpoint = `/users/${BAGBOT_USER_ID}/mentions?max_results=${Math.min(limit, 100)}`;
  endpoint += '&tweet.fields=created_at,author_id,conversation_id,public_metrics';
  endpoint += '&expansions=author_id';
  endpoint += '&user.fields=username,name';
  if (sinceId) endpoint += `&since_id=${sinceId}`;
  
  const data = await apiRequest(endpoint);
  
  // Map author info to tweets
  const users = new Map(data.includes?.users?.map((u: any) => [u.id, u]) || []);
  const tweets = data.data?.map((t: any) => ({
    ...t,
    author: users.get(t.author_id)
  })) || [];
  
  return tweets;
}

export async function searchTweets(query: string, limit = 10) {
  // min 10, max 100 for search
  const maxResults = Math.max(10, Math.min(limit, 100));
  const endpoint = `/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}`;
  const data = await apiRequest(endpoint + '&tweet.fields=created_at,author_id,public_metrics&expansions=author_id&user.fields=username');
  
  const users = new Map(data.includes?.users?.map((u: any) => [u.id, u]) || []);
  const tweets = data.data?.map((t: any) => ({
    ...t,
    author: users.get(t.author_id)
  })) || [];
  
  return tweets;
}

export async function postTweet(text: string, replyTo?: string) {
  const body: any = { text };
  if (replyTo) body.reply = { in_reply_to_tweet_id: replyTo };
  
  const data = await apiRequest('/tweets', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  
  return {
    id: data.data.id,
    text: data.data.text,
    url: `https://x.com/BagBotx/status/${data.data.id}`
  };
}

export async function likeTweet(tweetId: string) {
  const data = await apiRequest(`/users/${BAGBOT_USER_ID}/likes`, {
    method: 'POST',
    body: JSON.stringify({ tweet_id: tweetId })
  });
  
  return data.data?.liked || false;
}

export async function getTimeline(limit = 10) {
  const endpoint = `/users/${BAGBOT_USER_ID}/tweets?max_results=${Math.min(limit, 100)}`;
  const data = await apiRequest(endpoint + '&tweet.fields=created_at,public_metrics');
  return data.data || [];
}

// ============ CLI ============

function formatTweet(t: any, i: number) {
  const author = t.author?.username || 'unknown';
  const metrics = t.public_metrics;
  const stats = metrics ? ` [❤️${metrics.like_count} 🔁${metrics.retweet_count}]` : '';
  console.log(`\n${i + 1}. @${author}${stats}`);
  console.log(`   ${t.text?.slice(0, 200)}${t.text?.length > 200 ? '...' : ''}`);
  console.log(`   ID: ${t.id} | ${t.created_at || ''}`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  
  try {
    switch (command) {
      case 'me': {
        const user = await getMe();
        console.log('✅ User Info:');
        console.log(`   @${user.username} (${user.name})`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Followers: ${user.public_metrics?.followers_count}`);
        console.log(`   Following: ${user.public_metrics?.following_count}`);
        console.log(`   Tweets: ${user.public_metrics?.tweet_count}`);
        break;
      }
      
      case 'mentions': {
        const limit = parseInt(args[0]) || 10;
        console.log(`📬 Fetching ${limit} recent mentions...`);
        const mentions = await getMentions(limit);
        if (mentions.length === 0) {
          console.log('   No mentions found.');
        } else {
          mentions.forEach(formatTweet);
        }
        break;
      }
      
      case 'search': {
        const query = args[0];
        const limit = parseInt(args[1]) || 10;
        if (!query) {
          console.error('❌ Usage: twitter-api.ts search "query" [limit]');
          process.exit(1);
        }
        console.log(`🔍 Searching: ${query}`);
        const tweets = await searchTweets(query, limit);
        if (tweets.length === 0) {
          console.log('   No results found.');
        } else {
          tweets.forEach(formatTweet);
        }
        break;
      }
      
      case 'tweet': {
        const text = args[0];
        if (!text) {
          console.error('❌ Usage: twitter-api.ts tweet "text"');
          process.exit(1);
        }
        const result = await postTweet(text);
        console.log(`✅ Tweet posted: ${result.url}`);
        break;
      }
      
      case 'reply': {
        const tweetId = args[0];
        const text = args[1];
        if (!tweetId || !text) {
          console.error('❌ Usage: twitter-api.ts reply <tweet_id> "text"');
          process.exit(1);
        }
        const result = await postTweet(text, tweetId);
        console.log(`✅ Reply posted: ${result.url}`);
        break;
      }
      
      case 'like': {
        const tweetId = args[0];
        if (!tweetId) {
          console.error('❌ Usage: twitter-api.ts like <tweet_id>');
          process.exit(1);
        }
        const liked = await likeTweet(tweetId);
        console.log(liked ? `✅ Liked tweet ${tweetId}` : `⚠️ Already liked or failed`);
        break;
      }
      
      case 'timeline': {
        const limit = parseInt(args[0]) || 10;
        console.log(`📜 Fetching ${limit} recent tweets...`);
        const tweets = await getTimeline(limit);
        tweets.forEach(formatTweet);
        break;
      }
      
      default:
        console.log('BagBot Twitter API Client\n');
        console.log('Usage:');
        console.log('  twitter-api.ts me                      # Get my user info');
        console.log('  twitter-api.ts mentions [limit]        # Get mentions');
        console.log('  twitter-api.ts search "query" [limit]  # Search tweets');
        console.log('  twitter-api.ts tweet "text"            # Post tweet');
        console.log('  twitter-api.ts reply <id> "text"       # Reply to tweet');
        console.log('  twitter-api.ts like <id>               # Like a tweet');
        console.log('  twitter-api.ts timeline [limit]        # Get my timeline');
    }
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
