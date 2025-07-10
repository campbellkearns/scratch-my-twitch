/**
 * Repository Test Script
 * 
 * Basic test to verify IndexedDB and repository functionality.
 * Run this in the browser console to test the data layer.
 */

import { getProfileRepository } from '@/repositories/ProfileRepository';
import { getCategoryRepository } from '@/repositories/CategoryRepository';
import type { CreateProfileInput, StreamCategory } from '@/types/Profile';

/**
 * Test the profile repository
 */
export async function testProfileRepository() {
  console.log('🧪 Testing Profile Repository...');
  
  const repository = getProfileRepository();
  
  try {
    // Test: Check if repository is ready
    const isReady = await repository.isReady();
    console.log('✅ Repository ready:', isReady);
    
    // Test: Get initial profile count
    const initialCount = await repository.getCount();
    console.log('📊 Initial profile count:', initialCount.data || 0);
    
    // Test: Create a test profile
    const testCategory: StreamCategory = {
      id: '509658',
      name: 'Just Chatting'
    };
    
    const testProfile: CreateProfileInput = {
      name: 'Test Morning Pages',
      description: 'A test profile for daily journaling',
      category: testCategory,
      title: 'Morning Pages - {DAY} {YYYY-MM-DD}',
      tags: ['journaling', 'morning', 'productivity']
    };
    
    console.log('📝 Creating test profile...');
    const createResult = await repository.create(testProfile);
    
    if (createResult.success && createResult.data) {
      console.log('✅ Profile created:', createResult.data.name);
      const profileId = createResult.data.id;
      
      // Test: Get the created profile
      console.log('🔍 Getting profile by ID...');
      const getResult = await repository.getById(profileId);
      
      if (getResult.success && getResult.data) {
        console.log('✅ Profile retrieved:', getResult.data.name);
        
        // Test: Update the profile
        console.log('✏️ Updating profile...');
        const updateResult = await repository.update(profileId, {
          title: 'Updated Morning Pages - {DAY} {YYYY-MM-DD}',
          tags: ['journaling', 'morning', 'productivity', 'updated']
        });
        
        if (updateResult.success) {
          console.log('✅ Profile updated');
          
          // Test: Search for profiles
          console.log('🔎 Searching profiles...');
          const searchResult = await repository.search('morning');
          
          if (searchResult.success && searchResult.data) {
            console.log('✅ Search results:', searchResult.data.length);
          }
          
          // Test: Get all profiles
          console.log('📋 Getting all profiles...');
          const allResult = await repository.getAll();
          
          if (allResult.success && allResult.data) {
            console.log('✅ All profiles:', allResult.data.length);
          }
          
          // Test: Delete the profile
          console.log('🗑️ Deleting test profile...');
          const deleteResult = await repository.delete(profileId);
          
          if (deleteResult.success) {
            console.log('✅ Profile deleted');
            
            // Verify deletion
            const finalCount = await repository.getCount();
            console.log('📊 Final profile count:', finalCount.data || 0);
          } else {
            console.error('❌ Failed to delete profile:', deleteResult.error);
          }
        } else {
          console.error('❌ Failed to update profile:', updateResult.error);
        }
      } else {
        console.error('❌ Failed to get profile:', getResult.error);
      }
    } else {
      console.error('❌ Failed to create profile:', createResult.error);
    }
    
    console.log('🎉 Profile repository test completed!');
    
  } catch (error) {
    console.error('💥 Profile repository test failed:', error);
  }
}

/**
 * Test the category repository
 */
export async function testCategoryRepository() {
  console.log('🧪 Testing Category Repository...');
  
  const repository = getCategoryRepository();
  
  try {
    // Test: Get default categories
    console.log('📋 Getting default categories...');
    const defaultCategories = repository.getDefaultCategories();
    console.log('✅ Default categories loaded:', defaultCategories.length);
    
    // Test: Cache the default categories
    console.log('💾 Caching default categories...');
    const cacheResult = await repository.cacheCategories(defaultCategories);
    
    if (cacheResult.success) {
      console.log('✅ Categories cached');
      
      // Test: Get all cached categories
      console.log('📋 Getting cached categories...');
      const allResult = await repository.getAll();
      
      if (allResult.success && allResult.data) {
        console.log('✅ Cached categories retrieved:', allResult.data.length);
        
        // Test: Search categories
        console.log('🔎 Searching categories...');
        const searchResult = await repository.search('chat');
        
        if (searchResult.success && searchResult.data) {
          console.log('✅ Search results:', searchResult.data.length);
          searchResult.data.forEach(cat => console.log(`  - ${cat.name}`));
        }
        
        // Test: Get category by ID
        if (allResult.data.length > 0) {
          const firstCategory = allResult.data[0];
          console.log('🔍 Getting category by ID...');
          const getResult = await repository.getById(firstCategory.id);
          
          if (getResult.success && getResult.data) {
            console.log('✅ Category retrieved:', getResult.data.name);
          }
        }
        
        // Test: Get cache stats
        console.log('📊 Getting cache stats...');
        const statsResult = await repository.getCacheStats();
        
        if (statsResult.success && statsResult.data) {
          console.log('✅ Cache stats:', statsResult.data);
        }
        
        // Test: Check if cache needs refresh
        console.log('🔄 Checking cache refresh status...');
        const needsRefresh = await repository.needsRefresh();
        console.log('✅ Needs refresh:', needsRefresh);
        
      } else {
        console.error('❌ Failed to get cached categories:', allResult.error);
      }
    } else {
      console.error('❌ Failed to cache categories:', cacheResult.error);
    }
    
    console.log('🎉 Category repository test completed!');
    
  } catch (error) {
    console.error('💥 Category repository test failed:', error);
  }
}

/**
 * Test validation functions
 */
export async function testValidation() {
  console.log('🧪 Testing Validation Functions...');
  
  try {
    const { validateProfile, processTitle } = await import('@/types/ProfileUtils');
    
    // Test: Valid profile
    const validProfile: CreateProfileInput = {
      name: 'Test Profile',
      description: 'A valid test profile',
      category: { id: '509658', name: 'Just Chatting' },
      title: 'Test Stream - {DAY} {YYYY-MM-DD}',
      tags: ['test', 'demo']
    };
    
    console.log('✅ Testing valid profile...');
    const validResult = validateProfile(validProfile);
    console.log('✅ Valid profile result:', validResult.isValid ? 'PASS' : 'FAIL');
    
    if (!validResult.isValid) {
      console.log('❌ Validation errors:', validResult.errors);
    }
    
    // Test: Invalid profile
    const invalidProfile: CreateProfileInput = {
      name: '', // Empty name
      category: { id: '', name: '' }, // Empty category
      title: '', // Empty title
      tags: new Array(15).fill('tag') // Too many tags
    };
    
    console.log('✅ Testing invalid profile...');
    const invalidResult = validateProfile(invalidProfile);
    console.log('✅ Invalid profile result:', !invalidResult.isValid ? 'PASS' : 'FAIL');
    
    if (!invalidResult.isValid) {
      console.log('✅ Expected validation errors:', invalidResult.errors.length);
    }
    
    // Test: Title processing
    console.log('✅ Testing title processing...');
    const titleResult = processTitle('Morning Pages - {DAY} {YYYY-MM-DD}');
    console.log('✅ Processed title:', titleResult.processed);
    console.log('✅ Replacements:', titleResult.replacements);
    
    console.log('🎉 Validation test completed!');
    
  } catch (error) {
    console.error('💥 Validation test failed:', error);
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🚀 Starting Repository Tests...\n');
  
  try {
    await testValidation();
    console.log('\n');
    await testCategoryRepository();
    console.log('\n');
    await testProfileRepository();
    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('💥 Test suite failed:', error);
  }
}

/**
 * Clean up test data
 */
export async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  
  try {
    const profileRepo = getProfileRepository();
    const categoryRepo = getCategoryRepository();
    
    // Clear all profiles
    const profileResult = await profileRepo.deleteAll();
    if (profileResult.success) {
      console.log('✅ Profiles cleared');
    }
    
    // Clear category cache
    const categoryResult = await categoryRepo.clearCache();
    if (categoryResult.success) {
      console.log('✅ Category cache cleared');
    }
    
    console.log('🎉 Cleanup completed!');
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error);
  }
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).testRepository = {
    runAllTests,
    testProfileRepository,
    testCategoryRepository,
    testValidation,
    cleanupTestData
  };
  
  console.log('🧪 Repository tests available in console:');
  console.log('  - testRepository.runAllTests()');
  console.log('  - testRepository.testProfileRepository()');
  console.log('  - testRepository.testCategoryRepository()');
  console.log('  - testRepository.testValidation()');
  console.log('  - testRepository.cleanupTestData()');
}
