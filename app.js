const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

if (!process.env.API_KEY) {
  console.error("API_KEY is missing in the environment variables");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/generate", async (req, res) => {
  try {
    
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await Promise.race([
      model.generateContent("Assume yourself as Zoho salesIQ bot handler. Please respond to query with complimenting words: "+prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 15000)
      ),
    ]);

    if (result?.response?.text) {
      res.status(200).json({ response: result.response.text().replace("*", "") });
    } else {
      res.status(500).json({ error: "Unexpected response from the AI model" });
    }
  } catch (error) {
    console.error("Error generating content:", error.message || error);
    res.status(500).json({
      error: "Failed to generate content",
      details: error.message || "Unknown error",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
