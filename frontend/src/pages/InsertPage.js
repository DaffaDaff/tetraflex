import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

function InsertPage() {
  const navigate = useNavigate();

  const [id, setId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  const handleInsert = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (result.success) {
        setMessage('Marker inserted successfully!');
        setId(''); // Clear input field
      } else {
        setMessage('Failed to insert marker.');
      }
    } catch (error) {
      console.error('Error inserting marker:', error);
      setMessage('Error inserting marker.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Insert a New Marker</h2>
      <form onSubmit={handleInsert}>
        <label>
          Enter ID:
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </label>
        <button type="submit">Insert Marker</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default InsertPage;
