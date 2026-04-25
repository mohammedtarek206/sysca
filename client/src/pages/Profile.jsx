import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { User, Mail, Phone, Shield, Calendar, Save, Key, UserCircle, BadgeCheck, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user: authUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data);
      setFormData({
        name: res.data.name,
        phone: res.data.phone,
        password: '',
        confirmPassword: ''
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return setMessage({ type: 'error', text: 'كلمات المرور غير متطابقة' });
    }

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone
      };
      if (formData.password) updateData.password = formData.password;

      const res = await api.put(`/users/${profile._id}`, updateData);
      setProfile(res.data);
      setMessage({ type: 'success', text: 'تم تحديث البيانات بنجاح' });
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'حدث خطأ أثناء التحديث' });
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-dim)' }}>جاري التحميل...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '12px' }}>الملف الشخصي</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>إدارة بياناتك الشخصية وإعدادات الحساب</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ 
              position: 'absolute', 
              top: '-20px', 
              right: '-20px', 
              width: '120px', 
              height: '120px', 
              background: 'var(--primary-glow)', 
              borderRadius: '50%', 
              filter: 'blur(40px)', 
              opacity: '0.3' 
            }}></div>
            
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '32px', 
              background: 'var(--primary-glow)', 
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              fontWeight: '900',
              color: 'var(--primary)',
              border: '2px solid var(--primary-dark)',
              textShadow: '0 0 20px rgba(0, 245, 212, 0.5)'
            }}>
              {profile?.name?.charAt(0)}
            </div>
            
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>{profile?.name}</h2>
            
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px', 
              borderRadius: '12px', 
              fontSize: '0.9rem',
              fontWeight: '700',
              background: 'rgba(0, 245, 212, 0.1)',
              color: 'var(--primary)',
              marginBottom: '32px',
              border: '1px solid rgba(0, 245, 212, 0.2)'
            }}>
              <BadgeCheck size={16} />
              {profile?.role === 'student' ? 'طالب' : profile?.role === 'instructor' ? 'مدرس' : 'مدير'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'right', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={20} color="var(--primary)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>البريد الإلكتروني</span>
                  <span style={{ color: 'white', fontWeight: '600' }}>{profile?.email}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={20} color="var(--primary)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>رقم الهاتف</span>
                  <span style={{ color: 'white', fontWeight: '600' }}>{profile?.phone}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={20} color="var(--primary)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>تاريخ الانضمام</span>
                  <span style={{ color: 'white', fontWeight: '600' }}>{new Date(profile?.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={24} color="var(--primary)" /> الصلاحيات والوصول
            </h3>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
              لديك صلاحيات {profile?.role === 'admin' ? 'الوصول الكامل للنظام وإدارة المستخدمين والماليات.' : 
               profile?.role === 'instructor' ? 'إدارة الكورسات الخاصة بك وتسجيل حضور الطلاب.' : 
               'الوصول للمحتوى التعليمي ومتابعة حضورك ومدفوعاتك.'}
            </p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '48px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '32px' }}>تحديث بيانات الحساب</h3>
          
          {message.text && (
            <div style={{ 
              padding: '16px 24px', 
              borderRadius: '16px', 
              marginBottom: '32px',
              fontSize: '1rem',
              fontWeight: '600',
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
              border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}22`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {message.type === 'success' ? <BadgeCheck size={20} /> : <Shield size={20} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>الاسم بالكامل</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{ width: '100%', paddingRight: '48px', height: '56px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>رقم الهاتف</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  style={{ width: '100%', paddingRight: '48px', height: '56px' }}
                />
              </div>
            </div>

            <div style={{ margin: '16px 0', height: '1px', background: 'linear-gradient(90deg, transparent, var(--card-border), transparent)' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>كلمة المرور الجديدة <span style={{ fontWeight: '400', fontSize: '0.8rem', color: 'var(--text-dim)' }}>(اتركها فارغة للتخطي)</span></label>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="********"
                  style={{ width: '100%', paddingRight: '48px', height: '56px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>تأكيد كلمة المرور</label>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                  type="password" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="********"
                  style={{ width: '100%', paddingRight: '48px', height: '56px' }}
                />
              </div>
            </div>

            <button type="submit" className="primary-btn" style={{ height: '60px', marginTop: '16px', fontSize: '1.1rem' }}>
              <Save size={22} />
              حفظ التغييرات
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;


