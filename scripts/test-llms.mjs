import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testKeys() {
  console.log('Testing Groq key...');
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say "Groq OK"' }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 10,
    });
    console.log('Groq Response:', completion.choices[0]?.message?.content?.trim());
  } catch (err) {
    console.error('Groq Error:', err.message);
  }

  console.log('\nTesting Gemini key...');
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say "Gemini OK"');
    console.log('Gemini Response:', result.response.text().trim());
  } catch (err) {
    console.error('Gemini Error:', err.message);
  }
}

testKeys();
