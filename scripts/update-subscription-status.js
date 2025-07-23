require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateSubscriptionStatus() {
  console.log('🔄 Updating subscription status for users without billing...\n');

  // List of user IDs who need to be set to inactive (from the billing report)
  const usersToUpdate = [
    'a6909889-d36f-4e3b-990c-9bd2d9a001eb', // autumnnorman25@gmail.com
    '36697a20-ed80-4262-adb8-61083169c8a6', // hall.lexi22@gmail.com
    '9096e7c5-c596-4e42-b8e6-9aa91ccdf218', // hi+22@sethrichardsondesign.com
    '9cd1a5e5-ca4b-43fc-9b69-7dffe2591402', // claudiaye2012@hotmail.com
    '84fadd24-ebf2-4e93-8d03-28f738145950', // kmvokes@svsu.edu
    'a4e968b9-a94a-4839-869b-66dda1f42194', // hi+61@sethrichardsondesign.com
    '29285f8a-c2e8-46d8-bbf2-79f8288970d1', // faithbabe@gmail.com
    'ef5e64d2-9748-46da-982d-2edd56f064b9', // jamielmiller31@gmail.com
    'f16be78b-5313-4db3-b529-6451914f35b6', // vvegueria@gmail.com
    '39aa39f9-3d93-4f9f-8b4f-42dd443b25bd', // traceyjh13@yahoo.com
    '5e0dd6a0-4942-4be2-9a8a-84391ef006d5', // rachelpotter322@gmail.com
    'e2233534-9ba6-4c4f-b502-2a5efb3abadf', // ashley.m.redmond@gmail.com
    '18dc3220-39dc-42d8-8a3c-2ac87b59ea7b', // lexipike0121@gmail.com
    '3bf0376b-7cd6-4847-9558-0ffd3ffe9ced', // funmail@gmail.com
    '3e8b580b-b2a0-4757-86c0-c0d0c26e040f', // h@gmail.com
    'e8dc4fca-5d21-4631-a0a8-872b5f3ace62', // hi+11@sethrichardsondesign.com
    '02ae847d-85ce-4d5b-a99c-8569b64d4de0', // hey+1@sethrichardsondesign.com
    '21aa4bb9-c6d5-48b4-aba3-3f1931d0df98', // seth+6@sethrichardsondesign.com
    '87d96838-20fd-4e9e-8de9-800b27efcfc8', // seth+5@sethrichardsondesign.com
    '69da5ac7-ab1e-405a-9f48-95475b12b106', // seth+2@sethrichardsondesign.com
    'f2a93165-3e98-40e7-9d60-42bf71257be4', // seth+1@getsensorysmart.com
    'eb2b0639-eb7b-4444-a7f9-c8117c69532e', // seth+1@sethrichardsondesign.com
    '6052b7fe-cc81-4bbd-852f-a55e8d8bb450', // hi+5@sethrichardsondesign.com
    '3aa70e50-e90e-4221-91a7-6f31c75aaad2', // hi+4@sethrichardsondesign.com
    'a1955900-1b9e-42c5-a06b-98c1c3afae9c', // hi+3@sethrichardsondesign.com
    'd76dc647-da7d-4375-948d-9b4d321f92cd', // bellemail610@gmail.com
    '13fa3554-b6ab-449f-aae6-e6071020f43c', // hi+1@sethrichardsondesign.com
    '24631eff-b582-41c4-add6-b89d7442c621', // hey+123@sethrichardsondesign.com
    'c0433d00-ebd0-4c58-97e8-079c3d04f60e', // eilla@gmail.com
    '29b85d87-d5dd-4ed8-b1c7-93d793de0a50', // htes@srichardson.com
    'fd7874b5-dbf5-4d5a-8b5e-1f26c9ebe1b9', // srich@gmail.com
    '627108b9-f9cf-46cb-a423-7e77edd007a8', // srichardson@yahoo.com
    'de07e52c-9ebf-41c4-ac57-abd54edfeb43', // srich@usebasepoint.com
    '835e78e9-05ab-4b60-b8a0-109eb492627d'  // team@usebasepoint.com
  ];

  console.log(`Found ${usersToUpdate.length} users to update\n`);

  try {
    // Update all users to inactive status
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        subscription_status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .in('id', usersToUpdate);

    if (error) {
      console.error('❌ Error updating users:', error);
      return;
    }

    console.log(`✅ Successfully updated ${usersToUpdate.length} users to inactive status`);
    console.log('\n📋 Updated users:');
    
    // Get the updated profiles to show details
    const { data: updatedProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, child_name, subscription_status')
      .in('id', usersToUpdate)
      .order('email');

    if (fetchError) {
      console.error('Error fetching updated profiles:', fetchError);
    } else {
      updatedProfiles.forEach(profile => {
        console.log(`- ${profile.email} (${profile.child_name}): ${profile.subscription_status}`);
      });
    }

    console.log('\n🎯 Next steps:');
    console.log('1. These users will now be redirected to the billing page when they try to access the app');
    console.log('2. They will need to go through the payment flow to get access');
    console.log('3. The middleware will catch them and redirect to /onboarding/results-payment');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the update
updateSubscriptionStatus(); 