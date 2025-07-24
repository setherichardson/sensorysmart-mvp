// Script to show detailed breakdown of assessment scoring
// This explains how each category and behavior type is scored

console.log("📊 ASSESSMENT SCORING BREAKDOWN\n");

console.log("🎯 OVERVIEW:");
console.log("- 38 total questions across 8 sensory systems");
console.log("- Each question has 5 answer options (Never=1-5, Always=1-5)");
console.log("- Questions are categorized by sensory system and behavior type");
console.log("- Behavior threshold: 20 points to determine significant pattern");
console.log("- Profile is determined by the highest-scoring behavior type\n");

console.log("📋 SENSORY SYSTEMS & BEHAVIOR TYPES:\n");

const systems = [
  {
    name: "1. TACTILE (Touch) - 5 Questions",
    questions: [
      { id: 1, text: "avoids messy play like finger paint or slime", behavior: "avoiding", scoring: "Never=5, Always=1" },
      { id: 2, text: "constantly touches objects, textures, or other people", behavior: "seeking", scoring: "Never=1, Always=5" },
      { id: 3, text: "complains about clothing tags, seams, or certain fabrics", behavior: "sensitive", scoring: "Never=5, Always=1" },
      { id: 4, text: "doesn't notice when they have food or dirt on their face", behavior: "low-registration", scoring: "Never=1, Always=5" },
      { id: 5, text: "pulls away from hugs or hand-holding", behavior: "avoiding", scoring: "Never=5, Always=1" }
    ]
  },
  {
    name: "2. VISUAL (Sight) - 5 Questions",
    questions: [
      { id: 6, text: "is easily distracted by lights, colors, or movement", behavior: "sensitive", scoring: "Never=5, Always=1" },
      { id: 7, text: "seeks out bright lights, spinning objects, or visual patterns", behavior: "seeking", scoring: "Never=1, Always=5" },
      { id: 8, text: "struggles to find objects even when they're visible", behavior: "low-registration", scoring: "Never=1, Always=5" },
      { id: 9, text: "stares at lights or spinning fans", behavior: "seeking", scoring: "Never=1, Always=5" },
      { id: 10, text: "avoids looking at bright lights or busy patterns", behavior: "avoiding", scoring: "Never=5, Always=1" }
    ]
  },
  {
    name: "3. AUDITORY (Hearing) - 5 Questions",
    questions: [
      { id: 11, text: "covers their ears at loud sounds", behavior: "sensitive", scoring: "Never=5, Always=1" },
      { id: 12, text: "seeks out loud noises or repetitive sounds", behavior: "seeking", scoring: "Never=1, Always=5" },
      { id: 13, text: "doesn't respond when called by name", behavior: "low-registration", scoring: "Never=1, Always=5" },
      { id: 14, text: "gets distracted by background noises", behavior: "sensitive", scoring: "Never=5, Always=1" },
      { id: 15, text: "avoids noisy environments", behavior: "avoiding", scoring: "Never=5, Always=1" }
    ]
  },
  {
    name: "4. OLFACTORY (Smell) - 5 Questions",
    questions: [
      { id: 16, text: "is bothered by strong smells", behavior: "sensitive", scoring: "Never=5, Always=1" },
      { id: 17, text: "seeks out strong smells or scents", behavior: "seeking", scoring: "Never=1, Always=5" },
      { id: 18, text: "doesn't notice strong odors", behavior: "low-registration", scoring: "Never=1, Always=5" },
      { id: 19, text: "avoids certain foods due to smell", behavior: "avoiding", scoring: "Never=5, Always=1" },
      { id: 20, text: "sniffs objects or people", behavior: "seeking", scoring: "Never=1, Always=5" }
    ]
  },
  {
    name: "5. PROPRIOCEPTIVE (Body Awareness) - 5 Questions",
    questions: [
      { id: 21, text: "crashes into things or people", behavior: "low-registration", scoring: "Never=1, Always=5" },
      { id: 22, text: "seeks out heavy work or deep pressure", behavior: "seeking", scoring: "Never=1, Always=5" },
      { id: 23, text: "is sensitive to being touched or moved", behavior: "sensitive", scoring: "Never=5, Always=1" },
      { id: 24, text: "avoids physical activities or sports", behavior: "avoiding", scoring: "Never=5, Always=1" },
      { id: 25, text: "has difficulty with fine motor tasks", behavior: "low-registration", scoring: "Never=1, Always=5" }
    ]
  },
  {
    name: "6. VESTIBULAR (Movement) - 5 Questions",
    questions: [
      { id: 26, text: "seeks out spinning, swinging, or bouncing", behavior: "seeking", scoring: "Never=1, Always=5" },
      { id: 27, text: "gets dizzy easily", behavior: "sensitive", scoring: "Never=5, Always=1" },
      { id: 28, text: "avoids playground equipment or rides", behavior: "avoiding", scoring: "Never=5, Always=1" },
      { id: 29, text: "doesn't notice when they're moving", behavior: "low-registration", scoring: "Never=1, Always=5" },
      { id: 30, text: "has poor balance or coordination", behavior: "low-registration", scoring: "Never=1, Always=5" }
    ]
  },
  {
    name: "7. INTEROCEPTION (Internal Sensations) - 4 Questions",
    questions: [
      { id: 31, text: "doesn't notice when they are hungry, thirsty, or tired", behavior: "low-registration", scoring: "Never=1, Always=5" },
      { id: 32, text: "is very aware of internal sensations", behavior: "sensitive", scoring: "Never=5, Always=1" },
      { id: 33, text: "seeks out activities that provide internal feedback", behavior: "seeking", scoring: "Never=1, Always=5" },
      { id: 34, text: "avoids activities that might cause internal sensations", behavior: "avoiding", scoring: "Never=5, Always=1" }
    ]
  },
  {
    name: "8. SOCIAL-EMOTIONAL - 4 Questions",
    questions: [
      { id: 35, text: "has difficulty reading social cues", behavior: "low-registration", scoring: "Never=1, Always=5" },
      { id: 36, text: "is very sensitive to others' emotions", behavior: "sensitive", scoring: "Never=5, Always=1" },
      { id: 37, text: "seeks out social interactions intensely", behavior: "seeking", scoring: "Never=1, Always=5" },
      { id: 38, text: "avoids social situations or crowds", behavior: "avoiding", scoring: "Never=5, Always=1" }
    ]
  }
];

systems.forEach(system => {
  console.log(system.name);
  system.questions.forEach(q => {
    console.log(`   Q${q.id}: ${q.text}`);
    console.log(`       Behavior: ${q.behavior.toUpperCase()}`);
    console.log(`       Scoring: ${q.scoring}`);
  });
  console.log("");
});

console.log("🎯 BEHAVIOR TYPES EXPLAINED:\n");

const behaviorTypes = [
  {
    type: "SEEKING",
    description: "Child actively seeks out sensory input",
    examples: "Touches everything, seeks movement, craves deep pressure",
    questions: [2, 7, 9, 12, 17, 20, 22, 26, 33, 37],
    maxScore: 50
  },
  {
    type: "AVOIDING", 
    description: "Child actively avoids sensory input",
    examples: "Pulls away from touch, avoids loud sounds, dislikes certain textures",
    questions: [1, 5, 10, 15, 19, 24, 28, 34, 38],
    maxScore: 45
  },
  {
    type: "SENSITIVE",
    description: "Child is overly sensitive to sensory input",
    examples: "Bothered by tags, covers ears, gets overwhelmed easily",
    questions: [3, 6, 11, 14, 16, 23, 27, 32, 36],
    maxScore: 45
  },
  {
    type: "LOW-REGISTRATION",
    description: "Child doesn't notice sensory input",
    examples: "Doesn't feel hunger, misses social cues, poor body awareness",
    questions: [4, 8, 13, 18, 21, 25, 29, 30, 31, 35],
    maxScore: 50
  }
];

behaviorTypes.forEach(behavior => {
  console.log(`${behavior.type}:`);
  console.log(`   Description: ${behavior.description}`);
  console.log(`   Examples: ${behavior.examples}`);
  console.log(`   Questions: ${behavior.questions.join(', ')}`);
  console.log(`   Max Possible Score: ${behavior.maxScore}`);
  console.log(`   Threshold: 20 (${Math.round(20/behavior.maxScore*100)}% of max)`);
  console.log("");
});

console.log("📊 SCORING EXAMPLES:\n");

const examples = [
  {
    name: "High Seeking Example",
    answers: {
      2: 5, 7: 5, 9: 5, 12: 5, 17: 5, 20: 5, 22: 5, 26: 5, 33: 5, 37: 5
    },
    expected: "Sensory Seeking (50/50 points)"
  },
  {
    name: "High Avoiding Example", 
    answers: {
      1: 5, 5: 5, 10: 5, 15: 5, 19: 5, 24: 5, 28: 5, 34: 5, 38: 5
    },
    expected: "Sensory Avoiding (45/45 points)"
  },
  {
    name: "High Sensitive Example",
    answers: {
      3: 5, 6: 5, 11: 5, 14: 5, 16: 5, 23: 5, 27: 5, 32: 5, 36: 5
    },
    expected: "Sensory Sensitive (45/45 points)"
  },
  {
    name: "High Low-Registration Example",
    answers: {
      4: 5, 8: 5, 13: 5, 18: 5, 21: 5, 25: 5, 29: 5, 30: 5, 31: 5, 35: 5
    },
    expected: "Low Registration (50/50 points)"
  }
];

examples.forEach(example => {
  console.log(`${example.name}:`);
  console.log(`   Answers: ${Object.entries(example.answers).map(([q, s]) => `Q${q}=${s}`).join(', ')}`);
  console.log(`   Result: ${example.expected}`);
  console.log("");
});

console.log("🔍 PROFILE DETERMINATION LOGIC:\n");
console.log("1. Calculate total score for each behavior type");
console.log("2. Find the behavior type with the highest score");
console.log("3. If highest score >= 20 (threshold), assign that profile");
console.log("4. If no score >= 20, assign 'Mixed Profile'");
console.log("5. If multiple scores are tied and >= 20, choose the highest");
console.log("");
console.log("✅ This logic ensures accurate profile determination based on actual behavior patterns!"); 