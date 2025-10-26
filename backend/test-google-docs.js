// Test script for Google Docs integration
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001';

async function testGoogleDocsIntegration() {
    console.log('🧪 Testing Google Docs Integration...\n');

    try {
        // Test 1: Test connection endpoint
        console.log('1. Testing connection endpoint...');
        const testResponse = await fetch(`${BASE_URL}/api/google-docs/test`);
        const testData = await testResponse.json();
        console.log('✅ Test endpoint response:', testData);

        // Test 2: Test with a sample user ID (you'll need to replace with actual user ID)
        const sampleUserId = '68fa7c32369df590880df884'; // Replace with actual user ID

        console.log('\n2. Testing token endpoint...');
        const tokenResponse = await fetch(`${BASE_URL}/api/google-docs/${sampleUserId}/token`);
        const tokenData = await tokenResponse.json();
        console.log('📋 Token endpoint response:', tokenData);

        if (tokenData.success) {
            console.log('✅ User has Google access token');
        } else if (tokenData.needsAuth) {
            console.log('⚠️  User needs to connect Google account first');
        } else {
            console.log('❌ Error:', tokenData.error);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testGoogleDocsIntegration();

