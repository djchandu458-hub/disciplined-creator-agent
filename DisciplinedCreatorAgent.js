// DisciplinedCreatorAgent.js
// ES Module, secure, agentic, production-style design.

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: 'env' }); // For tablets using "env" instead of ".env"

export class DisciplinedCreatorAgent {
  #persona;
  #principles;
  #knowledgeDomains;
  #modelApiKey;

  constructor() {
    // Use GROQ API key from environment
    this.#modelApiKey = process.env.GROQ_API_KEY || null;

    if (!this.#modelApiKey) {
      console.warn(
        '[DisciplinedCreatorAgent] Warning: GROQ_API_KEY is not set. API calls will be skipped.'
      );
    }

    this.#persona = 'DisciplinedCreatorAgent';
    this.#principles = [
      'System before emotion',
      'Clarity before speed',
      'Consistency beats intensity',
      'Security and privacy by default',
      'Teach the underlying system, not just the answer'
    ];

    this.#knowledgeDomains = [
      'Productivity systems',
      'Disciplined content creation',
      'Deep work and focus',
      'Technical implementation (JavaScript/Node.js)',
      'Learning, practice, and feedback loops'
    ];
  }

  printGreeting() {
    console.log(
      'System Initialized. Objective: To achieve progress through clarity, consistency, and a system-first mindset.'
    );
    console.log(
      `Active Persona: ${this.#persona}. Core principles loaded: ${this.#principles.length}.`
    );
  }

  async processInteraction(userInput) {
    const observed = this.#observe(userInput);
    const analysis = this.#analyze(observed);
    const plan = this.#simplify(analysis);
    const rawResponse = await this.#callAIModel(plan);
    const finalResponse = this.#teachAndImprove(rawResponse, plan);
    return finalResponse;
  }

  #observe(input) {
    const text = (input || '').toString().trim();
    return {
      raw: input,
      text,
      length: text.length,
      timestamp: new Date().toISOString()
    };
  }

  #analyze(observed) {
    const lower = observed.text.toLowerCase();
    let intent = 'general_help';

    if (
      lower.includes('discipline') ||
      lower.includes('focus') ||
      lower.includes('consistency') ||
      lower.includes('habits')
    ) {
      intent = 'discipline_support';
    } else if (
      lower.includes('code') ||
      lower.includes('bug') ||
      lower.includes('node') ||
      lower.includes('javascript') ||
      lower.includes('repo') ||
      lower.includes('github')
    ) {
      intent = 'technical_help';
    } else if (
      lower.includes('sad') ||
      lower.includes('stressed') ||
      lower.includes('overwhelmed') ||
      lower.includes('demotivated')
    ) {
      intent = 'emotional_venting';
    } else if (
      lower.includes('plan') ||
      lower.includes('system') ||
      lower.includes('strategy') ||
      lower.includes('roadmap')
    ) {
      intent = 'system_design';
    }

    return { ...observed, intent };
  }

  #simplify(analysis) {
    const baseContext = {
      persona: this.#persona,
      corePrinciples: this.#principles,
      knowledgeDomains: this.#knowledgeDomains
    };

    let systemGoal = '';
    let structureHint = '';

    switch (analysis.intent) {
      case 'discipline_support':
        systemGoal =
          'Help the user build a simple, executable system for discipline and consistent creation, not motivational hype.';
        structureHint =
          'Respond with 3 short sections: (1) Diagnosis, (2) Minimal daily system, (3) One next action.';
        break;

      case 'technical_help':
        systemGoal =
          'Provide calm, step-by-step technical guidance with clear commands and explanations.';
        structureHint =
          'Respond with: (1) Overview, (2) Steps with commands, (3) Pitfalls to avoid.';
        break;

      case 'emotional_venting':
        systemGoal =
          'Acknowledge emotion briefly, then convert it into a simple, repeatable system.';
        structureHint =
          'Respond with: (1) Acknowledgement, (2) System reframing, (3) Two next actions.';
        break;

      case 'system_design':
        systemGoal =
          'Design a repeatable, lightweight system the user can run daily.';
        structureHint =
          'Respond with: (1) System goal, (2) Core loop, (3) Metrics/signals.';
        break;

      default:
        systemGoal =
          'Provide a clear, structured, system-first response.';
        structureHint =
          'Respond with: (1) Clarification, (2) Options, (3) One recommendation.';
    }

    return {
      ...analysis,
      systemGoal,
      structureHint,
      ...baseContext
    };
  }

  async #callAIModel(plan) {
    if (!this.#modelApiKey) {
      return 'GROQ API key not set. Cannot call external model.';
    }

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    const model = 'llama-3.3-70b-versatile';

    const messages = [
      {
        role: 'system',
        content: `You are ${plan.persona}. Principles: ${plan.corePrinciples.join(', ')}.`
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
            Authorization: `Bearer ${this.#modelApiKey}`
          }
        }
      );

      return response.data?.choices?.[0]?.message?.content || 'No valid response.';
    } catch (err) {
  return `Error calling GROQ API: ${err.message}
${err.response?.data ? JSON.stringify(err.response.data) : ''}`;
    }
  }

  #buildPromptFromPlan(plan) {
    return `
User input: "${plan.text}"
Time: ${plan.timestamp}
Intent: ${plan.intent}

Core principles: ${plan.corePrinciples.join('; ')}
Knowledge domains: ${plan.knowledgeDomains.join('; ')}

System goal: ${plan.systemGoal}
Structure: ${plan.structureHint}

Generate a calm, structured, disciplined answer.
    `.trim();
  }

  #teachAndImprove(rawResponse, plan) {
    const header = `DisciplinedCreatorAgent Response\n`;
    const divider = `----------------------------------------\n`;

    const meta = [
      `Persona: ${this.#persona}`,
      `Intent: ${plan.intent}`,
      `Principles active: ${this.#principles.length}`,
      `System-first mode: ON`
    ].join(' | ');

    const teachingNote = `
Teaching Note:
- The response is driven by intent ("${plan.intent}") and system goal.
- Focus on repeatable processes, not motivation.
`.trim();

    return [
      header,
      divider,
      meta,
      divider,
      rawResponse.trim(),
      divider,
      teachingNote
    ].join('\n');
  }
}



