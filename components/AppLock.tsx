'use client';

import { useState, useEffect } from 'react';
import { Lock, Database } from 'lucide-react';

export default function AppLock({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unlocked = sessionStorage.getItem('nxgraph_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_APP_PASSWORD || 'nxgraph';

    if (password === correctPassword) {
      sessionStorage.setItem('nxgraph_unlocked', 'true');
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (!mounted) {
    return null;
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000000',
      color: '#ededed',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.08,
        backgroundImage: 'radial-gradient(#a1a1aa 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '380px',
        padding: '40px 32px',
        borderRadius: '20px',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#0a0a0a',
        border: '1px solid #222222',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          <Lock size={22} style={{ color: '#818cf8' }} />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px',
        }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#ededed', letterSpacing: '-0.3px' }}>NxGraph</h1>
        </div>

        <p style={{ fontSize: '13px', color: '#71717a', margin: '0 0 32px 0', textAlign: 'center' }}>
          Enter password to access the editor
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Password"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                outline: 'none',
                fontSize: '14px',
                fontWeight: 400,
                fontFamily: 'inherit',
                background: '#111111',
                border: `1px solid ${error ? '#ef4444' : '#2a2a2a'}`,
                color: '#ededed',
                boxSizing: 'border-box' as const,
                transition: 'border-color 0.15s',
              }}
              autoFocus
            />
          </div>

          {error && (
            <p style={{
              fontSize: '12px',
              color: '#ef4444',
              margin: 0,
              textAlign: 'center',
            }}>
              Incorrect password. Try again.
            </p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '11px 16px',
              background: '#ededed',
              color: '#000000',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'all 0.15s',
              marginTop: '4px',
            }}
          >
            Unlock Editor
          </button>
        </form>
      </div>

      <p style={{
        position: 'absolute',
        bottom: '24px',
        fontSize: '11px',
        color: '#3f3f46',
        margin: 0,
        letterSpacing: '0.5px',
      }}>
        NxGraph — Database Diagram Tool
      </p>
    </div>
  );
}
