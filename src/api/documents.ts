const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('business_nexus_token');

// Upload document
export const uploadDocument = async (file: File, name: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name);

  const response = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

// Get my documents
export const getMyDocuments = async () => {
  const response = await fetch(`${API_URL}/documents`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

// Delete document
export const deleteDocument = async (id: string) => {
  const response = await fetch(`${API_URL}/documents/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};