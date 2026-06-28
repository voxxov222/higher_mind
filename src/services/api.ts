export const api = {
  fetchCosmicPulse: async () => {
    const response = await fetch('/api/cosmic-pulse');
    return response.json();
  },
};
