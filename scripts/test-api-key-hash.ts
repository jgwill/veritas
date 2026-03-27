// Test script to verify API key hashing
// Run with: npx ts-node scripts/test-api-key-hash.ts <your-api-key>

import { createHash } from 'crypto';

const testKey = process.argv[2];

if (!testKey) {
  console.log('Usage: npx ts-node scripts/test-api-key-hash.ts <your-api-key>');
  console.log('Example: npx ts-node scripts/test-api-key-hash.ts vk_abc123...');
  process.exit(1);
}

const keyHash = createHash('sha256').update(testKey).digest('hex');

console.log('Input key:', testKey);
console.log('Key prefix:', testKey.substring(0, 10));
console.log('Computed hash:', keyHash);
console.log('\nCompare this hash with what is stored in the api_keys table.');
console.log('If they match, authentication should work.');
