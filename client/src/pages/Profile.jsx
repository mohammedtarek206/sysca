import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { User, Mail, Phone, Shield, Calendar, Save, Key, UserCircle } from 'lucide-react';
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
      const res = await api.get('/api/users/profile');
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

      const res = await api.put(`/api/users/${profile._id}`, updateData);
      setProfile(res.data);
      setMessage({ type: 'success', text: 'تم تحديث البيانات بنجاح' });
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'حدث خطأ أثناء التحديث' });
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>جاري التحميل...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>الملف الشخصي</h1>
        <p style={{ color: 'var(--text-muted)' }}>إدارة بياناتك الشخصية وإعدادات الحساب</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
        {/* Profile Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              background: 'var(--primary)', 
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
            }}>
              {profile?.name?.charAt(0)}
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{profile?.name}</h2>
            <div style={{ 
              display: 'inline-block', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '0.8rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-muted)',
              marginBottom: '20px'
            }}>
              {profile?.role === 'student' ? 'طالب' : profile?.role === 'instructor' ? 'مدرس' : 'مدير'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <Mail size={16} color="var(--primary)" />
                <span style={{ color: 'var(--text-muted)' }}>{profile?.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <Phone size={16} color="var(--primary)" />
                <span style={{ color: 'var(--text-muted)' }}>{profile?.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <Calendar size={16} color="var(--primary)" />
                <span style={{ color: 'var(--text-muted)' }}>انضم في: {new Date(profile?.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--primary)" /> الصلاحيات
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              لديك صلاحيات {profile?.role === 'admin' ? 'الوصول الكامل للنظام وإدارة المستخدمين والماليات.' : 
               profile?.role === 'instructor' ? 'إدارة الكورسات الخاصة بك وتسجيل حضور الطلاب.' : 
               'الوصول للمحتوى التعليمي ومتابعة حضورك ومدفوعاتك.'}
            </p>
          </div>
        </div>

        {/* Edit Form Content */}
        <div className="glass-card" style={{ padding: '40px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '30px' }}>تحديث البيانات</h3>
          
          {message.text && (
            <div style={{ 
              padding: '12px 20px', 
              borderRadius: '10px', 
              marginBottom: '25px',
              fontSize: '0.9rem',
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              color: message.type === 'success' ? '#10b981' : '#f43f5e',
              border: `1px solid ${message.type === 'success' ? '#10b98133' : '#f43f5e33'}`
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>الاسم بالكامل</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', right: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{ width: '100%', paddingRight: '45px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>رقم الهاتف</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', right: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  style={{ width: '100%', paddingRight: '45px' }}
                />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '10px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>كلمة المرور الجديدة (اتركها فارغة للتخطي)</label>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', right: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="********"
                  style={{ width: '100%', paddingRight: '45px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>تأكيد كلمة المرور</label>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', right: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="********"
                  style={{ width: '100%', paddingRight: '45px' }}
                />
              </div>
            </div>

            <button type="submit" className="primary-btn" style={{ height: '52px', marginTop: '10px' }}>
              <Save size={20} />
              حفظ التغييرات
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
