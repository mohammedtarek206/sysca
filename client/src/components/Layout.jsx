import React from 'react';
import Sidebar from './Sidebar';
import { useTranslation } from 'react-i18next';

const Layout = ({ children }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginRight: isRTL ? '280px' : '0',
        marginLeft: isRTL ? '0' : '280px', 
        padding: '60px 48px',
        minHeight: '100vh',
        width: 'calc(100% - 280px)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

