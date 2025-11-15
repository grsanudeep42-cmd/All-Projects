'use client';

import { useRouter } from 'expo-router'; // ADD THIS IMPORT
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // This path is correct
console.log("Rendering LoginScreen");
const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter(); // INITIALIZE ROUTER

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Make sure the handler fires! Add a log
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Login submit fired"); // <------ NEW DEBUG LOG!
    setIsLoading(true);
    setFeedback(null);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const apiUrl = 'http://127.0.0.1:8000/auth/login';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const data = await response.json();
      console.log("Login response user id:", data && data.user && data.user.id);
      login({ accessToken: data.access_token, userId: data.user && data.user.id });

      if (!response.ok) {
        const detail = data.detail;
        const message = Array.isArray(detail)
          ? detail.map((d: any) => `${d.loc[1]}: ${d.msg}`).join('\n')
          : (detail || 'Login failed');
        throw new Error(message);
      }

      setFeedback({ type: 'success', message: 'Login successful! Redirecting...' });

      setTimeout(() => {
        router.replace('/');
      }, 1200);

    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'An unknown error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 20, backgroundColor: '#f5f5f5' },
    form: { width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 600 },
    input: { border: '1px solid #ccc', marginBottom: 12, padding: '12px 15px', borderRadius: 5, fontSize: 16, width: '100%', boxSizing: 'border-box' as 'border-box' },
    button: { width: '100%', padding: '12px 15px', border: 'none', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
    feedbackBox: { padding: '12px', borderRadius: '5px', color: 'white', textAlign: 'center', fontSize: '14px', marginBottom: '15px' }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form} autoComplete="on">
        <h2 style={styles.title}>Login</h2>
        {feedback && (
          <div style={{
            ...styles.feedbackBox,
            backgroundColor: feedback.type === 'success' ? '#28a745' : '#dc3545'
          }}>
            {feedback.message}
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isLoading}
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={isLoading}
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          style={styles.button}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;
