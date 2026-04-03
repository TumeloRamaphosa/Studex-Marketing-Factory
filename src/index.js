import dotenv from 'dotenv';
dotenv.config();

import { BlotatoClient } from './clients/blotato.js';
import { GSDController } from './controllers/gsd Ralph.js';
import ImageGenerator from './clients/imageGenerator.js';

const imageGen = new ImageGenerator();
const blotato = new BlotatoClient();
const gsd = new GSDController();

console.log('=== Studex Marketing Factory ===\n');

async function testConnections() {
  console.log('Testing API connections...\n');
  
  console.log('1. Testing Image Generator (Higgsfield)...');
  const provider = process.env.IMAGE_PROVIDER || 'higgsfield';
  console.log(`   Provider: ${provider}`);
  console.log(`   Status: ${provider === 'higgsfield' ? 'Ready (fallback to Pollinations if down)' : 'Using Replicate'}`);

  try {
    console.log('\n2. Testing Blotato API...');
    const accounts = await blotato.getAccounts();
    console.log('   ✓ Blotato connected');
    console.log('   Accounts:', accounts.accounts?.length || 0);
  } catch (e) {
    console.log('   ✗ Blotato error:', e.message);
  }
}

async function createVirtualInfluencer() {
  console.log('\n=== Creating Virtual Influencer ===\n');
  
  const profile = {
    name: 'Alex',
    description: 'Young professional, trendy, urban lifestyle, startup founder vibe',
    style: 'realistic'
  };
  
  console.log('Profile:', profile);
  
  const result = await imageGen.generateInfluencerImage(profile, 'coffee shop, modern, Instagram photo');
  console.log('\nGenerated image result:');
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

async function postToSocialMedia() {
  console.log('\n=== Posting to Social Media ===\n');
  
  const content = {
    text: '🚀 New virtual influencer coming soon! #AI #Marketing #Studex',
    mediaUrls: ['https://image.pollinations.ai/prompt/AI%20influencer?width=1024&height=1536&nologin=true']
  };
  
  const result = await blotato.postToMultiplePlatforms(content, ['twitter', 'instagram']);
  console.log('Post results:', result);
  
  return result;
}

async function runAutoMode() {
  console.log('\n=== Starting GSD + Ralph Auto Mode ===\n');
  
  const profile = {
    name: 'Sarah',
    description: 'Fitness influencer, healthy lifestyle, gym enthusiast',
    style: 'realistic'
  };
  
  gsd.createContentJob(profile, 'gym workout', ['twitter', 'instagram']);
  
  await gsd.start(true, 60000);
  
  console.log('\nGSD Status:', gsd.getStatus());
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === 'test') {
    await testConnections();
  } else if (args[0] === 'create-influencer') {
    await createVirtualInfluencer();
  } else if (args[0] === 'post') {
    await postToSocialMedia();
  } else if (args[0] === 'auto') {
    await runAutoMode();
  } else {
    console.log('Usage:');
    console.log('  node src/index.js test           - Test API connections');
    console.log('  node src/index.js create-influencer - Create virtual influencer');
    console.log('  node src/index.js post          - Post to social media');
    console.log('  node src/index.js auto          - Start auto mode (GSD + Ralph)');
  }
}

main().catch(console.error);