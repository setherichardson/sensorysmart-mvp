// Script to fix incorrect assessment results in the database
// This will update all assessments with the corrected profile calculation logic

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mock the questions array (same as in assessment/page.tsx)
const getPersonalizedQuestions = (childName) => [
  // 1. Tactile / Touch (5 Questions)
  {
    id: 1,
    text: `${childName} avoids messy play like finger paint or slime.`,
    system: 'tactile',
    behaviorType: 'avoiding',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  {
    id: 2,
    text: `${childName} constantly touches objects, textures, or other people.`,
    system: 'tactile',
    behaviorType: 'seeking',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 3,
    text: `${childName} complains about clothing tags, seams, or certain fabrics.`,
    system: 'tactile',
    behaviorType: 'sensitive',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  {
    id: 4,
    text: `${childName} doesn't notice when they have food or dirt on their face.`,
    system: 'tactile',
    behaviorType: 'low-registration',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 5,
    text: `${childName} pulls away from hugs or hand-holding.`,
    system: 'tactile',
    behaviorType: 'avoiding',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  // 2. Visual / Sight (5 Questions)
  {
    id: 6,
    text: `${childName} is easily distracted by lights, colors, or movement.`,
    system: 'visual',
    behaviorType: 'sensitive',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  {
    id: 7,
    text: `${childName} seeks out bright lights, spinning objects, or visual patterns.`,
    system: 'visual',
    behaviorType: 'seeking',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 8,
    text: `${childName} struggles to find objects even when they're visible.`,
    system: 'visual',
    behaviorType: 'low-registration',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 9,
    text: `${childName} stares at lights or spinning fans.`,
    system: 'visual',
    behaviorType: 'seeking',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 10,
    text: `${childName} avoids looking at bright lights or busy patterns.`,
    system: 'visual',
    behaviorType: 'avoiding',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  // 3. Auditory / Hearing (5 Questions)
  {
    id: 11,
    text: `${childName} covers their ears at loud sounds.`,
    system: 'auditory',
    behaviorType: 'sensitive',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  {
    id: 12,
    text: `${childName} seeks out loud noises or repetitive sounds.`,
    system: 'auditory',
    behaviorType: 'seeking',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 13,
    text: `${childName} doesn't respond when called by name.`,
    system: 'auditory',
    behaviorType: 'low-registration',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 14,
    text: `${childName} gets distracted by background noises.`,
    system: 'auditory',
    behaviorType: 'sensitive',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  {
    id: 15,
    text: `${childName} avoids noisy environments.`,
    system: 'auditory',
    behaviorType: 'avoiding',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  // 4. Olfactory / Smell (5 Questions)
  {
    id: 16,
    text: `${childName} is bothered by strong smells.`,
    system: 'olfactory',
    behaviorType: 'sensitive',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  {
    id: 17,
    text: `${childName} seeks out strong smells or scents.`,
    system: 'olfactory',
    behaviorType: 'seeking',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 18,
    text: `${childName} doesn't notice strong odors.`,
    system: 'olfactory',
    behaviorType: 'low-registration',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 19,
    text: `${childName} avoids certain foods due to smell.`,
    system: 'olfactory',
    behaviorType: 'avoiding',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  {
    id: 20,
    text: `${childName} sniffs objects or people.`,
    system: 'olfactory',
    behaviorType: 'seeking',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  // 5. Proprioceptive / Body Awareness (5 Questions)
  {
    id: 21,
    text: `${childName} crashes into things or people.`,
    system: 'proprioceptive',
    behaviorType: 'low-registration',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 22,
    text: `${childName} seeks out heavy work or deep pressure.`,
    system: 'proprioceptive',
    behaviorType: 'seeking',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 23,
    text: `${childName} is sensitive to being touched or moved.`,
    system: 'proprioceptive',
    behaviorType: 'sensitive',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  {
    id: 24,
    text: `${childName} avoids physical activities or sports.`,
    system: 'proprioceptive',
    behaviorType: 'avoiding',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  {
    id: 25,
    text: `${childName} has difficulty with fine motor tasks.`,
    system: 'proprioceptive',
    behaviorType: 'low-registration',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  // 6. Vestibular / Movement (5 Questions)
  {
    id: 26,
    text: `${childName} seeks out spinning, swinging, or bouncing.`,
    system: 'vestibular',
    behaviorType: 'seeking',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 27,
    text: `${childName} gets dizzy easily.`,
    system: 'vestibular',
    behaviorType: 'sensitive',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  {
    id: 28,
    text: `${childName} avoids playground equipment or rides.`,
    system: 'vestibular',
    behaviorType: 'avoiding',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  {
    id: 29,
    text: `${childName} doesn't notice when they're moving.`,
    system: 'vestibular',
    behaviorType: 'low-registration',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 30,
    text: `${childName} has poor balance or coordination.`,
    system: 'vestibular',
    behaviorType: 'low-registration',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  // 7. Interoception / Internal Sensations (4 Questions)
  {
    id: 31,
    text: `${childName} doesn't notice when they are hungry, thirsty, or tired.`,
    system: 'interoception',
    behaviorType: 'low-registration',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 32,
    text: `${childName} is very aware of internal sensations.`,
    system: 'interoception',
    behaviorType: 'sensitive',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  {
    id: 33,
    text: `${childName} seeks out activities that provide internal feedback.`,
    system: 'interoception',
    behaviorType: 'seeking',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 34,
    text: `${childName} avoids activities that might cause internal sensations.`,
    system: 'interoception',
    behaviorType: 'avoiding',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  // 8. Social-Emotional (4 Questions)
  {
    id: 35,
    text: `${childName} has difficulty reading social cues.`,
    system: 'social-emotional',
    behaviorType: 'low-registration',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 36,
    text: `${childName} is very sensitive to others' emotions.`,
    system: 'social-emotional',
    behaviorType: 'sensitive',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  },
  {
    id: 37,
    text: `${childName} seeks out social interactions intensely.`,
    system: 'social-emotional',
    behaviorType: 'seeking',
    options: [
      { text: 'Never', score: 1 },
      { text: 'Rarely', score: 2 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 4 },
      { text: 'Always', score: 5 }
    ]
  },
  {
    id: 38,
    text: `${childName} avoids social situations or crowds.`,
    system: 'social-emotional',
    behaviorType: 'avoiding',
    options: [
      { text: 'Never', score: 5 },
      { text: 'Rarely', score: 4 },
      { text: 'Sometimes', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Always', score: 1 }
    ]
  }
];

// Mock the calculation function (same as in assessment/page.tsx)
const calculateSensoryProfile = (answers, questions) => {
  const systemScores = {
    tactile: 0,
    visual: 0,
    auditory: 0,
    olfactory: 0,
    proprioceptive: 0,
    vestibular: 0,
    interoception: 0,
    'social-emotional': 0
  }

  const behaviorScores = {
    avoiding: 0,
    seeking: 0,
    sensitive: 0,
    'low-registration': 0
  }

  // Calculate scores for each system and behavior type
  questions.forEach(question => {
    const answer = answers[question.id]
    if (answer) {
      systemScores[question.system] += answer
      behaviorScores[question.behaviorType] += answer
    }
  })

  const total = Object.values(systemScores).reduce((sum, score) => sum + score, 0)
  
  // Determine profile based on behavior patterns
  let profile = 'Mixed/Typical'
  const maxBehavior = Math.max(...Object.values(behaviorScores))
  const behaviorThreshold = 20 // Threshold for significant behavior pattern
  
  // Find the dominant behavior type
  const dominantBehavior = Object.entries(behaviorScores).reduce((max, [type, score]) => 
    score > max.score ? { type, score } : max
  , { type: 'mixed', score: 0 })
  
  if (dominantBehavior.score >= behaviorThreshold) {
    switch (dominantBehavior.type) {
      case 'seeking':
        profile = 'Sensory Seeking'
        break
      case 'avoiding':
        profile = 'Sensory Avoiding'
        break
      case 'sensitive':
        profile = 'Sensory Sensitive'
        break
      case 'low-registration':
        profile = 'Low Registration'
        break
      default:
        profile = 'Mixed Profile'
    }
  } else if (maxBehavior >= behaviorThreshold) {
    profile = 'Mixed Profile'
  }

  return {
    ...systemScores,
    total,
    profile,
    behaviorScores
  }
}

async function fixIncorrectAssessments() {
  console.log("🔧 Fixing incorrect assessment results...\n");

  try {
    // Get all assessments with their responses and results
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select(`
        id,
        user_id,
        responses,
        results,
        completed_at,
        profiles!inner(child_name)
      `)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      return;
    }

    if (!assessments || assessments.length === 0) {
      console.log('No assessments found in database.');
      return;
    }

    console.log(`Found ${assessments.length} assessments to check.\n`);

    let fixedCount = 0;
    let skippedCount = 0;
    const updates = [];

    for (const assessment of assessments) {
      const childName = assessment.profiles?.child_name || 'Unknown';
      const originalProfile = assessment.results?.profile;
      const responses = assessment.responses;

      if (!responses || !originalProfile) {
        console.log(`⚠️  Assessment ${assessment.id}: Missing data, skipping`);
        skippedCount++;
        continue;
      }

      // Recalculate the profile using the corrected logic
      const questions = getPersonalizedQuestions(childName);
      const recalculatedProfile = calculateSensoryProfile(responses, questions);

      if (recalculatedProfile.profile === originalProfile) {
        console.log(`✅ ${childName}: ${originalProfile} (already correct)`);
        skippedCount++;
      } else {
        console.log(`🔧 ${childName}: ${originalProfile} → ${recalculatedProfile.profile} (fixing)`);
        
        // Prepare the updated results object
        const updatedResults = {
          ...assessment.results,
          profile: recalculatedProfile.profile,
          behaviorScores: recalculatedProfile.behaviorScores
        };

        updates.push({
          id: assessment.id,
          results: updatedResults
        });
        fixedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Already correct: ${skippedCount}`);
    console.log(`🔧 Need fixing: ${fixedCount}`);

    if (updates.length === 0) {
      console.log(`\n🎉 All assessments are already correct!`);
      return;
    }

    console.log(`\n🚀 Updating ${updates.length} assessments in database...`);

    // Update all assessments in batches
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      for (const update of batch) {
        const { error } = await supabase
          .from('assessments')
          .update({ results: update.results })
          .eq('id', update.id);

        if (error) {
          console.error(`❌ Error updating assessment ${update.id}:`, error);
        } else {
          console.log(`✅ Updated assessment ${update.id}`);
        }
      }

      // Small delay between batches
      if (i + batchSize < updates.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`\n🎉 Successfully updated ${fixedCount} assessments!`);
    console.log(`📈 All assessment profiles are now accurate.`);

  } catch (error) {
    console.error('Error during fix process:', error);
  }
}

// Run the fix
fixIncorrectAssessments(); 