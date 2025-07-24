require('dotenv').config({ path: '.env.local' });

// Test the time slot functions
function getCurrentTimeSlot() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Before breakfast: 6-8 AM
  if (hour >= 6 && hour < 8) return 'before-breakfast';
  
  // Mid morning: 8-10 AM
  if (hour >= 8 && hour < 10) return 'mid-morning';
  
  // Before lunch: 10-12 PM
  if (hour >= 10 && hour < 12) return 'before-lunch';
  
  // Lunch: 12-2 PM
  if (hour >= 12 && hour < 14) return 'lunch';
  
  // Mid afternoon: 2-4 PM
  if (hour >= 14 && hour < 16) return 'mid-afternoon';
  
  // Before dinner: 4-6 PM
  if (hour >= 16 && hour < 18) return 'before-dinner';
  
  // Dinner: 6-8 PM
  if (hour >= 18 && hour < 20) return 'dinner';
  
  // Evening: 8-10 PM
  if (hour >= 20 && hour < 22) return 'evening';
  
  // Bedtime: 10 PM - 6 AM
  return 'bedtime';
}

function getTimeSlotDisplayName(timeSlot) {
  const timeSlotNames = {
    'before-breakfast': 'Before Breakfast',
    'mid-morning': 'Mid Morning',
    'before-lunch': 'Before Lunch',
    'lunch': 'Lunch',
    'mid-afternoon': 'Mid Afternoon',
    'before-dinner': 'Before Dinner',
    'dinner': 'Dinner',
    'evening': 'Evening',
    'bedtime': 'Bedtime'
  };
  return timeSlotNames[timeSlot] || timeSlot;
}

// Test different times
const testTimes = [
  { hour: 7, expected: 'before-breakfast' },
  { hour: 9, expected: 'mid-morning' },
  { hour: 11, expected: 'before-lunch' },
  { hour: 13, expected: 'lunch' },
  { hour: 15, expected: 'mid-afternoon' },
  { hour: 17, expected: 'before-dinner' },
  { hour: 19, expected: 'dinner' },
  { hour: 21, expected: 'evening' },
  { hour: 23, expected: 'bedtime' },
  { hour: 3, expected: 'bedtime' }
];

console.log('🧪 Testing Time Slot System\n');

// Test current time
const currentTimeSlot = getCurrentTimeSlot();
console.log(`🕐 Current time slot: ${getTimeSlotDisplayName(currentTimeSlot)} (${currentTimeSlot})`);

// Test all time slots
console.log('\n📋 All time slots:');
testTimes.forEach(test => {
  // Create a mock date for testing
  const mockDate = new Date();
  mockDate.setHours(test.hour, 0, 0, 0);
  
  // Override the Date constructor temporarily for this test
  const originalDate = global.Date;
  global.Date = class extends originalDate {
    constructor() {
      return mockDate;
    }
  };
  
  const timeSlot = getCurrentTimeSlot();
  const displayName = getTimeSlotDisplayName(timeSlot);
  const status = timeSlot === test.expected ? '✅' : '❌';
  console.log(`${status} ${test.hour}:00 → ${displayName} (${timeSlot})`);
  
  // Restore original Date
  global.Date = originalDate;
});

console.log('\n🎯 Time-based activity recommendations:');
const timeSlotDescriptions = {
  'before-breakfast': 'Energizing, quick activities (5 min or less)',
  'mid-morning': 'Focus and learning activities (visual/tactile)',
  'before-lunch': 'Calming transition activities',
  'lunch': 'Social and sensory activities (tactile/olfactory)',
  'mid-afternoon': 'Re-energizing movement activities',
  'before-dinner': 'Calming transition activities',
  'dinner': 'Family and sensory activities',
  'evening': 'Winding down activities (10+ min)',
  'bedtime': 'Very calming, quiet activities (5 min or less)'
};

Object.entries(timeSlotDescriptions).forEach(([slot, description]) => {
  console.log(`• ${getTimeSlotDisplayName(slot)}: ${description}`);
});

console.log('\n✅ Time slot system ready!'); 