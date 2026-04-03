import dotenv from 'dotenv';
dotenv.config();

import { HiggsfieldClient } from './clients/higgsfield.js';
import { BlotatoClient } from './clients/blotato.js';
import { GSDController } from './controllers/gsd Ralph.js';

const higgsfield = new HiggsfieldClient();
const blotato = new BlotatoClient();
const gsd = new GSDController();

console.log('=== Studex Marketing Factory ===\n');

async function testConnections() {
  console.log('Testing API connections...\n');
  
  try {
    console.log('1. Testing Higgsfield API...');
    const styles = await higgsfield.getSoulStyles();
    console.log('   ✓ Higgsfield connected');
    console.log('   Available styles:', styles.soul_styles?.length || 0);
  } catch (e) {
    console.log('   ✗ Higgsfield error:', e.message);
  }

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
  
  const profile = await higgsfield.createInfluencerProfile(
    'Alex',
    'Young professional, trendy, urban lifestyle, startup founder vibe',
    'realistic'
  );
  
  console.log('Profile created:', profile);
  
  const imageResult = await higgsfield.generateInfluencerImage(profile, 'coffee shop, modern, Instagram photo');
  console.log('\nGenerated image result:', imageResult);
  
  return imageResult;
}

async function postToSocialMedia() {
  console.log('\n=== Posting to Social Media ===\n');
  
  const content = {
    text: '🚀 New virtual influencer coming soon! #AI #Marketing #Studex',
    mediaUrls: ['https://example.com/test-image.jpg']
  };
  
  const result = await blotato.postToMultiplePlatforms(content, ['twitter', 'instagram']);
  console.log('Post results:', result);
  
  return result;
}

async function runAutoMode() {
  console.log('\n=== Starting GSD + Ralph Auto Mode ===\n');
  
  const profile = await higgsfield.createInfluencerProfile('Sarah', 'Fitness influencer, healthy lifestyle', 'realistic');
  
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