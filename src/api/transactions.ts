const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('business_nexus_token');

export const getTransactions = async () => {
  const response = await fetch(`${API_URL}/transactions`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

export const deposit = async (amount: number, description: string) => {
  const response = await fetch(`${API_URL}/transactions/deposit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ amount, description })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

export const withdraw = async (amount: number, description: string) => {
  const response = await fetch(`${API_URL}/transactions/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ amount, description })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

export const transfer = async (amount: number, recipientId: string, description: string) => {
  const response = await fetch(`${API_URL}/transactions/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ amount, recipientId, description })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};