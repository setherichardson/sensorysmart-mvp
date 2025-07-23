require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Debug environment variables
console.log('Environment check:');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkBillingStatus() {
  console.log('🔍 Checking billing status for all users...\n');

  try {
    // Get all users from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    console.log(`Found ${profiles.length} total users\n`);

    const usersWithoutBilling = [];
    const usersWithBilling = [];

    for (const profile of profiles) {
      console.log(`Checking user: ${profile.email || profile.id}`);
      
      // Check if user has a Stripe customer record
      const customers = await stripe.customers.list({
        email: profile.email,
        limit: 1,
      });

      let hasStripeCustomer = customers.data.length > 0;
      let hasActiveSubscription = false;
      let subscriptionDetails = null;

      if (hasStripeCustomer) {
        const customer = customers.data[0];
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
        });
        
        hasActiveSubscription = subscriptions.data.length > 0;
        subscriptionDetails = subscriptions.data[0] || null;
      }

      const userInfo = {
        id: profile.id,
        email: profile.email,
        child_name: profile.child_name,
        created_at: profile.created_at,
        hasStripeCustomer,
        hasActiveSubscription,
        subscriptionDetails,
        daysSinceCreated: Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      };

      if (!hasStripeCustomer || !hasActiveSubscription) {
        usersWithoutBilling.push(userInfo);
        console.log(`❌ NO BILLING: ${profile.email} (${userInfo.daysSinceCreated} days old)`);
      } else {
        usersWithBilling.push(userInfo);
        console.log(`✅ HAS BILLING: ${profile.email}`);
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log(`Total users: ${profiles.length}`);
    console.log(`Users with billing: ${usersWithBilling.length}`);
    console.log(`Users without billing: ${usersWithoutBilling.length}`);

    if (usersWithoutBilling.length > 0) {
      console.log('\n🚨 USERS WITHOUT BILLING (need manual reset):');
      console.log('='.repeat(80));
      
      usersWithoutBilling.forEach(user => {
        console.log(`\nUser ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Child Name: ${user.child_name}`);
        console.log(`Created: ${user.created_at} (${user.daysSinceCreated} days ago)`);
        console.log(`Has Stripe Customer: ${user.hasStripeCustomer}`);
        console.log(`Has Active Subscription: ${user.hasActiveSubscription}`);
        console.log('-'.repeat(40));
      });

      console.log('\n💡 RECOMMENDED ACTIONS:');
      console.log('1. For users without Stripe customer: They need to go through billing flow');
      console.log('2. For users with Stripe customer but no active subscription: Check if trial expired');
      console.log('3. Consider adding a billing_required flag to profiles table');
    }

    // Export the data for manual review
    const fs = require('fs');
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: profiles.length,
        withBilling: usersWithBilling.length,
        withoutBilling: usersWithoutBilling.length
      },
      usersWithoutBilling,
      usersWithBilling
    };

    fs.writeFileSync('exports/billing-status-report.json', JSON.stringify(exportData, null, 2));
    console.log('\n📄 Detailed report saved to: exports/billing-status-report.json');

  } catch (error) {
    console.error('Error checking billing status:', error);
  }
}

// Run the check
checkBillingStatus(); 