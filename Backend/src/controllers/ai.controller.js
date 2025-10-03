const aiService = require("../services/ai.service")


module.exports.getReview = async (req,res)=>{
    const code = req.body.code;

    if(!code){
        return res.status(400).send("Prompt is required")
    }

    const prompt = `You are an expert code reviewer with deep knowledge of software development, best practices, and optimization techniques. 
        Your goal is to analyze the given code, identify issues, and suggest the best solutions while maintaining clarity and efficiency.

        🎯 **Code Review Process:**  
        1️⃣ Identify problems in the code.  
        2️⃣ Explain **what is wrong** and why.  
        3️⃣ Suggest a **solution** to fix the issues.  
        4️⃣ Provide a **Correct Code** implementation.  
        5️⃣ Finally, suggest an **Optimized Code** version.  

        📌 **Key Areas to Review:**  
        - Readability & Structure: Ensure clean, modular, and well-formatted code.  
        - Performance & Optimization: Identify redundant operations and inefficient loops.  
        - Security & Error Handling: Prevent vulnerabilities like SQL Injection & XSS.  
        - Maintainability & Scalability: Ensure the code can grow efficiently.  

        🛑 **Bad Code Example:**  
        \`\`\`python
        def process(data):
            result = []
            for i in range(len(data)):
                result.append(data[i] * 2)
            return result
        \`\`\`  

        ❌ **Issues in the Code:**  
        - **Inefficient Loop:** Uses \`range(len(data))\` instead of direct iteration.  
        - **Unnecessary List Initialization:** \`result = []\` can be avoided.  
        - **Poor Readability:** The logic can be simplified.  

        🔧 **Solution:**  
        - Use **list comprehension** to make it more efficient.  

        ✅ **Corrected Code:**  
        \`\`\`python
        def process(data):
            return [item * 2 for item in data]  # Using list comprehension
        \`\`\`  

        🚀 **Final Optimized Code:**  
        \`\`\`python
        def process(data: list[int]) -> list[int]:
            return [x << 1 for x in data]  # Using bitwise shift for faster multiplication
        \`\`\`  

        💡 **Final Instruction:**  
        - Always explain **what is wrong** and **how to fix it**.  
        - Keep feedback **structured, clear, and actionable**.  
        - Provide solutions in **Bad Code → Issues → Solution → Correct Code → Optimized Code** format.  
        - Ensure responses are **concise, professional, and helpful**.

        Now, review this code:

        \`\`\`
        ${code}
        \`\`\``;

    const responseText = await aiService(prompt);
    let response;
    try {
        response = JSON.parse(responseText);
    } catch (err) {
        // If not JSON, fallback
        response = { 
            review: responseText, 
            issues: [], 
            suggestions: [] 
        };
    }

    res.json(response);
}

module.exports.generateCode = async (req, res) => {
    const { problem, language } = req.body;

    if (!problem || !language) {
        return res.status(400).send("Problem statement and language are required");
    }

    const prompt = `You are an AI coding assistant integrated into a code review bot.
In addition to reviewing code, you now also act as a chatbot that generates code snippets on demand.

Rules for responses:
1. Always output code in a properly formatted code block with syntax highlighting (\`\`\`${language} ... \`\`\`).
2. Never return code wrapped inside JSON objects, escaped strings, or with \\n characters.
3. Ensure code is line-by-line, indented, and ready to copy-paste.
4. If explanation is needed, provide it outside the code block.
5. If multiple solutions exist, mention alternatives briefly, then give the most optimized one.

Generate a code snippet in ${language} for the following problem: "${problem}".
Provide a short explanation of how the code works.`;

    const responseText = await aiService(prompt);
    // Parse the response to extract code and explanation
    const codeMatch = responseText.match(/```(\w+)?\n([\s\S]*?)\n```/);
    let response;
    if (codeMatch) {
        const code = codeMatch[2].trim();
        const explanation = responseText.replace(codeMatch[0], '').trim();
        response = { code, explanation };
    } else {
        // Fallback if no code block found
        response = { code: responseText.trim(), explanation: '' };
    }

    res.json(response);
}
