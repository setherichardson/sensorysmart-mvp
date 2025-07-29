require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

console.log('🧪 Setting up Test Environment for Stripe\n');

console.log('📋 Steps to create test Stripe keys:');
console.log('1. Go to https://dashboard.stripe.com/test/apikeys');
console.log('2. Copy your test publishable key (starts with pk_test_)');
console.log('3. Copy your test secret key (starts with sk_test_)');
console.log('4. Create a test price ID for your subscription\n');

console.log('🔑 Current Environment Variables:');
console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`STRIPE_PRICE_ID: ${process.env.STRIPE_PRICE_ID ? '✅ Set' : '❌ Not set'}`);

console.log('\n📝 To switch to test mode, update your .env.local file with:');
console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key');
console.log('STRIPE_SECRET_KEY=sk_test_your_test_secret_key');
console.log('STRIPE_PRICE_ID=price_your_test_price_id');

console.log('\n💳 Test Card Numbers:');
console.log('• Success: 4242 4242 4242 4242');
console.log('• Decline: 4000 0000 0000 0002');
console.log('• Requires Authentication: 4000 0025 0000 3155');

console.log('\n📅 Test Expiry: Any future date (e.g., 12/25)');
console.log('🔢 Test CVC: Any 3 digits (e.g., 123)');
console.log('📧 Test Email: Any valid email format');

console.log('\n🚀 After updating .env.local, restart your dev server:');
console.log('npm run dev'); 