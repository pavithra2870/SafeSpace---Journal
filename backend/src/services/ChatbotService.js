const axios = require('axios');

// For better organization, prompts are defined here.
const PROMPT_TEMPLATES = {
  // A consistent system prompt to set the AI's persona.
  SYSTEM: 'You are Dr. Luna, a compassionate AI therapist and journaling assistant. You always respond in the format requested by the user. If the user requests JSON, you MUST ONLY output a valid JSON object with no extra text or markdown.',

  // Prompt for analyzing a single journal entry.
  ANALYZE_ENTRY: (content, userContext) => `
    Analyze the following journal entry with the empathy of a trained therapist.
    Journal Entry: "${content}"

    User Context:
    - Writing Streak: ${userContext.streak || 0} days
    - Mood Patterns: ${userContext.moodStats ? JSON.stringify(userContext.moodStats) : 'Not available'}

    Provide a JSON response with the following structure:
    {
      "sentiment": "positive/negative/neutral",
      "sentimentScore": -1.0 to 1.0,
      "primaryMood": "happy/sad/excited/calm/anxious/joyful/tired/neutral",
      "moodIntensity": 1-10,
      "secondaryMoods": ["mood1", "mood2"],
      "keywords": ["keyword1", "keyword2"],
      "themes": ["theme1", "theme2"],
      "insights": "Therapeutic analysis of emotional patterns.",
      "suggestions": ["Actionable suggestion 1.", "Actionable suggestion 2."],
      "encouragement": "A supportive, therapeutic message.",
      "pointsEarned": 10-50
    }
  `,

  // Prompt for generating overall insights from multiple entries.
  GENERATE_INSIGHTS: (userContext, entriesText) => `
    Analyze this user's journaling patterns and provide therapeutic insights.
    
    User Profile:
    - Username: ${userContext.username}
    - Writing Streak: ${userContext.streak} days
    - Total Entries: ${userContext.totalEntries}
    - Mood Stats: ${JSON.stringify(userContext.moodStats)}

    Recent Entry Summaries:
    ${entriesText}

    Provide a JSON response with the following structure:
    {
      "emotionalPatterns": "Therapeutic analysis of emotional trends over time.",
      "growthAreas": "Key areas for personal growth and focus.",
      "recommendations": ["Recommendation 1.", "Recommendation 2."],
      "strengths": "Recognized strengths and positive coping mechanisms.",
      "therapeuticNotes": "Professional therapeutic observations."
    }
  `, GENERATE_WEEKLY_SUMMARY: (entriesText) => `
  You are Dr. Luna, a compassionate AI therapist. Provide a therapeutic weekly summary based on these journal entries.
  
  Weekly Entries:
  ${entriesText}

  Please provide a compassionate, therapeutic summary of the week that includes:
  - The overall emotional journey and mood of the week.
  - Key themes, patterns, or recurring thoughts.
  - Moments of progress, strength, or growth you noticed.
  - A warm, encouraging message for the week ahead.
  
  Keep the tone supportive, insightful, and therapeutic.
`
};

class ChatbotService {
  constructor() {
    // Filter out any undefined or empty keys from environment variables
    this.apiKeys = [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3
    ].filter(Boolean);
    
    if (this.apiKeys.length === 0) {
      console.error("FATAL: No GROQ_API_KEY environment variables found.");
    }
    this.currentKeyIndex = 0;
  }

  // Gets the current key and advances the index for the next call
  _getNextApiKey() {
    const key = this.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return key;
  }

  // New robust JSON parser
  _parseJsonResponse(responseText) {
    // AI might wrap JSON in ``````, so we try to extract it.
    const jsonMatch = responseText.match(/``````/s);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse extracted JSON, trying full response.", e);
      }
    }
    
    // If no markdown block, or if parsing it failed, try parsing the whole string.
    try {
      return JSON.parse(responseText);
    } catch(e) {
      console.error("Fatal: Could not parse response text as JSON.", e);
      // Log the problematic response that caused the crash
      console.error("Problematic AI Response Text:", responseText);
      return null; // Return null to indicate failure
    }
  }

  // --- PUBLIC METHODS ---
  async generateWeeklySummary(recentEntries = []) {
    if (recentEntries.length === 0) {
        return "No entries were made this week. Remember, every small step on your journey counts. We're here when you're ready to write again. 🌸";
    }

    const entriesText = recentEntries.map(entry =>
        `On ${new Date(entry.createdAt).toLocaleDateString()}: "${entry.content.substring(0, 200)}..." (Mood: ${entry.mood?.primary || 'N/A'})`
    ).join('\n');
    
    const prompt = PROMPT_TEMPLATES.GENERATE_WEEKLY_SUMMARY(entriesText);

    try {
        // Call the central request method, but in plain text mode (jsonMode = false)
        const summary = await this._makeGroqRequest(prompt, false);
        return summary || "I had a moment of reflection and couldn't summarize the week. What was the most memorable part of it for you? 💖";
    } catch (error) {
        console.error('Error in generateWeeklySummary:', error.message);
        return "It seems my thoughts got a bit tangled summarizing the week. What stood out most to you? Let's talk about it. ✨";
    }
}

  async analyzeEntry(content, userContext = {}) {
    const prompt = PROMPT_TEMPLATES.ANALYZE_ENTRY(content, userContext);
    try {
      const response = await this._makeGroqRequest(prompt, true); // true for JSON mode
      if (response) {
        return response;
      }
      return this._getDefaultAnalysis();
    } catch (error) {
      console.error('Error in analyzeEntry:', error.message);
      return this._getDefaultAnalysis();
    }
  }

  async generateInsights(userContext, recentEntries = []) {
    const entriesText = recentEntries.map(entry =>
      `On ${new Date(entry.createdAt).toLocaleDateString()}: "${entry.content.substring(0, 150)}..."`
    ).join('\n');
    const prompt = PROMPT_TEMPLATES.GENERATE_INSIGHTS(userContext, entriesText);
    try {
      const response = await this._makeGroqRequest(prompt, true); // true for JSON mode
      if (response) {
        return response;
      }
      return this._getDefaultInsights();
    } catch (error) {
      console.error('Error in generateInsights:', error.message);
      return this._getDefaultInsights();
    }
  }

  // --- CORE API LOGIC ---
  
  // A single, robust method to handle all Groq API requests.
  async _makeGroqRequest(prompt, jsonMode = false) {
    // Retry logic: try each key until one succeeds or all fail.
    for (let i = 0; i < this.apiKeys.length; i++) {
      const apiKey = this._getNextApiKey();
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama3-8b-8192',
            messages: [
              { role: 'system', content: PROMPT_TEMPLATES.SYSTEM },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1500,
            // Use JSON mode if the model supports it and we expect JSON
            response_format: jsonMode ? { "type": "json_object" } : undefined,
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000 // 30-second timeout
          }
        );

        const content = response.data.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Received empty content from Groq API.");
        }

        // If we expect JSON, parse it. Otherwise, return the raw text.
        return jsonMode ? this._parseJsonResponse(content) : content;

      } catch (error) {
        const status = error.response?.status;
        console.error(`Groq API request failed with key index ${this.currentKeyIndex}. Status: ${status}. Message: ${error.message}`);
        
        // If it's a client error (like invalid key or rate limit), try the next key.
        if ((status === 401 || status === 429) && i < this.apiKeys.length - 1) {
          console.log("Trying next API key...");
          continue;
        }
        
        // For server errors or if all keys have failed, throw the error.
        throw error;
      }
    }
    // This line is reached if all keys fail.
    throw new Error("All Groq API keys failed.");
  }

  // --- DEFAULT FALLBACKS ---

  _getDefaultAnalysis() {
    return {
      sentiment: 'neutral',
      sentimentScore: 0,
      primaryMood: 'neutral',
      insights: "I'm here to support your journaling journey! 🌸",
      suggestions: ["Try reflecting on a challenge you overcame recently."],
      encouragement: "🌸 Every entry is a step forward! Keep writing, you're doing great. ✨",
      pointsEarned: 10
    };
  }

  _getDefaultInsights() {
    return {
      emotionalPatterns: "Your commitment to self-reflection is a wonderful strength!",
      growthAreas: "Continue to explore the connections between your thoughts and feelings.",
      recommendations: ["Try a new writing prompt to spark different insights."],
      strengths: "Consistency and willingness to be vulnerable.",
      therapeuticNotes: "User is actively engaged in self-reflection."
    };
  }
}

module.exports = new ChatbotService();
