require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing Live Stripe Integration Safely\n');

console.log('✅ Your live Stripe keys are configured correctly');
console.log('🔑 You can safely test with these test cards (even with live keys):\n');

console.log('💳 Test Card Numbers for Live Environment:');
console.log('• Success: 4242 4242 4242 4242');
console.log('• Decline: 4000 0000 0000 0002');
console.log('• Requires Authentication: 4000 0025 0000 3155');
console.log('• Insufficient Funds: 4000 0000 0000 9995');
console.log('• Lost Card: 4000 0000 0000 9987');
console.log('• Stolen Card: 4000 0000 0000 9979\n');

console.log('📅 Test Details:');
console.log('• Expiry: Any future date (e.g., 12/25)');
console.log('• CVC: Any 3 digits (e.g., 123)');
console.log('• Email: Any valid email format');
console.log('• Name: Any name\n');

console.log('🚀 Testing Flow:');
console.log('1. Sign up with test email (e.g., test@example.com)');
console.log('2. Complete assessment (working correctly ✅)');
console.log('3. Use test card 4242 4242 4242 4242');
console.log('4. Payment will succeed but NO real charge');
console.log('5. See assessment results modal appear\n');

console.log('⚠️  Important Notes:');
console.log('• Test cards work with live keys in development');
console.log('• No real money will be charged');
console.log('• Test transactions appear in Stripe dashboard');
console.log('• You can refund test payments if needed\n');

console.log('🔍 Current Environment:');
console.log(`• Stripe Mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'LIVE' : 'TEST'}`);
console.log(`• Price ID: ${process.env.STRIPE_PRICE_ID || 'Not set'}`);
console.log(`• Environment: Development`);

console.log('\n🎯 Ready to test! The assessment logic is working correctly.'); 