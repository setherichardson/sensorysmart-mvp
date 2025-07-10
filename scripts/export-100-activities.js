const fs = require('fs');
const path = require('path');

// Import the 100+ activities
const activities = require('../lib/100-plus-activities.json');

function export100Activities() {
  console.log('📊 Exporting 100+ activities with detailed steps...\n');

  // Create detailed CSV with steps
  const csvHeader = [
    'ID',
    'Name',
    'Description',
    'Sensory Systems',
    'Behavior Types',
    'Difficulty Level',
    'Duration (minutes)',
    'Materials',
    'Age Range',
    'Environment',
    'Steps Count',
    'Step 1 Title',
    'Step 1 Description',
    'Step 1 Duration (seconds)',
    'Step 2 Title',
    'Step 2 Description',
    'Step 2 Duration (seconds)',
    'Step 3 Title',
    'Step 3 Description',
    'Step 3 Duration (seconds)',
    'Step 4 Title',
    'Step 4 Description',
    'Step 4 Duration (seconds)',
    'Step 5 Title',
    'Step 5 Description',
    'Step 5 Duration (seconds)'
  ].join(',');

  // Convert activities to CSV rows with detailed steps
  const csvRows = activities.map((activity, index) => {
    const steps = activity.steps || [];
    
    // Create base row with activity info
    const baseRow = [
      `"${activity.id}"`,
      `"${activity.title}"`,
      `"${activity.description}"`,
      `"${activity.sensory_systems.join(', ')}"`,
      `"${activity.behavior_fit}"`,
      `"${activity.difficulty}"`,
      `"${activity.duration_minutes}"`,
      `"${activity.materials_needed.join(', ')}"`,
      `"${activity.age_range}"`,
      `"${activity.environment}"`,
      `"${steps.length}"`
    ];

    // Add step details (up to 5 steps)
    const stepDetails = [];
    for (let i = 0; i < 5; i++) {
      const step = steps[i];
      if (step) {
        stepDetails.push(
          `"${step.title || ''}"`,
          `"${step.description || ''}"`,
          `"${step.duration_seconds || ''}"`
        );
      } else {
        stepDetails.push('""', '""', '""');
      }
    }

    return [...baseRow, ...stepDetails].join(',');
  });

  // Combine header and rows
  const csvContent = [csvHeader, ...csvRows].join('\n');

  // Write detailed CSV file
  const csvPath = path.join(__dirname, '../exports/100-activities-detailed.csv');
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, csvContent);

  // Create detailed JSON with full step information
  const detailedActivities = activities.map((activity, index) => ({
    id: activity.id,
    name: activity.title,
    description: activity.description,
    sensorySystems: activity.sensory_systems,
    behaviorTypes: [activity.behavior_fit],
    difficultyLevel: activity.difficulty,
    durationMinutes: activity.duration_minutes,
    materials: activity.materials_needed,
    ageRange: activity.age_range,
    environment: activity.environment,
    steps: activity.steps || [],
    benefits: activity.benefits || [],
    whenToUse: activity.when_to_use || ""
  }));

  const jsonPath = path.join(__dirname, '../exports/100-activities-full-details.json');
  fs.writeFileSync(jsonPath, JSON.stringify(detailedActivities, null, 2));

  // Create a readable text report
  let textReport = 'SENSORY SMART ACTIVITY LIBRARY - 100+ ACTIVITIES WITH DETAILED STEPS\n';
  textReport += '='.repeat(80) + '\n\n';

  detailedActivities.forEach((activity, index) => {
    textReport += `${index + 1}. ${activity.name.toUpperCase()}\n`;
    textReport += `   ID: ${activity.id}\n`;
    textReport += `   Description: ${activity.description}\n`;
    textReport += `   Sensory Systems: ${activity.sensorySystems.join(', ')}\n`;
    textReport += `   Behavior Types: ${activity.behaviorTypes.join(', ')}\n`;
    textReport += `   Difficulty: ${activity.difficultyLevel}\n`;
    textReport += `   Duration: ${activity.durationMinutes} minutes\n`;
    textReport += `   Materials: ${activity.materials.join(', ')}\n`;
    textReport += `   Age Range: ${activity.ageRange}\n`;
    textReport += `   Environment: ${activity.environment}\n`;
    if (activity.benefits.length > 0) {
      textReport += `   Benefits: ${activity.benefits.join(', ')}\n`;
    }
    if (activity.whenToUse) {
      textReport += `   When to Use: ${activity.whenToUse}\n`;
    }
    textReport += '\n';
    
    textReport += '   STEPS:\n';
    activity.steps.forEach((step, stepIndex) => {
      textReport += `   ${stepIndex + 1}. ${step.title}\n`;
      textReport += `      ${step.description}\n`;
      textReport += `      Duration: ${step.duration_seconds} seconds\n\n`;
    });
    
    textReport += '\n' + '-'.repeat(80) + '\n\n';
  });

  const textPath = path.join(__dirname, '../exports/100-activities-detailed-report.txt');
  fs.writeFileSync(textPath, textReport);

  // Create summary report
  let summaryReport = 'SENSORY SMART ACTIVITY LIBRARY - SUMMARY\n';
  summaryReport += '='.repeat(50) + '\n\n';

  summaryReport += `Total Activities: ${detailedActivities.length}\n\n`;

  // Activity distribution by sensory system
  const systemCount = {};
  detailedActivities.forEach(activity => {
    activity.sensorySystems.forEach(system => {
      systemCount[system] = (systemCount[system] || 0) + 1;
    });
  });
  
  summaryReport += 'Activities by Sensory System:\n';
  Object.entries(systemCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([system, count]) => {
      summaryReport += `  ${system}: ${count} activities\n`;
    });

  // Behavior type distribution
  const behaviorCount = {};
  detailedActivities.forEach(activity => {
    activity.behaviorTypes.forEach(behavior => {
      behaviorCount[behavior] = (behaviorCount[behavior] || 0) + 1;
    });
  });
  
  summaryReport += '\nActivities by Behavior Type:\n';
  Object.entries(behaviorCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([behavior, count]) => {
      summaryReport += `  ${behavior}: ${count} activities\n`;
    });

  // Difficulty distribution
  const difficultyCount = {};
  detailedActivities.forEach(activity => {
    difficultyCount[activity.difficultyLevel] = (difficultyCount[activity.difficultyLevel] || 0) + 1;
  });
  
  summaryReport += '\nActivities by Difficulty:\n';
  Object.entries(difficultyCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([difficulty, count]) => {
      summaryReport += `  ${difficulty}: ${count} activities\n`;
    });

  // Environment distribution
  const environmentCount = {};
  detailedActivities.forEach(activity => {
    environmentCount[activity.environment] = (environmentCount[activity.environment] || 0) + 1;
  });
  
  summaryReport += '\nActivities by Environment:\n';
  Object.entries(environmentCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([environment, count]) => {
      summaryReport += `  ${environment}: ${count} activities\n`;
    });

  // Total steps
  const totalSteps = detailedActivities.reduce((sum, activity) => sum + activity.steps.length, 0);
  summaryReport += `\nTotal Steps Across All Activities: ${totalSteps}\n`;

  const summaryPath = path.join(__dirname, '../exports/100-activities-summary.txt');
  fs.writeFileSync(summaryPath, summaryReport);

  // Print summary to console
  console.log('📈 100+ Activity Library Summary:');
  console.log(`Total Activities: ${detailedActivities.length}\n`);

  console.log('🎯 Activities by Sensory System:');
  Object.entries(systemCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([system, count]) => {
      console.log(`  ${system}: ${count} activities`);
    });

  console.log('\n📊 Activities by Behavior Type:');
  Object.entries(behaviorCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([behavior, count]) => {
      console.log(`  ${behavior}: ${count} activities`);
    });

  console.log('\n📊 Total Steps Across All Activities:');
  console.log(`  ${totalSteps} total steps`);

  console.log('\n📁 Files created:');
  console.log(`  📄 Detailed CSV: ${csvPath}`);
  console.log(`  📋 Full JSON: ${jsonPath}`);
  console.log(`  📝 Text Report: ${textPath}`);
  console.log(`  📊 Summary: ${summaryPath}`);

  console.log('\n✅ 100+ activities export complete!');
  console.log('💡 Check the text report for the most readable format with all steps.');
  console.log('📊 Check the summary for quick statistics.');
}

// Run the detailed export
export100Activities(); 