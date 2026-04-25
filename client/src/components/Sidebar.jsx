import React, { useContext, useState } from 'react';
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
  PieChart,
  Globe,
  Sun,
  Moon,
  MessageSquare,
  Wallet,
  Library,
  Award,
  Calendar,
  Bell
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isDarkMode, setIsDarkMode] = useState(!document.body.classList.contains('light-mode'));
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

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
    { name: t('nav.reports'), icon: <PieChart size={20} />, path: '/reports', role: ['admin'] },
    { name: t('nav.attendance'), icon: <CalendarCheck size={20} />, path: '/attendance', role: ['admin', 'instructor'] },
    { name: t('nav.statement'), icon: <BookOpen size={20} />, path: `/statement/${user?.role}/${user?.id}`, role: ['instructor', 'student'] },
    { name: t('nav.profile'), icon: <UserCircle size={20} />, path: '/profile', role: ['admin', 'instructor', 'student'] },
    { name: t('nav.messages'), icon: <MessageSquare size={20} />, path: '/messages', role: ['admin', 'instructor', 'student'] },
    { name: t('nav.exams'), icon: <GraduationCap size={20} />, path: '/exams', role: ['admin', 'instructor', 'student'] },
    { name: t('nav.expenses'), icon: <Wallet size={20} />, path: '/expenses', role: ['admin'] },
    { name: t('nav.library'), icon: <Library size={20} />, path: '/library', role: ['admin', 'instructor', 'student'] },
    { name: t('nav.certificates'), icon: <Award size={20} />, path: '/certificates', role: ['admin', 'instructor', 'student'] },
    { name: t('nav.schedule'), icon: <Calendar size={20} />, path: '/schedule', role: ['admin', 'instructor', 'student'] },
  ];

  const filteredItems = menuItems.filter(item => item.role.includes(user?.role));

  return (
    <>
      <div className="sidebar" style={{ 
        width: '280px', 
        height: '100vh', 
        background: 'var(--bg-sidebar)',
        borderLeft: isRTL ? '1px solid var(--card-border)' : 'none',
        borderRight: isRTL ? 'none' : '1px solid var(--card-border)',
        display: 'flex', 
        flexDirection: 'column', 
        padding: '32px 20px',
        position: 'fixed',
        right: isRTL ? '0' : 'auto',
        left: isRTL ? 'auto' : '0',
        zIndex: 100
      }}>
        <div className="logo" style={{ marginBottom: '48px', padding: '0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ 
            background: 'linear-gradient(to right, var(--primary), var(--secondary))', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            fontSize: '1.8rem',
            fontWeight: '800'
          }}>
            {isRTL ? 'أكاديميتي' : 'Academiti'}
          </h2>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            style={{ 
              background: 'var(--glass)', 
              color: 'var(--primary)', 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid var(--card-border)',
              cursor: 'pointer'
            }}
          >
            <Bell size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
          <ul style={{ listStyle: 'none' }}>
            {filteredItems.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    background: isActive ? 'rgba(0, 245, 212, 0.05)' : 'transparent',
                    transition: 'var(--transition-smooth)',
                    fontWeight: isActive ? '700' : '500'
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-dim)' }}>{item.icon}</span>
                      <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="user-section" style={{ borderTop: '1px solid var(--card-border)', paddingTop: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '14px', 
            marginBottom: '24px',
            padding: '0 8px'
          }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: '700',
              color: '#050508'
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ fontSize: '0.95rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role || 'Role'}</p>
            </div>
          </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={toggleLanguage}
                style={{ 
                  flex: 1,
                  padding: '10px', 
                  borderRadius: '10px', 
                  background: 'var(--glass)', 
                  color: 'var(--text-main)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '10px',
                  border: '1px solid var(--card-border)',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <Globe size={16} />
                {isRTL ? 'EN' : 'AR'}
              </button>

              <button 
                onClick={toggleTheme}
                style={{ 
                  flex: 1,
                  padding: '10px', 
                  borderRadius: '10px', 
                  background: 'var(--glass)', 
                  color: 'var(--text-main)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '10px',
                  border: '1px solid var(--card-border)',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                {isDarkMode ? (isRTL ? 'نهاري' : 'Light') : (isRTL ? 'ليلي' : 'Dark')}
              </button>
            </div>

            <button 
              onClick={logout}
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '10px', 
                background: 'rgba(239, 68, 68, 0.05)', 
                color: 'var(--error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              fontSize: '0.9rem',
              marginTop: '12px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            {t('auth.logout')}
          </button>
        </div>
      </div>
      <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
};

export default Sidebar;
