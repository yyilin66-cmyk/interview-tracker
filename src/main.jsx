import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import BookPage from './BookPage.jsx'
import LoginPage from './LoginPage.jsx'

function Root() {
  const path = window.location.pathname;

  // Public booking page: /book or /book/123
  if (path.startsWith('/book')) {
    return <BookPage />;
  }

  // Admin app with auth
  return <AuthApp />;
}

function AuthApp() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth-token');
    const savedUser = localStorage.getItem('auth-user');
    if (savedToken && savedUser) {
      // Verify token is still valid
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((r) => {
          if (r.ok) return r.json();
          throw new Error('Invalid token');
        })
        .then((d) => {
          setUser(d.user);
          setToken(savedToken);
        })
        .catch(() => {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-user');
        })
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  const handleLogin = (u, t) => {
    setUser(u);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    setUser(null);
    setToken(null);
  };

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0c1222' }}>
        <div style={{ width: 28, height: 28, border: '3px solid #1e293b', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <App user={user} token={token} onLogout={handleLogout} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
