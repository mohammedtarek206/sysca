import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  CalendarCheck, 
  LogOut,
  UserCircle,
  Home,
  BarChart3
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const toggleLanguage = () => {
    i18n.changeLanguage(isRTL ? 'en' : 'ar');
  };

  const menuItems = [
    { name: t('nav.dashboard'), icon: <LayoutDashboard size={20} />, path: '/', role: ['admin', 'instructor', 'student'] },
    { name: t('nav.students'), icon: <Users size={20} />, path: '/students', role: ['admin'] },
    { name: t('nav.teachers'), icon: <GraduationCap size={20} />, path: '/teachers', role: ['admin'] },
    { name: t('nav.courses'), icon: <BookOpen size={20} />, path: '/courses', role: ['admin', 'instructor'] },
    { name: t('nav.halls'), icon: <Home size={20} />, path: '/halls', role: ['admin'] },
    { name: t('nav.payments'), icon: <CreditCard size={20} />, path: '/payments', role: ['admin', 'student'] },
    { name: t('nav.reports'), icon: <BarChart3 size={20} />, path: '/reports', role: ['admin'] },
    { name: t('nav.attendance'), icon: <CalendarCheck size={20} />, path: '/attendance', role: ['admin', 'instructor'] },
    { name: t('nav.statement'), icon: <BookOpen size={20} />, path: `/statement/${user?.role}/${user?.id}`, role: ['instructor', 'student'] },
    { name: t('nav.profile'), icon: <UserCircle size={20} />, path: '/profile', role: ['admin', 'instructor', 'student'] },
  ];

  const filteredItems = menuItems.filter(item => item.role.includes(user?.role));

  return (
    <div className="sidebar glass-card" style={{ 
      width: '280px', 
      height: '95vh', 
      margin: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '24px',
      position: 'fixed',
      right: isRTL ? '0' : 'auto',
      left: isRTL ? 'auto' : '0'
    }}>
      <div className="logo" style={{ marginBottom: '40px', padding: '0 12px' }}>
        <h2 style={{ background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.8rem' }}>
          {isRTL ? 'أكاديميتي' : 'Academiti'}
        </h2>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none' }}>
          {filteredItems.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '8px' }}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  transition: 'all 0.3s'
                })}
              >
                {item.icon}
                <span style={{ fontWeight: '500' }}>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="user-section" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {user?.name?.charAt(0)}
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.name}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.role}</p>
          </div>
        </div>

        <button 
          onClick={toggleLanguage}
          style={{ 
            width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px'
          }}
        >
          {isRTL ? 'English 🌐' : 'عربي 🌐'}
        </button>

        <button 
          onClick={logout}
          style={{ 
            width: '100%', 
            padding: '12px', 
            borderRadius: '12px', 
            background: 'rgba(244, 63, 94, 0.1)', 
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <LogOut size={18} />
          {t('auth.logout')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
