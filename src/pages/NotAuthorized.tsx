import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export default function NotAuthorized() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    }}>
      <ShieldOff size={64} style={{ color: 'var(--accent-danger)', marginBottom: 20 }} />
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>403 — Not Authorized</h2>
      <p style={{ color: 'var(--text-tertiary)', marginBottom: 24 }}>
        You don't have permission to access this page.
      </p>
      <Link to="/dashboard" style={{
        padding: '10px 24px', borderRadius: 10,
        background: 'var(--accent-primary)', color: '#fff',
        fontWeight: 600, fontSize: 14,
      }}>← Back to Dashboard</Link>
    </div>
  );
}
