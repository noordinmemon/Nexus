const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('business_nexus_token');

// Get all users by role
export const getUsersByRole = async (role: 'investor' | 'entrepreneur') => {
  const response = await fetch(`${API_URL}/users?role=${role}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

// Get single user by ID
export const getUserById = async (id: string) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};