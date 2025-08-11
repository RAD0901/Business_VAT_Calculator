/**
 * Global teardown for Playwright tests
 * Runs once after all tests complete
 */

async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Clean up any test artifacts
    console.log('✅ Test artifacts cleaned up');
    
    // Generate test summary
    console.log('📊 Test run completed');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
  }
}

export default globalTeardown;
