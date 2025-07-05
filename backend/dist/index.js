import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
const app = express();
import { OpenAI } from "openai";
app.use(cors());
app.use(express.json());
// Groq LLM chat API
// Make sure to set GROQ_API_KEY in your .env file
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const openai = new OpenAI({
    apiKey: GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});
app.post('/chat', async (req, res) => {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
    }
    try {
        // Groq expects OpenAI-style messages
        const response = await openai.chat.completions.create({
            model: "llama3-70b-8192",
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            max_tokens: 512,
            temperature: 0.7
        });
        const reply = response.choices[0]?.message?.content || "";
        res.json({ reply });
    }
    catch (err) {
        console.error("Groq API error:", err);
        res.status(500).json({ error: "Failed to get LLM reply" });
    }
});
// This endpoint takes a prompt and returns two arrays of prompts: one for the
// backend and one for the frontend. The prompts are used to generate code
// based on the user's input. The endpoint is used to support Bolt's ability to
// generate code based on a user's input in the Web UI.
//
// The endpoint is a temporary solution until Bolt supports generating code
// directly from the UI. The endpoint will be removed once Bolt supports
// generating code directly.
app.post('/template', async (req, res) => {
    const prompt = req.body.prompt;
    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }
    try {
        // Compose a system prompt for Groq LLM to generate a React app file structure as JSON
        const systemPrompt = `You are a code generation assistant. Given a user prompt, generate a minimal React app project as a JSON array of files and folders. Each file/folder should be an object with: name, type ("file" or "folder"), content (for files), and children (for folders). For example:

[
  {"name": "src", "type": "folder", "children": [
    {"name": "App.js", "type": "file", "content": "// ..."},
    {"name": "index.js", "type": "file", "content": "// ..."}
  ]},
  {"name": "package.json", "type": "file", "content": "{...}"}
]

Only return the JSON array, nothing else. The app should fulfill the user's request: "${prompt}"`;
        const response = await openai.chat.completions.create({
            model: "llama3-70b-8192",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            max_tokens: 2048,
            temperature: 0.7
        });
        // Try to extract JSON from the LLM response
        const text = response.choices[0]?.message?.content || "";
        let files;
        try {
            files = JSON.parse(text);
        }
        catch (e) {
            // Attempt to extract JSON substring if LLM adds extra text
            const match = text.match(/\[.*\]/s);
            if (match) {
                files = JSON.parse(match[0]);
            }
            else {
                return res.status(500).json({ error: "LLM did not return valid JSON." });
            }
        }
        res.json({ files });
    }
    catch (err) {
        console.error("Groq API error (template):", err);
        res.status(500).json({ error: "Failed to generate app files." });
    }
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
