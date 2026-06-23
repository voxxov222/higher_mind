import { ActionFunction, json } from '@remix-run/node';
import { fetchWillowQuantumResponse } from '../services/gemini.server';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { question } = await request.json();

    const answer = await fetchWillowQuantumResponse(question);
    
    return json({ answer });
  } catch (error: any) {
    console.error('Error in Willow Quantum Collapse API:', error);
    return json({ error: error.message || 'Failed to collapse nodes' }, { status: 500 });
  }
};
