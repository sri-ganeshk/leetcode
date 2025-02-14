// api/leetcode.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ message: 'Only POST requests are allowed' });
    }
  
    const { query, variables } = req.body;
    try {
      const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      });
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching data from LeetCode:', error);
      return res.status(500).json({ error: 'Error fetching data from LeetCode' });
    }
  }
  