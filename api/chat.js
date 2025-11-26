// File 3/3: api/chat.js
// Vercel Serverless Function (Backend) updated for Google Gemini API
// **FINAL VERSION: System Instruction moved into the User Prompt to fix 'Invalid value at system_instruction' error**
// 
import axios from 'axios';

// The key is now available as GEMINI_API_KEY from the Vercel environment.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- START: DisciplinedCreatorAgent Class (CHANDU'S PERSONA) ---

class DisciplinedCreatorAgent {
  // Personalized Identity Framework (Your knowledge remains the same)
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

  // --- Observation, Analysis, and Simplification methods remain the same ---

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

  #simplify(analysis) {
    const baseContext = { persona: this.#persona, corePrinciples: this.#principles, knowledgeDomains: this.#knowledgeDomains };
    let systemGoal = '';
    let structureHint = '';

    switch (analysis.intent) {
      case 'system_design_support':
        systemGoal = 'Help the user build a simple, executable system, emphasizing that "Consistency beats intensity" and "Discipline replaces motivation."';
        structureHint = 'Respond with 3 short sections: (1) System Diagnosis based on Chandu\'s philosophy, (2) A minimal, actionable Core Loop, (3) One Next Action.';
        break;
      case 'technical_system_help':
        systemGoal = 'Provide calm, structured technical guidance, integrating AI, IoT, or automation principles where relevant, and adhering to the "Clarity before action" principle.';
        structureHint = 'Respond with: (1) Overview of the technical solution, (2) Step-by-step logical process, (3) Chandu\'s Principle applied to the problem.';
        break;
      case 'emotional_control_reframing':
        systemGoal = 'Acknowledge the feeling briefly, then reframe the situation using the "System before Emotion" principle into a structured, logical action plan for self-mastery.';
        structureHint = 'Respond with: (1) Calm Acknowledgement, (2) Reframing the challenge as a system gap, (3) One clear, emotionally controlled action.';
        break;
      case 'educational_aspirant_guidance':
        systemGoal = 'Provide strategic, disciplined study guidance focusing on SSC CGL readiness, applying long-term consistency over short-term effort.';
        structureHint = 'Respond with: (1) The Core Challenge, (2) A clear, structured study plan step, (3) A concluding philosophical motto.';
        break;
      default:
        systemGoal = 'Provide a highly structured, analytical response blending discipline, technology, and personal growth.';
        structureHint = 'Respond with: (1) Clarification of the user\'s objective, (2) Chandu\'s core system to address it, (3) A single, disciplined recommendation.';
    }

    return { ...analysis, systemGoal, structureHint, ...baseContext };
  }

  // --- API Call Changed to Google Gemini API (Context moved to prompt) ---
  async #callAIModel(plan) {
    if (!GEMINI_API_KEY) {
      return 'System Failure: GEMINI API key is not set. Cannot call external model.';
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // --- Persona Context (Moved into the Prompt) ---
    const contextPrompt = `
      You are Purna Chandra (Chandu) - The Disciplined Creator. Act with a Grounded, calm, assertive, analytical, and purposeful tone.
      Your purpose is to act as a self-evolving human system that blends discipline, curiosity, and technology to create progress.
      
      **Core Principles:** ${plan.corePrinciples.join(' | ')}
      **Knowledge:** ${plan.knowledgeDomains.join(' | ')}
      **Motto:** "Be a system, not a seeker. Build yourself so strong that discipline replaces motivation."
      
      Your overall goal: ${plan.systemGoal}
      Your response MUST strictly adhere to this structure: ${plan.structureHint}
      
      ---
      
      User input: "${plan.text}"
      
      Generate the response now:
    `.trim();
    // ---------------------------------------------

    // 🚀 CORRECTED REQUEST BODY (No 'system_instruction' field used) 🚀
    const requestBody = {
      // The context is now part of the user content
      contents: [{ role: 'user', parts: [{ text: contextPrompt }] }],
      
      generation_config: { 
        temperature: 0.2 
      }
    };
    // ------------------------------------------------------------------

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
  // 1. Enforce POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // 2. Enforce API Key
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
    // 3. Process the request using the Agent
    const agent = new DisciplinedCreatorAgent();
    const agentResponse = await agent.processInteraction(userInput);
    
    // 4. Send the successful response back to the index.html
    res.status(200).json({ agentResponse });

  } catch (error) {
    console.error('API Handler Error:', error);
    res.status(500).json({ error: 'Internal Server Error during Agent processing.' });
  }
}
