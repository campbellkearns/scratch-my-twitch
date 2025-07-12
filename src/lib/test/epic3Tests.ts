/**
 * Epic 3 Testing Guide - Stream Information Update
 * 
 * Manual testing instructions for verifying Twitch API integration.
 * Run these tests to ensure all Epic 3 functionality is working correctly.
 */

/**
 * TEST SUITE: Epic 3 - Stream Information Update
 * 
 * Prerequisites:
 * 1. Ensure TWITCH_CLIENT_ID is configured in environment
 * 2. Have a test Twitch account ready for authentication
 * 3. Browser console open for debugging
 */

// Test 1: API Client Initialization
console.log('🧪 Epic 3 Test Suite - Stream Information Update');

// Import the API client for testing
import { getTwitchAPI, checkTwitchAPIHealth } from '@/lib/api/twitchAPI';

export const testEpic3 = {
  /**
   * Test 1: API Health Check
   */
  async testAPIHealth() {
    console.log('\n📡 Test 1: API Health Check');
    
    try {
      const health = await checkTwitchAPIHealth();
      console.log('Health check result:', health);
      
      if (health.isAvailable) {
        console.log('✅ API is available');
        console.log(`📊 Response time: ${health.responseTime}ms`);
      } else {
        console.log('❌ API is unavailable');
        console.log(`🚨 Error: ${health.error}`);
      }
      
      return health.isAvailable;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  },

  /**
   * Test 2: Category Search (Offline)
   */
  async testCategorySearchOffline() {
    console.log('\n🔍 Test 2: Category Search (Offline)');
    
    const api = getTwitchAPI();
    
    try {
      const result = await api.searchCategories('Just Chatting', 5);
      console.log('Search result:', result);
      
      if (result.success && result.data) {
        console.log(`✅ Found ${result.data.length} categories`);
        result.data.forEach((cat, i) => {
          console.log(`  ${i + 1}. ${cat.name} (ID: ${cat.id})`);
        });
        return true;
      } else {
        console.log('❌ Search failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      return false;
    }
  },

  /**
   * Test 3: Authentication Check
   */
  async testAuthentication() {
    console.log('\n🔐 Test 3: Authentication Check');
    
    const { isAuthenticated, getCurrentUser } = await import('@/lib/auth/twitchAuth');
    
    try {
      const isAuth = await isAuthenticated();
      console.log('Is authenticated:', isAuth);
      
      if (isAuth) {
        const user = await getCurrentUser();
        if (user) {
          console.log(`✅ Authenticated as: ${user.display_name} (${user.login})`);
          return true;
        } else {
          console.log('❌ Failed to get user info');
          return false;
        }
      } else {
        console.log('❌ Not authenticated');
        console.log('💡 Please authenticate to test profile application');
        return false;
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      return false;
    }
  },

  /**
   * Test 4: Profile Application (Requires Auth)
   */
  async testProfileApplication(testProfile = null) {
    console.log('\n🎮 Test 4: Profile Application');
    
    // Create a test profile if none provided
    const profile = testProfile || {
      id: 'test-profile',
      name: 'Epic 3 Test Profile',
      description: 'Testing Epic 3 integration',
      category: {
        id: '509658', // Just Chatting
        name: 'Just Chatting'
      },
      title: 'Epic 3 Test Stream - {DAY}',
      tags: ['English', 'Programming', 'Test'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const api = getTwitchAPI();
    
    try {
      console.log('Applying test profile:', profile.name);
      const result = await api.applyProfile(profile);
      
      if (result.success) {
        console.log('✅ Profile applied successfully!');
        console.log('📊 API Response:', result);
        
        // Verify by getting current channel info
        const channelResult = await api.getCurrentChannelInfo();
        if (channelResult.success && channelResult.data) {
          console.log('📺 Current channel info:');
          console.log(`  Title: ${channelResult.data.title}`);
          console.log(`  Category: ${channelResult.data.game_name}`);
          console.log(`  Tags: ${channelResult.data.tags.join(', ')}`);
        }
        
        return true;
      } else {
        console.log('❌ Profile application failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Application error:', error);
      return false;
    }
  },

  /**
   * Test 5: Error Handling
   */
  async testErrorHandling() {
    console.log('\n🚨 Test 5: Error Handling');
    
    const api = getTwitchAPI();
    
    // Test with invalid category ID
    const invalidProfile = {
      id: 'invalid-test',
      name: 'Invalid Test',
      category: {
        id: 'invalid-id',
        name: 'Invalid Category'
      },
      title: 'Error Test',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      console.log('Testing error handling with invalid profile...');
      const result = await api.applyProfile(invalidProfile);
      
      if (!result.success) {
        console.log('✅ Error handling working correctly');
        console.log('📋 Error details:', result.error);
        return true;
      } else {
        console.log('❌ Expected error but got success');
        return false;
      }
    } catch (error) {
      console.log('✅ Error properly caught:', error.message);
      return true;
    }
  },

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Epic 3 Integration Tests...\n');
    
    const results = {
      healthCheck: await this.testAPIHealth(),
      categorySearch: await this.testCategorySearchOffline(),
      authentication: await this.testAuthentication(),
      errorHandling: await this.testErrorHandling()
    };

    // Only test profile application if authenticated
    if (results.authentication) {
      results.profileApplication = await this.testProfileApplication();
    } else {
      console.log('\n⚠️ Skipping profile application test (not authenticated)');
      results.profileApplication = null;
    }

    console.log('\n📊 Epic 3 Test Results:');
    console.log('========================');
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed === null ? '⚠️ SKIPPED' : (passed ? '✅ PASSED' : '❌ FAILED');
      console.log(`${test}: ${status}`);
    });

    const passedTests = Object.values(results).filter(r => r === true).length;
    const totalTests = Object.values(results).filter(r => r !== null).length;
    
    console.log(`\n🏆 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 Epic 3 implementation is working correctly!');
    } else {
      console.log('🔧 Some tests failed - check implementation');
    }

    return results;
  }
};

// Auto-run tests if in development mode
if (process.env.NODE_ENV === 'development') {
  // Expose to global scope for easy console access
  (window as any).testEpic3 = testEpic3;
  console.log('🧪 Epic 3 tests available as window.testEpic3');
  console.log('💡 Run window.testEpic3.runAllTests() to test the implementation');
}

export default testEpic3;