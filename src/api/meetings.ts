const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('business_nexus_token');

// Get my meetings
export const getMyMeetings = async () => {
  const response = await fetch(`${API_URL}/meetings`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

// Schedule a meeting
export const scheduleMeeting = async (meetingData: {
  title: string;
  scheduledWith: string;
  date: string;
  time: string;
  duration: number;
  message: string;
}) => {
  const response = await fetch(`${API_URL}/meetings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(meetingData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

// Accept meeting
export const acceptMeeting = async (meetingId: string) => {
  const response = await fetch(`${API_URL}/meetings/${meetingId}/accept`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

// Reject meeting
export const rejectMeeting = async (meetingId: string) => {
  const response = await fetch(`${API_URL}/meetings/${meetingId}/reject`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

// Cancel meeting
export const cancelMeeting = async (meetingId: string) => {
  const response = await fetch(`${API_URL}/meetings/${meetingId}/cancel`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};