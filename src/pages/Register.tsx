import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, LayoutDashboard } from 'lucide-react';

export default function Register() {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRtl = i18n.language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.[0]?.description || t('common.error'));
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: isRtl ? '16px 48px 16px 16px' : '16px 16px 16px 48px',
    borderRadius: 16,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    fontSize: 15,
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(8px)',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#05061f',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif",
    }}>
      {/* Dynamic Animated Background Components */}
      <div className="mesh-gradient" />
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      <div style={{
        width: '100%',
        maxWidth: 450,
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: 32,
        padding: '60px 48px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.6)',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Decorative Light Leak */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(28, 191, 255, 0.5), transparent)',
          zIndex: 2,
        }} />

        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div className="logo-glow-container">
            <div className="logo-icon">
              <LayoutDashboard size={32} />
            </div>
          </div>
          <h1 className="title-gradient">
            {t('auth.register')}
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            fontSize: 16, 
            lineHeight: 1.6,
            marginTop: 12
          }}>
            {t('app.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {error && (
            <div className="error-container">
              <div className="error-dot" /> {error}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <User 
              size={20} 
              style={{ 
                position: 'absolute', 
                [isRtl ? 'right' : 'left']: 18, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.4)',
                pointerEvents: 'none'
              }} 
            />
            <input 
              type="text" 
              placeholder={t('auth.fullName')} 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)} 
              required 
              style={inputStyle} 
              className="premium-input"
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Mail 
              size={20} 
              style={{ 
                position: 'absolute', 
                [isRtl ? 'right' : 'left']: 18, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.4)',
                pointerEvents: 'none'
              }} 
            />
            <input 
              type="email" 
              placeholder={t('auth.email')} 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={inputStyle} 
              className="premium-input"
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock 
              size={20} 
              style={{ 
                position: 'absolute', 
                [isRtl ? 'right' : 'left']: 18, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.4)',
                pointerEvents: 'none'
              }} 
            />
            <input 
              type={showPass ? 'text' : 'password'} 
              placeholder={t('auth.password')}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={inputStyle} 
              className="premium-input"
            />
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)} 
              style={{
                position: 'absolute', 
                [isRtl ? 'left' : 'right']: 16, 
                top: '50%', 
                transform: 'translateY(-50%)',
                background: 'none', 
                border: 'none',
                cursor: 'pointer', 
                color: 'rgba(255, 255, 255, 0.4)',
                display: 'flex',
                padding: 4,
                transition: 'color 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="premium-button"
          >
            {loading ? t('common.loading') : t('auth.register')}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: 40, 
          fontSize: 15, 
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          {t('auth.hasAccount')}{' '}
          <Link to="/login" style={{ 
            color: '#1cbfff', 
            fontWeight: 700,
            textDecoration: 'none',
            marginLeft: 6,
            transition: 'all 0.2s ease',
          }}
          className="link-hover"
          >
            {t('auth.login')}
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes drift {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .mesh-gradient {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: 
            radial-gradient(circle at 0% 0%, rgba(28, 191, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(28, 191, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
          z-index: 1;
        }

        .bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 2;
          opacity: 0.4;
          animation: drift 20s infinite linear;
        }

        .blob-1 {
          width: 500px; height: 500px;
          background: rgba(28, 191, 255, 0.2);
          top: -100px; left: -100px;
        }

        .blob-2 {
          width: 400px; height: 400px;
          background: rgba(99, 102, 241, 0.2);
          bottom: -50px; right: -50px;
          animation-duration: 25s;
          animation-direction: reverse;
        }

        .blob-3 {
          width: 300px; height: 300px;
          background: rgba(255, 255, 255, 0.05);
          top: 40%; left: 60%;
        }

        .logo-glow-container {
          position: relative;
          width: 72px; height: 72px;
          margin: 0 auto 24px;
        }

        .logo-glow-container::after {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 100%; height: 100%;
          background: #1cbfff;
          filter: blur(30px);
          opacity: 0.3;
          z-index: 1;
        }

        .logo-icon {
          position: relative;
          z-index: 2;
          width: 72px; height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, #1cbfff 0%, #6366f1 100%);
          display: flex; alignItems: center; justifyContent: center;
          color: #fff;
          box-shadow: 0 12px 24px -6px rgba(28, 191, 255, 0.5);
        }

        .title-gradient {
          font-size: 32px;
          font-weight: 900;
          background: linear-gradient(to bottom, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.03em;
          margin-bottom: 4px;
        }

        .premium-input:focus {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(28, 191, 255, 0.5) !important;
          box-shadow: 0 0 0 4px rgba(28, 191, 255, 0.1);
          outline: none;
        }

        .premium-button {
          width: 100%; 
          padding: 18px; 
          border-radius: 18px; 
          border: none;
          background: linear-gradient(135deg, #1cbfff 0%, #6366f1 100%); 
          color: #fff;
          fontSize: 16px; 
          fontWeight: 800; 
          cursor: pointer; 
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          margin-top: 12px;
          box-shadow: 0 15px 30px -10px rgba(28, 191, 255, 0.4);
          position: relative;
          overflow: hidden;
        }

        .premium-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px -12px rgba(28, 191, 255, 0.6);
          filter: brightness(1.1);
        }

        .premium-button:active {
          transform: translateY(1px);
        }

        .error-container {
          padding: 14px 18px;
          borderRadius: 14px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          fontSize: 14px;
          fontWeight: 500;
          display: flex;
          alignItems: center;
          gap: 12px;
          backdropFilter: blur(4px);
        }

        .error-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 10px #ef4444;
        }

        .link-hover:hover {
          color: #fff !important;
          text-shadow: 0 0 15px rgba(28, 191, 255, 0.8);
        }
      `}</style>
    </div>
  );
}
