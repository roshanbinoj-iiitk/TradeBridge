import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      data = { detail: 'Invalid backend response' };
    }
    // If backend returns error, forward the detail
    if (!response.ok) {
      return res.status(response.status).json({ detail: data.detail || data.message || 'Registration failed.' });
    }
    return res.status(200).json(data);
  } catch (error) {
  return res.status(500).json({ detail: String(error) || 'Internal server error' });
  }
}
