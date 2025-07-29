require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

console.log('💰 Creating Test Stripe Price ID\n');

// Check if we have test keys
const hasTestKeys = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');

if (!hasTestKeys) {
  console.log('❌ You need to set up test Stripe keys first!');
  console.log('1. Go to https://dashboard.stripe.com/test/apikeys');
  console.log('2. Copy your test secret key (starts with sk_test_)');
  console.log('3. Update your .env.local file');
  console.log('4. Run this script again');
  process.exit(1);
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function createTestPrice() {
  try {
    console.log('Creating test price for $9.99/month subscription...');
    
    const price = await stripe.prices.create({
      unit_amount: 999, // $9.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      product_data: {
        name: 'Sensory Smart MVP - Test Subscription',
        description: 'Test subscription for Sensory Smart MVP',
      },
    });

    console.log('✅ Test price created successfully!');
    console.log(`Price ID: ${price.id}`);
    console.log('\n📝 Add this to your .env.local file:');
    console.log(`STRIPE_PRICE_ID=${price.id}`);
    
    console.log('\n🔗 You can also create it manually in the Stripe Dashboard:');
    console.log('1. Go to https://dashboard.stripe.com/test/products');
    console.log('2. Create a new product');
    console.log('3. Add a recurring price of $9.99/month');
    console.log('4. Copy the price ID (starts with price_)');
    
  } catch (error) {
    console.error('❌ Error creating test price:', error.message);
  }
}

createTestPrice(); 