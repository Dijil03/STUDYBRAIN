import dotenv from 'dotenv';
import aiService from './src/services/aiService.js';

dotenv.config();

async function testGemini() {
    console.log('🧪 Testing Gemini AI Integration...\n');

    // Check if Gemini API key is set
    if (!process.env.GEMINI_API_KEY) {
        console.log('❌ GEMINI_API_KEY not set in environment variables');
        console.log('📝 Please add GEMINI_API_KEY=your_token_here to your .env file');
        console.log('🔗 Get your free API key from: https://aistudio.google.com/app/apikey');
        return;
    }

    console.log('✅ Gemini API key found');

    // Test 1: Check API availability
    console.log('\n1. Checking AI service availability...');
    try {
        const isAvailable = await aiService.checkAPIAvailability();
        console.log(`   Status: ${isAvailable ? '✅ Available' : '❌ Unavailable'}`);
    } catch (error) {
        console.log(`   Error: ${error.message}`);
    }

    // Test 2: Test simple chat
    console.log('\n2. Testing simple chat...');
    try {
        const response = await aiService.generateChatResponse(
            'Hello! Can you help me understand photosynthesis?',
            [],
            'biology'
        );
        console.log(`   ✅ Response: ${response.response.substring(0, 100)}...`);
        console.log(`   Model: ${response.model}`);
        console.log(`   Tokens: ${response.tokens}`);
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 3: Test flashcard generation
    console.log('\n3. Testing flashcard generation...');
    try {
        const flashcards = await aiService.generateFlashcards(
            'Photosynthesis is the process by which plants convert sunlight into energy. The equation is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2',
            'biology',
            3
        );
        console.log(`   ✅ Generated ${flashcards.flashcards.length} flashcards`);
        if (flashcards.flashcards.length > 0) {
            console.log(`   Sample: ${flashcards.flashcards[0].question}`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 4: Test quiz generation
    console.log('\n4. Testing quiz generation...');
    try {
        const quiz = await aiService.generateQuiz(
            'The water cycle includes evaporation, condensation, and precipitation. Water evaporates from oceans, condenses into clouds, and falls as rain.',
            'science',
            2,
            'easy'
        );
        console.log(`   ✅ Generated ${quiz.quiz.length} questions`);
        if (quiz.quiz.length > 0) {
            console.log(`   Sample: ${quiz.quiz[0].question}`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 5: Test homework help
    console.log('\n5. Testing homework help...');
    try {
        const help = await aiService.provideHomeworkHelp(
            'Solve for x: 2x + 5 = 13',
            'mathematics',
            'high school'
        );
        console.log(`   ✅ Help provided: ${help.help.substring(0, 100)}...`);
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('\n🎉 Gemini AI test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. If all tests passed, your Gemini integration is working!');
    console.log('2. Start your backend server: npm run dev');
    console.log('3. Test the AI Assistant in your frontend application');
    console.log('4. The AI will now use Gemini for much better responses!');
}

// Run the test
testGemini().catch(console.error);

