import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, GraduationCap, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isHovered, setIsHovered] = useState(false);
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
    <div className="login-wrapper" style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      direction: 'rtl',
      position: 'relative',
      overflow: 'hidden',
      background: '#050508'
    }}>
      {/* Animated Background Orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>
      
      {/* Grid Pattern Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        opacity: 0.5,
        zIndex: 0
      }}></div>

      <div className="login-card-container animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '1000px',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        minHeight: '640px',
        borderRadius: '32px',
        background: 'rgba(10, 10, 15, 0.7)',
        backdropFilter: 'blur(30px)',
        border: '1px solid var(--card-border)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        zIndex: 1,
        margin: '20px'
      }}>
        
        {/* Left Side: Visual Branding */}
        <div style={{
          padding: '60px',
          background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          borderLeft: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="float-animation" style={{ 
              width: '80px', 
              height: '80px', 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
              boxShadow: '0 20px 40px rgba(0, 245, 212, 0.3)',
              transform: 'rotate(-5deg)'
            }}>
              <GraduationCap size={40} color="#050508" />
            </div>
            
            <h1 style={{ 
              fontSize: '4rem', 
              fontWeight: '900', 
              color: '#fff', 
              lineHeight: '1.1',
              marginBottom: '24px',
              letterSpacing: '-2px'
            }}>
              مستقبل <br/> 
              <span style={{ 
                background: 'linear-gradient(to left, var(--primary), var(--secondary))', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>التعليم الذكي</span>
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'rgba(255,255,255,0.6)', 
              lineHeight: '1.8',
              maxWidth: '400px',
              marginBottom: '48px'
            }}>
              المنصة المتكاملة لإدارة الأكاديميات بمواصفات عالمية وتجربة مستخدم لا مثيل لها.
            </p>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                <span style={{ color: '#fff', fontWeight: '600' }}>تقارير دقيقة</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--secondary)' }}></div>
                <span style={{ color: '#fff', fontWeight: '600' }}>متابعة فورية</span>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', opacity: 0.1 }}>
             <GraduationCap size={300} />
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>تسجيل الدخول</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.05rem' }}>مرحباً بك مجدداً في أكاديميتك</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.95rem', fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginRight: '6px' }}>البريد الإلكتروني</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', right: '20px', top: '18px', color: 'rgba(255,255,255,0.2)' }} />
                <input 
                  type="email" 
                  placeholder="name@academy.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ 
                    paddingRight: '56px', 
                    height: '60px', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginRight: '6px' }}>كلمة المرور</label>
                <a href="#" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none' }}>نسيت كلمة المرور؟</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', right: '20px', top: '18px', color: 'rgba(255,255,255,0.2)' }} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ 
                    paddingRight: '56px', 
                    height: '60px', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                  required 
                />
              </div>
            </div>

            <button 
              className="login-submit-btn" 
              type="submit"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{ 
                marginTop: '12px', 
                height: '64px', 
                fontSize: '1.2rem', 
                fontWeight: '800',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#050508',
                border: 'none',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: isHovered ? '0 20px 40px rgba(0, 245, 212, 0.3)' : '0 10px 20px rgba(0, 245, 212, 0.1)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
              }}
            >
              دخول للمنصة
              <ArrowRight size={22} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          z-index: 0;
          animation: floatOrb 20s infinite alternate ease-in-out;
        }
        .orb-1 { width: 40vw; height: 40vw; background: rgba(0, 245, 212, 0.15); top: -20%; left: -10%; }
        .orb-2 { width: 35vw; height: 35vw; background: rgba(99, 102, 241, 0.1); bottom: -10%; right: -5%; animation-delay: -5s; }
        .orb-3 { width: 30vw; height: 30vw; background: rgba(255, 0, 128, 0.05); top: 30%; right: 20%; animation-delay: -10s; }

        @keyframes floatOrb {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(100px, 50px) scale(1.1); }
        }

        .float-animation {
          animation: float 6s infinite ease-in-out;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-20px) rotate(0deg); }
        }

        @media (max-width: 850px) {
          .login-card-container {
            grid-template-columns: 1fr;
            max-width: 500px;
          }
          .login-card-container > div:first-child {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
