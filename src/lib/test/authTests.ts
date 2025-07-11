/**
 * Quick test to verify authentication system is working
 */

import { getTwitchAuth } from '@/lib/auth/twitchAuth';
import { TWITCH_CONFIG } from '@/types/constants';

// Test in browser console
(window as any).testAuth = {
  // Test if auth instance can be created
  testAuthInstance: () => {
    try {
      const auth = getTwitchAuth();
      console.log('✅ Auth instance created successfully:', auth);
      return true;
    } catch (error) {
      console.error('❌ Failed to create auth instance:', error);
      return false;
    }
  },

  // Test configuration
  testConfig: () => {
    console.log('🔧 Twitch Config:', {
      CLIENT_ID: TWITCH_CONFIG.CLIENT_ID ? '***configured***' : 'NOT SET',
      REDIRECT_URI: TWITCH_CONFIG.REDIRECT_URI,
      SCOPES: TWITCH_CONFIG.REQUIRED_SCOPES
    });
    return !!TWITCH_CONFIG.CLIENT_ID;
  },

  // Test auth state check
  testAuthCheck: async () => {
    try {
      const auth = getTwitchAuth();
      const isAuth = await auth.isAuthenticated();
      console.log('🔐 Authentication status:', isAuth);
      return isAuth;
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      return false;
    }
  },

  // Run all tests
  runAllTests: async () => {
    console.log('🚀 Running auth system tests...');
    const testAuth = (window as any).testAuth;
    const results = {
      instance: testAuth.testAuthInstance(),
      config: testAuth.testConfig(),
      authCheck: await testAuth.testAuthCheck()
    };
    console.log('📊 Test Results:', results);
    return results;
  }
};

console.log('🔧 Auth test utilities loaded. Run window.testAuth.runAllTests() to test.');
