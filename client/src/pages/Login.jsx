import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      alert('خطأ في تسجيل الدخول: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      direction: 'rtl'
    }}>
      <div className="glass-card animate-fade-in" style={{ padding: '40px', width: '90%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
           <h1 style={{ marginBottom: '10px', fontSize: '2.2rem', background: 'linear-gradient(to left, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>أكاديميتي</h1>
           <p style={{ color: 'var(--text-muted)' }}>نظام إدارة الأكاديمية الاحترافي</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', right: '16px', top: '16px', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              placeholder="البريد الإلكتروني" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', paddingRight: '45px', height: '52px' }}
              required 
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', right: '16px', top: '16px', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              placeholder="كلمة المرور" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', paddingRight: '45px', height: '52px' }}
              required 
            />
          </div>
          <button className="primary-btn" type="submit" style={{ marginTop: '10px', height: '52px', fontSize: '1.1rem' }}>
            <LogIn size={20} />
            دخول للنظام
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
