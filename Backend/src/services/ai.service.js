const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateContent(prompt) {
  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b", 
      messages: [
        {
          role: "system",
          content:
            "You are a senior software engineer. Review the given code and provide feedback on bugs, security issues, performance, and best practices.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("LLaMA (Groq) Error:", error);
    throw new Error("Failed to generate AI response");
  }
}

module.exports = generateContent;
