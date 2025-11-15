import { createContext, useContext, useEffect, useState } from 'react';

// Create the context
const AuthContext = createContext();

// ---- Place isTokenExpired here so it is in scope for useEffect ----
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

// Create the Provider component. It will wrap your entire app.
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  try {
    const storedToken = localStorage.getItem('accessToken');
    const storedUserId = localStorage.getItem('userId');
    console.log("Token in storage:", storedToken);
    console.log("Token expired?", storedToken && isTokenExpired(storedToken));
    if (
      storedToken &&
      storedUserId &&
      !isNaN(Number(storedUserId)) &&
      !isTokenExpired(storedToken)
    ) {
      setToken(storedToken);
      setUserId(Number(storedUserId));
    } else {
      setToken(null);
      setUserId(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
    }
  } catch(_e) {
    setToken(null);
    setUserId(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
  } finally {
    setIsLoading(false);
  }
}, []);


  const login = ({ accessToken, userId }) => {
    if (typeof userId !== "undefined") {
      setToken(accessToken);
      setUserId(Number(userId));
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userId', String(userId));
      console.log("Set userId to:", userId);
    } else {
      setToken(null);
      setUserId(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      console.log('Login failed – userId undefined');
    }
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
  };

  const value = { token, userId, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
