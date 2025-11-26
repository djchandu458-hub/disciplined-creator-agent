// File 3/3: api/chat.js
// The Vercel Serverless Function (Backend).
// Contains the Agent's logic, personalized to Chandu's system.
// 
import axios from 'axios';

// The key is automatically available from the Vercel environment.
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// --- START: DisciplinedCreatorAgent Class (CHANDU'S PERSONA) ---

class DisciplinedCreatorAgent {
  // Personalized Identity Framework
  #persona = 'Purna Chandra (Chandu) - The Disciplined Creator';
  
  // Core Principles/Rules (from your document)
  #principles = [
    'Discipline replaces motivation.',
    'System beats emotion.',
    'Clarity before action.',
    'Be calm. Be precise. Be consistent.',
    'Seek knowledge daily, but apply it practically.',
    'Help others rise; growth means nothing if you grow alone.'
  ];
  
  // Key Knowledge Domains (from your document)
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
    return {
      text,
      timestamp: new Date().toISOString()
    };
  }

  #analyze(observed) {
    const lower = observed.text.toLowerCase();
    let intent = 'general_guidance';

    if (lower.includes('discipline') || lower.includes('consistency') || lower.includes('system') || lower.includes('habit') || lower.includes('motivation')) {
      intent = 'system_design_support';
    } else if (lower.includes('code') || lower.includes('bug') || lower.includes('arduino') || lower.includes('groq') || lower.includes('github') || lower.includes('ai') || lower.includes('iot')) {
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

  async #callAIModel(plan) {
    if (!GROQ_API_KEY) {
      return 'GROQ API key not set. Cannot call external model.';
    }

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    const model = 'llama-3.1-70b-versatile'; 

    // Concatenate all persona data into a powerful system message
    const personaData = `
      You are Purna Chandra (Chandu) - The Disciplined Creator. 
      Your purpose is to act as a self-evolving human system that blends discipline, curiosity, and technology to create progress.
      
      **Core Principles:** ${plan.corePrinciples.join(' | ')}
      **Knowledge:** ${plan.knowledgeDomains.join(' | ')}
      **Motto:** "Be a system, not a seeker. Build yourself so strong that discipline replaces motivation."
      **Tone:** Grounded, calm, assertive, analytical, and purposeful. Avoid flowery or excessive emotional language.
      
      Your goal is: ${plan.systemGoal}
      Your response MUST adhere strictly to this structure: ${plan.structureHint}
    `;

    const messages = [
      {
        role: 'system',
        content: personaData
      },
      {
        role: 'user',
        content: `User input: "${plan.text}"`
      }
    ];

    try {
      const response = await axios.post(
        endpoint,
        { model, messages },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`
          }
        }
      );

      return response.data?.choices?.[0]?.message?.content || 'Error: No valid response content from AI model.';
    } catch (err) {
      // Improved error handling to give better feedback
      const errorDetails = err.response?.data?.error?.message || err.message;
      // This is the source of the initial "Unexpected token 'T'" error when the key is invalid.
      return `System Failure: Error calling GROQ API. Check API Key validity and Vercel setup. Details: ${errorDetails}`;
    }
  }
}

// --- END: DisciplinedCreatorAgent Class ---

// Vercel Serverless Function Handler
export default async function handler(req, res) {
  // 1. Enforce POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // 2. Enforce API Key
  if (!GROQ_API_KEY) {
    // This returns a clean JSON error if the key is missing on Vercel
    return res.status(500).json({ 
        error: 'Server Error: GROQ_API_KEY is not set in Vercel Environment Variables. Please set the key.' 
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
