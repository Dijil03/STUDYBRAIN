// Using built-in fetch (Node.js 18+)

const testAI = async () => {
  try {
    console.log('🧪 Testing AI Backend...');
    
    // Test 1: Create session
    console.log('\n1. Creating AI session...');
    const sessionResponse = await fetch('http://localhost:5001/api/ai/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: 'test-user' })
    });
    
    const sessionData = await sessionResponse.json();
    console.log('Session response:', sessionData);
    
    if (!sessionData.success) {
      throw new Error('Failed to create session');
    }
    
    const sessionId = sessionData.data.sessionId;
    console.log('✅ Session created:', sessionId);
    
    // Test 2: Send message
    console.log('\n2. Sending test message...');
    const messageResponse = await fetch('http://localhost:5001/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId,
        message: 'Hello, can you help me with math?'
      })
    });
    
    console.log('Message response status:', messageResponse.status);
    console.log('Message response headers:', Object.fromEntries(messageResponse.headers.entries()));
    
    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      console.error('❌ Error response:', errorText);
      return;
    }
    
    // Read streaming response
    console.log('\n3. Reading streaming response...');
    const reader = messageResponse.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content') {
              process.stdout.write(data.content);
              fullResponse += data.content;
            } else if (data.type === 'complete') {
              console.log('\n✅ Response complete!');
              console.log('Full response length:', fullResponse.length);
              return;
            }
          } catch (e) {
            // Ignore parsing errors for non-JSON lines
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAI();
