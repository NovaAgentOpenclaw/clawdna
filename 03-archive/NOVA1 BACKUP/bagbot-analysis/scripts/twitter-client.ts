#!/usr/bin/env npx ts-node
/**
 * Twitter XDK Client for BagBot
 * 
 * Usage:
 *   npx ts-node scripts/twitter-client.ts me                    # Get my user info
 *   npx ts-node scripts/twitter-client.ts mentions              # Get recent mentions
 *   npx ts-node scripts/twitter-client.ts search "query"        # Search tweets
 *   npx ts-node scripts/twitter-client.ts tweet "message"       # Post a tweet (requires user token)
 */

import { Client, type ClientConfig } from '@xdevplatform/xdk';
import * as fs from 'fs';
import * as path from 'path';

// Load credentials
function loadEnv(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const env: Record<string, string> = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  });
  return env;
}

const credPath = path.join(process.env.HOME!, '.credentials/twitter.env');
const tokenPath = path.join(process.env.HOME!, '.credentials/twitter-tokens.json');

const creds = loadEnv(credPath);

// Check for user tokens (needed for posting)
function getUserToken(): string | null {
  if (fs.existsSync(tokenPath)) {
    const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
    if (tokens.expires_at > Date.now()) {
      return tokens.access_token;
    }
    console.warn('⚠️  User token expired. Run twitter-auth.ts --refresh');
  }
  return null;
}

// Create client with bearer token (for read operations)
function createBearerClient(): Client {
  const config: ClientConfig = {
    bearerToken: creds.TWITTER_BEARER_TOKEN
  };
  return new Client(config);
}

// Create client with user token (for write operations)
function createUserClient(): Client | null {
  const token = getUserToken();
  if (!token) {
    console.error('❌ No user token. Run twitter-auth.ts to authorize first.');
    return null;
  }
  const config: ClientConfig = {
    bearerToken: token  // OAuth 2.0 access token
  };
  return new Client(config);
}

async function getMe() {
  const client = createBearerClient();
  try {
    const response = await client.users.getByUsername('BagBotx');
    console.log('✅ User info:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

async function getMentions() {
  const client = createBearerClient();
  try {
    // Get user ID first
    const userResponse = await client.users.getByUsername('BagBotx');
    const userId = userResponse.data?.id;
    
    if (!userId) {
      console.error('❌ Could not get user ID');
      return;
    }
    
    console.log(`📬 Fetching mentions for user ${userId}...`);
    const mentions = await client.users.getMentions(userId, {
      maxResults: 10
    });
    
    console.log('✅ Recent mentions:');
    (mentions as any).data?.forEach((tweet: any, i: number) => {
      console.log(`\n${i + 1}. ${tweet.text?.slice(0, 100)}...`);
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

async function searchTweets(query: string) {
  const client = createBearerClient();
  try {
    console.log(`🔍 Searching for: ${query}`);
    const results = await client.posts.searchRecent(query, {
      maxResults: 10
    });
    
    console.log('✅ Search results:');
    (results as any).data?.forEach((tweet: any, i: number) => {
      console.log(`\n${i + 1}. ${tweet.text?.slice(0, 100)}...`);
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

async function postTweet(text: string) {
  // Note: XDK may not support posting yet - use direct API or browser
  console.log('⚠️  Posting via XDK not yet implemented.');
  console.log('   Use browser automation or direct API for now.');
  console.log(`   Message: ${text}`);
}

// Main
async function main() {
  const [command, ...args] = process.argv.slice(2);
  
  switch (command) {
    case 'me':
      await getMe();
      break;
    case 'mentions':
      await getMentions();
      break;
    case 'search':
      await searchTweets(args.join(' ') || '$BAGBOT');
      break;
    case 'tweet':
      await postTweet(args.join(' '));
      break;
    default:
      console.log('Usage:');
      console.log('  npx ts-node scripts/twitter-client.ts me');
      console.log('  npx ts-node scripts/twitter-client.ts mentions');
      console.log('  npx ts-node scripts/twitter-client.ts search "query"');
      console.log('  npx ts-node scripts/twitter-client.ts tweet "message"');
  }
}

main();
