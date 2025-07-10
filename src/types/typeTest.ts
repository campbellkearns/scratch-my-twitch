/**
 * Type Validation Test
 * 
 * Simple test to verify our type definitions work correctly.
 * This can be removed once we have proper tests set up.
 */

import { 
  StreamProfile, 
  CreateProfileInput,
  processTitle,
  validateProfile,
  createProfile,
  generateUUID,
  TITLE_TEMPLATES
} from './index';

// Test profile creation
const testProfileInput: CreateProfileInput = {
  name: 'Morning Pages',
  description: 'Daily journaling stream',
  category: {
    id: '509658',
    name: 'Just Chatting'
  },
  title: 'Morning Pages - {DAY} {YYYY-MM-DD}',
  tags: ['journaling', 'productivity', 'mindfulness']
};

// Test validation
const validation = validateProfile(testProfileInput);
console.log('Validation result:', validation);

// Test profile creation
if (validation.isValid) {
  const newProfile = createProfile(testProfileInput);
  console.log('Created profile:', newProfile);
  
  // Test title processing
  const processedTitle = processTitle(newProfile.title);
  console.log('Processed title:', processedTitle);
}

// Test UUID generation
const uuid = generateUUID();
console.log('Generated UUID:', uuid);

// Test template constants
console.log('Available templates:', TITLE_TEMPLATES);

// Type checking - these should all compile without errors
const profile: StreamProfile = {
  id: generateUUID(),
  name: 'Test Profile',
  category: { id: '1', name: 'Test Category' },
  title: 'Test Title',
  tags: ['test'],
  createdAt: new Date(),
  updatedAt: new Date()
};

console.log('Type validation complete!');
