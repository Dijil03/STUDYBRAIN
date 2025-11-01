/**
 * AI Feature Test Script
 * Tests the AI chat functionality with Hugging Face integration
 */

import { OpenAI } from "openai";
import dotenv from 'dotenv';

dotenv.config();

// Test AI functionality
async function testAI() {
    console.log('🤖 Testing AI Assistant Feature...\n');

    // Check environment variables
    if (!process.env.HF_TOKEN) {
        console.error('❌ HF_TOKEN environment variable is missing!');
        console.log('Please add HF_TOKEN to your .env file');
        return;
    }

    console.log('✅ Environment variables loaded');

    // Initialize OpenAI client with Hugging Face
    const client = new OpenAI({
        baseURL: "https://router.huggingface.co/v1",
        apiKey: process.env.HF_TOKEN,
    });

    console.log('✅ OpenAI client initialized with Hugging Face');

    try {
        // Test basic chat completion
        console.log('\n📝 Testing chat completion...');

        const chatCompletion = await client.chat.completions.create({
            model: "deepseek-ai/DeepSeek-V3.2-Exp:novita",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI assistant integrated into a study platform. Help users with their academic questions, study planning, and learning goals. Be encouraging and educational in your responses."
                },
                {
                    role: "user",
                    content: "Hello! Can you help me understand what this AI feature does?"
                },
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        console.log('✅ Chat completion successful!');
        console.log('\n🤖 AI Response:');
        console.log('─'.repeat(50));
        console.log(chatCompletion.choices[0].message.content);
        console.log('─'.repeat(50));

        // Display usage information
        if (chatCompletion.usage) {
            console.log('\n📊 Token Usage:');
            console.log(`   Prompt tokens: ${chatCompletion.usage.prompt_tokens}`);
            console.log(`   Completion tokens: ${chatCompletion.usage.completion_tokens}`);
            console.log(`   Total tokens: ${chatCompletion.usage.total_tokens}`);
        }

        console.log('\n🎉 AI Assistant feature is working correctly!');
        console.log('\nNext steps:');
        console.log('1. Start your backend server: npm run dev');
        console.log('2. Start your frontend: npm run dev');
        console.log('3. Navigate to /ai in your browser');
        console.log('4. Start chatting with the AI assistant!');

    } catch (error) {
        console.error('❌ Error testing AI functionality:', error.message);

        if (error.message.includes('401')) {
            console.log('\n💡 This might be an authentication issue. Please check:');
            console.log('   - Your HF_TOKEN is correct');
            console.log('   - Your Hugging Face account has access to the model');
        } else if (error.message.includes('429')) {
            console.log('\n💡 Rate limit exceeded. Please try again later.');
        } else if (error.message.includes('500')) {
            console.log('\n💡 Server error. The Hugging Face API might be down.');
        }
    }
}

// Run the test
testAI();
