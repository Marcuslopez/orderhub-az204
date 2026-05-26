import { useState } from 'react';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@orderhub.com');
  const [password, setPassword] = useState('Admin123*');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch {
      setError('Credenciales inválidas');
    }
  }

  return (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#111827',
      color: '#f9fafb',
      fontFamily: 'Arial',
    }}
  >
    <div
      style={{
        width: '350px',
        padding: '2rem',
        backgroundColor: '#1f2937',
        borderRadius: '12px',
        border: '1px solid #374151',
        boxShadow: '0 0 20px rgba(0,0,0,0.4)',
      }}
    >
      <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        OrderHub
      </h1>

      <h2
        style={{
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: '#d1d5db',
        }}
      >
        Iniciar sesión
      </h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.7rem',
              borderRadius: '6px',
              border: '1px solid #374151',
              backgroundColor: '#111827',
              color: '#f9fafb',
            }}
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.7rem',
              borderRadius: '6px',
              border: '1px solid #374151',
              backgroundColor: '#111827',
              color: '#f9fafb',
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            marginTop: '1.5rem',
            padding: '0.8rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Entrar
        </button>
      </form>

      {error && (
        <p
          style={{
            marginTop: '1rem',
            color: '#f87171',
            textAlign: 'center',
          }}
        >
          {error}
        </p>
      )}
    </div>
  </div>
);
}