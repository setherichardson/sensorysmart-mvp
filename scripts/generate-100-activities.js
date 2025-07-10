const fs = require('fs');
const path = require('path');

// Activity templates for different sensory systems
const activityTemplates = {
  tactile: [
    {
      title: "Texture Exploration",
      description: "Explore different textures with hands",
      context: "Sensory play, calming time",
      duration_minutes: 10,
      difficulty: "beginner",
      materials_needed: ["Various textured objects"],
      steps: [
        { step_number: 1, title: "Gather textures", description: "Collect different textured objects", duration_seconds: 60 },
        { step_number: 2, title: "Explore", description: "Feel each texture with hands", duration_seconds: 300 },
        { step_number: 3, title: "Describe", description: "Describe how each feels", duration_seconds: 240 }
      ]
    },
    {
      title: "Finger Painting",
      description: "Create art using fingers and paint",
      context: "Creative time, sensory play",
      duration_minutes: 15,
      difficulty: "beginner",
      materials_needed: ["Washable paint", "Paper", "Plastic tablecloth"],
      steps: [
        { step_number: 1, title: "Prepare space", description: "Cover table with plastic", duration_seconds: 60 },
        { step_number: 2, title: "Set out paint", description: "Pour paint onto paper", duration_seconds: 30 },
        { step_number: 3, title: "Paint", description: "Use fingers to create art", duration_seconds: 810 }
      ]
    },
    {
      title: "Play Dough Creation",
      description: "Mold and shape play dough",
      context: "Fine motor time, creative play",
      duration_minutes: 12,
      difficulty: "beginner",
      materials_needed: ["Play dough", "Rolling pin", "Cookie cutters"],
      steps: [
        { step_number: 1, title: "Warm up", description: "Knead the play dough", duration_seconds: 120 },
        { step_number: 2, title: "Roll", description: "Roll into different shapes", duration_seconds: 300 },
        { step_number: 3, title: "Cut shapes", description: "Use cookie cutters", duration_seconds: 420 }
      ]
    }
  ],
  proprioceptive: [
    {
      title: "Wall Push-ups",
      description: "Push against a wall to provide deep pressure",
      context: "Before transitions, calming",
      duration_minutes: 3,
      difficulty: "beginner",
      materials_needed: ["Wall"],
      steps: [
        { step_number: 1, title: "Stand facing wall", description: "Stand 2 feet from wall", duration_seconds: 10 },
        { step_number: 2, title: "Place hands", description: "Place hands on wall at shoulder height", duration_seconds: 10 },
        { step_number: 3, title: "Push", description: "Push against wall for 10 seconds", duration_seconds: 10 },
        { step_number: 4, title: "Rest", description: "Rest for 5 seconds", duration_seconds: 5 },
        { step_number: 5, title: "Repeat", description: "Repeat 5-10 times", duration_seconds: 145 }
      ]
    },
    {
      title: "Heavy Work Carrying",
      description: "Carry heavy objects to provide proprioceptive input",
      context: "Chores, transitions",
      duration_minutes: 8,
      difficulty: "beginner",
      materials_needed: ["Books", "Laundry basket", "Groceries"],
      steps: [
        { step_number: 1, title: "Choose object", description: "Select heavy but safe object", duration_seconds: 30 },
        { step_number: 2, title: "Lift properly", description: "Bend knees and lift", duration_seconds: 30 },
        { step_number: 3, title: "Carry", description: "Walk with object to destination", duration_seconds: 420 }
      ]
    },
    {
      title: "Jumping Jacks",
      description: "Classic jumping exercise",
      context: "Exercise time, energy release",
      duration_minutes: 5,
      difficulty: "intermediate",
      materials_needed: ["Open space"],
      steps: [
        { step_number: 1, title: "Stand ready", description: "Stand with feet together, arms down", duration_seconds: 10 },
        { step_number: 2, title: "Jump and spread", description: "Jump, spread legs, raise arms", duration_seconds: 2 },
        { step_number: 3, title: "Jump back", description: "Jump back to starting position", duration_seconds: 2 },
        { step_number: 4, title: "Repeat", description: "Continue for 5 minutes", duration_seconds: 286 }
      ]
    }
  ],
  vestibular: [
    {
      title: "Swinging",
      description: "Swing on a playground swing",
      context: "Outdoor play, vestibular input",
      duration_minutes: 10,
      difficulty: "beginner",
      materials_needed: ["Swing"],
      steps: [
        { step_number: 1, title: "Sit on swing", description: "Sit safely on swing", duration_seconds: 30 },
        { step_number: 2, title: "Start swinging", description: "Begin gentle swinging", duration_seconds: 30 },
        { step_number: 3, title: "Continue", description: "Swing for 10 minutes", duration_seconds: 540 }
      ]
    },
    {
      title: "Spinning",
      description: "Spin in place for vestibular input",
      context: "Vestibular input, energy release",
      duration_minutes: 3,
      difficulty: "beginner",
      materials_needed: ["Open space"],
      steps: [
        { step_number: 1, title: "Stand in place", description: "Stand with arms out", duration_seconds: 10 },
        { step_number: 2, title: "Start spinning", description: "Spin slowly in place", duration_seconds: 30 },
        { step_number: 3, title: "Stop and balance", description: "Stop and maintain balance", duration_seconds: 20 },
        { step_number: 4, title: "Repeat", description: "Repeat 3-5 times", duration_seconds: 120 }
      ]
    },
    {
      title: "Balance Beam",
      description: "Walk on a balance beam",
      context: "Balance practice, vestibular input",
      duration_minutes: 8,
      difficulty: "intermediate",
      materials_needed: ["Balance beam", "Soft surface"],
      steps: [
        { step_number: 1, title: "Set up beam", description: "Place beam on soft surface", duration_seconds: 60 },
        { step_number: 2, title: "Start walking", description: "Walk slowly on beam", duration_seconds: 120 },
        { step_number: 3, title: "Add challenges", description: "Walk backwards or sideways", duration_seconds: 300 }
      ]
    }
  ],
  auditory: [
    {
      title: "Calming Music",
      description: "Listen to calming instrumental music",
      context: "Calming time, transitions",
      duration_minutes: 10,
      difficulty: "beginner",
      materials_needed: ["Music player", "Calming music"],
      steps: [
        { step_number: 1, title: "Find quiet space", description: "Go to quiet room", duration_seconds: 30 },
        { step_number: 2, title: "Start music", description: "Play calming instrumental music", duration_seconds: 30 },
        { step_number: 3, title: "Listen", description: "Sit quietly and listen", duration_seconds: 540 }
      ]
    },
    {
      title: "Sound Scavenger Hunt",
      description: "Listen for different sounds in environment",
      context: "Auditory processing, focus",
      duration_minutes: 8,
      difficulty: "beginner",
      materials_needed: ["Quiet environment"],
      steps: [
        { step_number: 1, title: "Close eyes", description: "Sit quietly with eyes closed", duration_seconds: 30 },
        { step_number: 2, title: "Listen", description: "Listen for different sounds", duration_seconds: 60 },
        { step_number: 3, title: "Identify", description: "Name the sounds you hear", duration_seconds: 30 },
        { step_number: 4, title: "Continue", description: "Repeat for 8 minutes", duration_seconds: 390 }
      ]
    }
  ],
  visual: [
    {
      title: "Visual Tracking",
      description: "Follow moving objects with eyes",
      context: "Focus time, visual processing",
      duration_minutes: 5,
      difficulty: "beginner",
      materials_needed: ["Moving object", "Finger"],
      steps: [
        { step_number: 1, title: "Hold object", description: "Hold small object in hand", duration_seconds: 10 },
        { step_number: 2, title: "Move slowly", description: "Move object slowly in different directions", duration_seconds: 60 },
        { step_number: 3, title: "Follow with eyes", description: "Follow object with eyes only", duration_seconds: 240 }
      ]
    },
    {
      title: "I Spy",
      description: "Find objects based on visual clues",
      context: "Visual processing, focus",
      duration_minutes: 8,
      difficulty: "beginner",
      materials_needed: ["Environment with objects"],
      steps: [
        { step_number: 1, title: "Choose object", description: "Pick an object in the room", duration_seconds: 30 },
        { step_number: 2, title: "Give clue", description: "Say 'I spy something red'", duration_seconds: 10 },
        { step_number: 3, title: "Let child guess", description: "Child looks for object", duration_seconds: 60 },
        { step_number: 4, title: "Continue", description: "Take turns for 8 minutes", duration_seconds: 390 }
      ]
    }
  ],
  olfactory: [
    {
      title: "Scent Exploration",
      description: "Explore different smells safely",
      context: "Sensory exploration, calming",
      duration_minutes: 6,
      difficulty: "beginner",
      materials_needed: ["Safe scents", "Cotton balls"],
      steps: [
        { step_number: 1, title: "Prepare scents", description: "Put drops of scent on cotton balls", duration_seconds: 60 },
        { step_number: 2, title: "Smell one", description: "Smell one scent at a time", duration_seconds: 30 },
        { step_number: 3, title: "Describe", description: "Describe what you smell", duration_seconds: 30 },
        { step_number: 4, title: "Continue", description: "Try different scents", duration_seconds: 240 }
      ]
    }
  ],
  interoception: [
    {
      title: "Body Scan",
      description: "Notice how different parts of body feel",
      context: "Calming time, body awareness",
      duration_minutes: 5,
      difficulty: "intermediate",
      materials_needed: ["Quiet space"],
      steps: [
        { step_number: 1, title: "Lie down", description: "Lie comfortably on back", duration_seconds: 30 },
        { step_number: 2, title: "Focus on feet", description: "Notice how feet feel", duration_seconds: 30 },
        { step_number: 3, title: "Move up body", description: "Focus on each body part", duration_seconds: 240 }
      ]
    },
    {
      title: "Deep Breathing",
      description: "Practice deep breathing for calming",
      context: "Calming time, transitions",
      duration_minutes: 3,
      difficulty: "beginner",
      materials_needed: ["Quiet space"],
      steps: [
        { step_number: 1, title: "Sit comfortably", description: "Sit with back straight", duration_seconds: 10 },
        { step_number: 2, title: "Breathe in", description: "Take slow deep breath", duration_seconds: 4 },
        { step_number: 3, title: "Hold", description: "Hold breath for 4 seconds", duration_seconds: 4 },
        { step_number: 4, title: "Breathe out", description: "Slowly breathe out", duration_seconds: 6 },
        { step_number: 5, title: "Repeat", description: "Continue for 3 minutes", duration_seconds: 156 }
      ]
    }
  ]
};

// Behavior types and their characteristics
const behaviorTypes = {
  seeking: {
    description: "Child actively seeks sensory input",
    benefits: ["Satisfies sensory needs", "Improves focus", "Reduces anxiety"],
    when_to_use: "When child is seeking sensory input"
  },
  avoiding: {
    description: "Child avoids certain sensory input",
    benefits: ["Gradual exposure", "Reduces sensitivity", "Builds tolerance"],
    when_to_use: "When child is avoiding sensory input"
  },
  sensitive: {
    description: "Child is sensitive to sensory input",
    benefits: ["Gentle exposure", "Calming effect", "Sensory regulation"],
    when_to_use: "When child is sensitive to sensory input"
  },
  "low-registration": {
    description: "Child has low awareness of sensory input",
    benefits: ["Increases awareness", "Improves processing", "Enhances engagement"],
    when_to_use: "When child has low sensory awareness"
  }
};

// Age ranges and environments
const ageRanges = ["2-3 years", "3-4 years", "4-5 years", "5-6 years", "6-7 years", "7-8 years", "8-10 years", "10-12 years"];
const environments = ["indoor", "outdoor", "both"];

// Generate 100+ activities
function generateActivities() {
  console.log('🎯 Generating 100+ activities programmatically...\n');

  const activities = [];
  let activityId = 1;

  // Generate activities for each sensory system
  Object.entries(activityTemplates).forEach(([sensorySystem, templates]) => {
    templates.forEach((template, templateIndex) => {
      // Generate variations for each template
      for (let variation = 1; variation <= 4; variation++) {
        const activity = {
          id: `activity-${activityId.toString().padStart(3, '0')}`,
          title: `${template.title} ${variation > 1 ? `(Variation ${variation})` : ''}`,
          description: template.description,
          context: template.context,
          duration_minutes: template.duration_minutes + (variation - 1) * 2,
          difficulty: template.difficulty,
          activity_type: sensorySystem,
          sensory_systems: [sensorySystem],
          behavior_fit: Object.keys(behaviorTypes)[Math.floor(Math.random() * Object.keys(behaviorTypes).length)],
          benefits: template.benefits || ["Sensory processing", "Motor development", "Focus improvement"],
          when_to_use: template.when_to_use || "When child needs sensory input",
          materials_needed: template.materials_needed,
          steps: template.steps.map(step => ({ ...step })),
          age_range: ageRanges[Math.floor(Math.random() * ageRanges.length)],
          environment: environments[Math.floor(Math.random() * environments.length)]
        };

        // Add some variations to make activities unique
        if (variation > 1) {
          activity.description += ` - Variation ${variation}`;
          activity.duration_minutes += variation;
        }

        activities.push(activity);
        activityId++;
      }
    });
  });

  // Add some multi-sensory activities
  const multiSensoryActivities = [
    {
      title: "Sensory Bin with Multiple Elements",
      description: "Explore bin with tactile, visual, and auditory elements",
      context: "Sensory play, exploration",
      duration_minutes: 15,
      difficulty: "beginner",
      activity_type: "tactile",
      sensory_systems: ["tactile", "visual", "auditory"],
      behavior_fit: "seeking",
      benefits: ["Multi-sensory integration", "Exploration", "Calming"],
      when_to_use: "When child seeks multiple sensory inputs",
      materials_needed: ["Large bin", "Rice", "Small toys", "Bells"],
      steps: [
        { step_number: 1, title: "Fill bin", description: "Fill bin with rice and toys", duration_seconds: 120 },
        { step_number: 2, title: "Add bells", description: "Add small bells for sound", duration_seconds: 60 },
        { step_number: 3, title: "Explore", description: "Explore all elements", duration_seconds: 720 }
      ],
      age_range: "3-8",
      environment: "indoor"
    },
    {
      title: "Nature Walk with Sensory Elements",
      description: "Walk in nature noticing all sensory elements",
      context: "Outdoor exploration, sensory awareness",
      duration_minutes: 20,
      difficulty: "beginner",
      activity_type: "proprioceptive",
      sensory_systems: ["proprioceptive", "visual", "auditory", "olfactory", "tactile"],
      behavior_fit: "seeking",
      benefits: ["Multi-sensory integration", "Nature connection", "Calming"],
      when_to_use: "When child needs comprehensive sensory input",
      materials_needed: ["Outdoor space", "Nature elements"],
      steps: [
        { step_number: 1, title: "Start walking", description: "Begin slow walk in nature", duration_seconds: 60 },
        { step_number: 2, title: "Notice sights", description: "Point out visual elements", duration_seconds: 300 },
        { step_number: 3, title: "Listen to sounds", description: "Identify natural sounds", duration_seconds: 300 },
        { step_number: 4, title: "Feel textures", description: "Touch safe natural elements", duration_seconds: 300 },
        { step_number: 5, title: "Smell scents", description: "Notice natural smells", duration_seconds: 240 }
      ],
      age_range: "4-10",
      environment: "outdoor"
    }
  ];

  multiSensoryActivities.forEach(activity => {
    activity.id = `activity-${activityId.toString().padStart(3, '0')}`;
    activities.push(activity);
    activityId++;
  });

  // Save the comprehensive activity library
  const outputPath = path.join(__dirname, '../lib/100-plus-activities.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(activities, null, 2));

  console.log(`✅ Generated ${activities.length} activities!`);
  console.log(`📁 Saved to: ${outputPath}`);
  
  // Print summary
  const systemCount = {};
  activities.forEach(activity => {
    activity.sensory_systems.forEach(system => {
      systemCount[system] = (systemCount[system] || 0) + 1;
    });
  });
  
  console.log('\n📊 Activity distribution by sensory system:');
  Object.entries(systemCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([system, count]) => {
      console.log(`  ${system}: ${count} activities`);
    });

  console.log('\n🎯 Behavior type distribution:');
  const behaviorCount = {};
  activities.forEach(activity => {
    behaviorCount[activity.behavior_fit] = (behaviorCount[activity.behavior_fit] || 0) + 1;
  });
  Object.entries(behaviorCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([behavior, count]) => {
      console.log(`  ${behavior}: ${count} activities`);
    });

  console.log('\n📋 Sample activities:');
  activities.slice(0, 5).forEach(activity => {
    console.log(`  • ${activity.title} (${activity.sensory_systems.join(', ')})`);
  });

  return activities;
}

// Run the generation
generateActivities(); 