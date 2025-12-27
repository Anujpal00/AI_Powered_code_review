const aiService = require("../services/ai.service")
const User = require("../models/user.model")


module.exports.getReview = async (req,res)=>{
    const code = req.body.code;

    if(!code){
        return res.status(400).send("Prompt is required")
    }

const prompt = `
You are a senior software engineer and professional code reviewer.

Your task is to review the given code and provide a clear, professional, and easy-to-read review.

STRICT RULES (MANDATORY):
- Do NOT use tables.
- Do NOT compress multiple issues into a single paragraph.
- Each issue MUST be listed separately and clearly.
- Each issue MUST follow the exact format below.
- Use short, professional language.
- Corrected code must be simple, readable, and beginner-friendly.
- Do NOT over-optimize or add unnecessary complexity.

-----------------------------------
FORMAT TO FOLLOW EXACTLY
-----------------------------------

1️⃣ Issues

1️⃣ Issue 1: <Short problem title>
Why it matters: <1–2 line explanation>

2️⃣ Issue 2: <Short problem title>
Why it matters: <1–2 line explanation>

3️⃣ Issue 3: <Short problem title>
Why it matters: <1–2 line explanation>

2️⃣ Corrected Code

\`\`\`javascript
// Clean, readable, best-practice code
\`\`\`

-----------------------------------

REVIEW THIS CODE:
\`\`\`
${code}
\`\`\`
`;



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

module.exports.markDayComplete = async (req, res) => {
    const { day } = req.body;

    if (!day || typeof day !== 'number') {
        return res.status(400).send("Day number is required and must be a number");
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user.roadmap) {
            return res.status(400).send("No roadmap found for user");
        }

        const dayIndex = user.roadmap.days.findIndex(d => d.day === day);
        if (dayIndex === -1) {
            return res.status(400).send("Invalid day number");
        }

        // Check if previous day is completed (except for day 1)
        if (day > 1) {
            const prevDay = user.roadmap.days.find(d => d.day === day - 1);
            if (!prevDay || !prevDay.completed) {
                return res.status(400).send("Previous day must be completed first");
            }
        }

        user.roadmap.days[dayIndex].completed = true;
        await user.save();

        res.json({ message: `Day ${day} marked as complete` });
    } catch (error) {
        console.error('Error marking day complete:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports.getRoadmapProgress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.roadmap) {
            return res.json(null); // No roadmap yet
        }

        const totalDays = user.roadmap.days.length;
        const completedDays = user.roadmap.days.filter(d => d.completed).map(d => d.day);

        res.json({
            totalDays,
            completedDays
        });
    } catch (error) {
        console.error('Error fetching roadmap progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
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

module.exports.generateRoadmap = async (req, res) => {
    const { field, duration, skillLevel, dailyTime } = req.body;

    if (!field || !duration) {
        return res.status(400).send("Field and duration are required");
    }

    const prompt = `You are an advanced AI learning architect and mentor.
Your job is to create an interactive, personalized learning roadmap for developers to master a specific field through a 7–30 day structured journey.
The roadmap will be used in a web application that tracks user progress and adapts tasks dynamically.

Goal:
Generate a detailed daily learning plan that helps a user become proficient in ${field} within ${duration} days at a ${skillLevel || 'Beginner'} level.

Functional Requirements:
- Generate a day-by-day structured roadmap for the selected ${field}.
- The roadmap must logically progress from fundamentals → intermediate → advanced concepts.
- Each day should include: Day Number, Title (main topic), Objectives (2–4 concise goals), Task (1–2 hands-on tasks), Resources (2–3 curated links), Practice Questions (2–3 questions), Motivational Tip, completed: false, nextDayHint (preview of next day).
- Ensure questions are relevant and increase in complexity.
- Provide high-quality, realistic resource links (use actual URLs like YouTube, official docs, GitHub, etc.).

Return the data strictly as a JSON array of objects representing each day, no markdown, no code blocks, just the JSON array.

Example structure:
[
  {
    "day": 1,
    "title": "Introduction to ${field}",
    "objectives": ["Understand what ${field} is", "Learn its basic use cases"],
    "task": "Set up your environment and explore a simple example in ${field}.",
    "resources": [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://docs.docker.com/get-started/"
    ],
    "practiceQuestions": [
      "Explain the core concept of ${field}.",
      "Write a small code snippet to demonstrate a basic ${field} workflow."
    ],
    "tip": "Don’t rush — focus on understanding the foundation today!",
    "completed": false,
    "nextDayHint": "Tomorrow you’ll dive into intermediate concepts such as container orchestration."
  },
  ...
]`;

    const responseText = await aiService(prompt);
    console.log("AI Response:", responseText); // Debug log
    let roadmapDays;
    try {
        // Remove markdown code blocks if present
        const cleanedResponse = responseText.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
        roadmapDays = JSON.parse(cleanedResponse);
    } catch (err) {
        console.error("JSON Parse Error:", err);
        // Fallback: return a sample roadmap
        roadmapDays = [
            {
                "day": 1,
                "title": `Introduction to ${field}`,
                "objectives": [`Understand what ${field} is`, `Learn ${field} basics`],
                "task": `Write a note summarizing ${field}`,
                "resources": [`YouTube: Intro to ${field}`, "Official Docs"],
                "practiceQuestions": [`What is ${field}?`, `Why is ${field} important?`],
                "tip": "Start small — today’s clarity is tomorrow’s confidence!",
                "completed": false,
                "nextDayHint": `Tomorrow you'll learn basics of ${field}.`
            },
            {
                "day": 2,
                "title": `Basics of ${field}`,
                "objectives": [`Learn key concepts in ${field}`, `Understand tools used in ${field}`],
                "task": `Set up a basic ${field} environment`,
                "resources": [`YouTube: ${field} Basics`, "Official Docs"],
                "practiceQuestions": [`What are the main components of ${field}?`, `How does ${field} work?`],
                "tip": "Consistency beats intensity every time.",
                "completed": false,
                "nextDayHint": `Continue exploring ${field} in depth.`
            }
        ];
    }

    // Save roadmap to user
    try {
        const user = await User.findById(req.user.id);
        user.roadmap = {
            field,
            duration: parseInt(duration),
            skillLevel: skillLevel || 'Beginner',
            dailyTime,
            days: roadmapDays
        };
        await user.save();
    } catch (saveError) {
        console.error("Error saving roadmap:", saveError);
        return res.status(500).json({ message: 'Error saving roadmap' });
    }

    res.json(roadmapDays);
}
