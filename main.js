// main.js
// Simple example of how to use DisciplinedCreatorAgent with ESM.

import { DisciplinedCreatorAgent } from './DisciplinedCreatorAgent.js';

async function main() {
  const agent = new DisciplinedCreatorAgent();

  agent.printGreeting();

  const userInput = 'Help me stay consistent with coding and content creation without burning out.';
  const response = await agent.processInteraction(userInput);

  console.log(`
=== Agent Output ===
`);
  console.log(response);
}

main().catch((err) => {
  console.error('Fatal error in main():', err);
});
