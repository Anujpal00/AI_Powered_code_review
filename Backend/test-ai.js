const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function testAI() {
  try {
    const result = await model.generateContent("Hello, world!");
    console.log('Success:', result.response.text());
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAI();
