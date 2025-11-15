'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// Main component for the "Add Job" screen
const AddJobScreen: React.FC = () => {
  // State hooks for form inputs
  const { token, userId } = useAuth();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [clientId, setClientId] = useState<string>(''); // Kept for your structure, but userId is recommended

  // State hooks for handling feedback and loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Handler for form submission
  const handleAddJob = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevents default form submission behavior
    setIsLoading(true);
    setFeedback(null);

    try {
      // Use token from auth context!
      console.log('Loaded token:', token);

      if (!token) {
        throw new Error('Authentication Error: You must be logged in to post a job.');
      }

      // Input validation
      if (!title || !description || !budget || !deadline || !(clientId || userId)) {
        throw new Error('Validation Error: Please fill out all fields.');
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
        throw new Error('Invalid Date: Please use the format YYYY-MM-DD for the deadline.');
      }

      const deadlineIso = new Date(deadline).toISOString();
      const apiUrl = 'http://127.0.0.1:8000/jobs';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          client_id: clientId ? Number(clientId) : userId,
          status: 'open',
          budget: Number(budget),
          deadline: deadlineIso,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Job creation failed. Please try again.');
      }

      setFeedback({ type: 'success', message: 'Job created successfully!' });

      // Clear the form on success
      setTitle('');
      setDescription('');
      setBudget('');
      setDeadline('');
      setClientId('');
    } catch (err) {
      const error = err as Error;
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleAddJob} style={styles.form}>
        <h2 style={styles.heading}>Post a New Job</h2>
        {/* Dynamic feedback message area */}
        {feedback && (
          <div style={{ ...styles.feedbackBox, backgroundColor: feedback.type === 'success' ? '#28a745' : '#dc3545' }}>
            {feedback.message}
          </div>
        )}
        <input
          placeholder="Job Title"
          style={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
        <textarea
          placeholder="Full Job Description"
          style={{ ...styles.input, height: '100px', paddingTop: '15px' }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
        <input
          placeholder="Budget ($)"
          style={styles.input}
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          type="number"
          disabled={isLoading}
        />
        <input
          placeholder="Deadline (YYYY-MM-DD)"
          style={styles.input}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          disabled={isLoading}
        />
        <input
          placeholder="Your Client ID"
          style={styles.input}
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          type="number"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#121212',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: '10px',
  },
  input: {
    height: '50px',
    border: '1px solid #444',
    padding: '0 15px',
    borderRadius: '8px',
    color: '#FFFFFF',
    backgroundColor: '#1E1E1E',
    fontSize: '16px',
    boxSizing: 'border-box',
    width: '100%',
  },
  button: {
    height: '50px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  feedbackBox: {
    padding: '12px',
    borderRadius: '8px',
    color: 'white',
    textAlign: 'center',
    fontSize: '16px',
  },
};

export default AddJobScreen;
