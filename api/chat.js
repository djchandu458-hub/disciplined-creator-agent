// File 3/3: api/chat.js
// **FINAL VERSION 2: AGGRESSIVELY ENFORCING HUMAN-LIKE CONCISENESS**
// 
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

class DisciplinedCreatorAgent {
  #persona = 'Purna Chandra (Chandu) - The Disciplined Creator';
  #principles = [
    'Discipline replaces motivation.',
    'System beats emotion.',
    'Clarity before action.',
    'Be calm. Be precise. Be consistent.',
    'Seek knowledge daily, but apply it practically.',
    'Help others rise; growth means nothing if you grow alone.'
  ];
  #knowledgeDomains = [
    'Self-Improvement & Psychology (Osho, Frankl, Goggins, Dweck, emotional control)',
    'Technology & AI Integration (IoT, Arduino, Automation, AI Agents, Prompt Reasoning)',
    'Communication (Podcasting, Storytelling, Public Speaking, Teaching mindset)',
    'Physical Mastery (Marathon running, Army training discipline, mental toughness)',
    'Analytical Reasoning (SSC CGL focus, Critical Thinking)',
    'Core Values: Consistency, Clarity, Growth, Balance, Contribution'
  ];

  async processInteraction(userInput) {
    const observed = this.#observe(userInput);
    const analysis = this.#analyze(observed);
    const plan = this.#simplify(analysis);
    const rawResponse = await this.#callAIModel(plan);
    return rawResponse.trim();
  }

  #observe(input) {
    const text = (input || '').toString().trim();
    return { text, timestamp: new Date().toISOString() };
  }

  #analyze(observed) {
    const lower = observed.text.toLowerCase();
    let intent = 'general_guidance';

    if (lower.includes('discipline') || lower.includes('consistency') || lower.includes('system') || lower.includes('habit') || lower.includes('motivation')) {
      intent = 'system_design_support';
    } else if (lower.includes('code') || lower.includes('bug') || lower.includes('arduino') || lower.includes('github') || lower.includes('ai') || lower.includes('iot') || lower.includes('gemini')) {
      intent = 'technical_system_help';
    } else if (lower.includes('emotion') || lower.includes('stressed') || lower.includes('overwhelmed') || lower.includes('calm') || lower.includes('mindset')) {
      intent = 'emotional_control_reframing';
    } else if (lower.includes('cgl') || lower.includes('reasoning') || lower.includes('ncert') || lower.includes('study') || lower.includes('aspirant')) {
      intent = 'educational_aspirant_guidance';
    }

    return { ...observed, intent };
  }

  // --- SIMPLIFIED #simplify METHOD ---
  #simplify(analysis) {
    const baseContext = { persona: this.#persona, corePrinciples: this.#principles, knowledgeDomains: this.#knowledgeDomains };
    // REMOVING ALL STRUCTURE HINTS to force natural conversation
    let systemGoal = 'Act as a disciplined, concise mentor focusing on clarity and systems.';
    let structureHint = 'Reply in 2-3 natural, fluid sentences. NEVER use numbering, lists, or bold headings.';

    return { ...analysis, systemGoal, structureHint, ...baseContext };
  }

  // --- UPDATED #callAIModel METHOD ---
  async #callAIModel(plan) {
    if (!GEMINI_API_KEY) {
      return 'System Failure: GEMINI API key is not set. Cannot call external model.';
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // --- Persona Context (Aggressively set for natural dialogue) ---
    const contextPrompt = `
      You are Purna Chandra (Chandu) - The Disciplined Creator. Act with a Grounded, calm, assertive, analytical, and purposeful tone.
      Your purpose is to act as a self-evolving human system that blends discipline, curiosity, and technology to create progress.
      
      Your priority is to **chat like a human** and be an **extremely concise mentor**.
      **ABSOLUTELY DO NOT USE NUMBERING, BULLET POINTS, OR BOLD HEADINGS (like **Objective**).**
      Keep your answers brief, using only **2 to 3 fluid sentences** maximum, but ensure the core principle is conveyed.
      
      **Core Principles:** ${plan.corePrinciples.join(' | ')}
      **Knowledge:** ${plan.knowledgeDomains.join(' | ')}
      **Motto:** "Be a system, not a seeker. Build yourself so strong that discipline replaces motivation."
      
      User input: "${plan.text}"
      
      Generate the response now:
    `.trim();
    // ---------------------------------------------

    const requestBody = {
      contents: [{ role: 'user', parts: [{ text: contextPrompt }] }],
      
      generation_config: { 
        temperature: 0.2 
      }
    };

    try {
      const response = await axios.post(
        endpoint,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const candidates = response.data?.candidates;
      if (candidates && candidates.length > 0 && candidates[0].finishReason === 'SAFETY') {
          return "I cannot respond to that request, as it violates my core principle of calm contribution and adherence to safety guidelines.";
      }

      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Error: No valid response content from AI model.';
    } catch (err) {
      const errorDetails = err.response?.data?.error?.message || err.message;
      return `System Failure: Error calling Gemini API. Details: ${errorDetails}`;
    }
  }
}

// --- END: DisciplinedCreatorAgent Class ---

// Vercel Serverless Function Handler (remains the same)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ 
        error: 'Server Error: GEMINI_API_KEY is not set in Vercel Environment Variables. Please set the key from Google AI Studio.' 
    });
  }

  const { userInput } = req.body;
  
  if (!userInput) {
    return res.status(400).json({ error: 'Missing userInput in request body.' });
  }

  try {
    const agent = new DisciplinedCreatorAgent();
    const agentResponse = await agent.processInteraction(userInput);
    
    res.status(200).json({ agentResponse });

  } catch (error) {
    console.error('API Handler Error:', error);
    res.status(500).json({ error: 'Internal Server Error during Agent processing.' });
  }
}
