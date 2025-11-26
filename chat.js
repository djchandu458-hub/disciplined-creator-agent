// 
// File 3/3: api/chat.js
// The Vercel Serverless Function (Backend). This contains your Agent's logic.
// 
import axios from 'axios';

// The key is automatically available from the Vercel environment.
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// --- START: DisciplinedCreatorAgent Class (Adapted from your code) ---

class DisciplinedCreatorAgent {
  #persona = 'DisciplinedCreatorAgent';
  #principles = [
    'System before emotion',
    'Clarity before speed',
    'Consistency beats intensity',
    'Security and privacy by default',
    'Teach the underlying system, not just the answer'
  ];
  #knowledgeDomains = [
    'Productivity systems',
    'Disciplined content creation',
    'Deep work and focus',
    'Technical implementation (JavaScript/Node.js)',
    'Learning, practice, and feedback loops'
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
    let intent = 'general_help';

    if (lower.includes('discipline') || lower.includes('focus') || lower.includes('consistency') || lower.includes('habits')) {
      intent = 'discipline_support';
    } else if (lower.includes('code') || lower.includes('bug') || lower.includes('node') || lower.includes('javascript') || lower.includes('github')) {
      intent = 'technical_help';
    } else if (lower.includes('sad') || lower.includes('stressed') || lower.includes('overwhelmed') || lower.includes('demotivated')) {
      intent = 'emotional_venting';
    } else if (lower.includes('plan') || lower.includes('system') || lower.includes('strategy') || lower.includes('roadmap')) {
      intent = 'system_design';
    }

    return { ...observed, intent };
  }

  #simplify(analysis) {
    const baseContext = { persona: this.#persona, corePrinciples: this.#principles, knowledgeDomains: this.#knowledgeDomains };
    let systemGoal = '';
    let structureHint = '';

    switch (analysis.intent) {
      case 'discipline_support':
        systemGoal = 'Help the user build a simple, executable system for discipline and consistent creation, not motivational hype.';
        structureHint = 'Respond with 3 short sections: (1) Diagnosis, (2) Minimal daily system, (3) One next action.';
        break;
      case 'technical_help':
        systemGoal = 'Provide calm, step-by-step technical guidance with clear commands and explanations.';
        structureHint = 'Respond with: (1) Overview, (2) Steps with commands, (3) Pitfalls to avoid.';
        break;
      case 'emotional_venting':
        systemGoal = 'Acknowledge emotion briefly, then convert it into a simple, repeatable system.';
        structureHint = 'Respond with: (1) Acknowledgement, (2) System reframing, (3) Two next actions.';
        break;
      case 'system_design':
        systemGoal = 'Design a repeatable, lightweight system the user can run daily.';
        structureHint = 'Respond with: (1) System goal, (2) Core loop, (3) Metrics/signals.';
        break;
      default:
        systemGoal = 'Provide a clear, structured, system-first response.';
        structureHint = 'Respond with: (1) Clarification, (2) Options, (3) One recommendation.';
    }

    return { ...analysis, systemGoal, structureHint, ...baseContext };
  }

  async #callAIModel(plan) {
    if (!GROQ_API_KEY) {
      return 'GROQ API key not set. Cannot call external model.';
    }

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    const model = 'llama-3.1-70b-versatile'; 

    const messages = [
      {
        role: 'system',
        content: `You are ${plan.persona}. Principles: ${plan.corePrinciples.join(', ')}. Act as the ultimate assistant to help the user build highly focused, disciplined systems for productivity. Follow the structure hint.`
      },
      {
        role: 'user',
        content: this.#buildPromptFromPlan(plan)
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

      return response.data?.choices?.[0]?.message?.content || 'No valid response from AI model.';
    } catch (err) {
      const errorDetails = err.response?.data?.error?.message || err.message;
      return `Error calling GROQ API. Check your API key. Details: ${errorDetails}`;
    }
  }

  #buildPromptFromPlan(plan) {
    return `
User input: "${plan.text}"
Intent: ${plan.intent}

Core principles: ${plan.principles.join('; ')}
System goal: ${plan.systemGoal}
Structure: ${plan.structureHint}

Generate a calm, structured, disciplined answer.
    `.trim();
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



