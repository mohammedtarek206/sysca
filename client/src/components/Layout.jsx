import React from 'react';
import Sidebar from './Sidebar';
import { useTranslation } from 'react-i18next';

const Layout = ({ children }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div style={{ display: 'flex', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginRight: isRTL ? '320px' : '0',
        marginLeft: isRTL ? '0' : '320px', 
        padding: '40px',
        minHeight: '100vh',
        width: 'calc(100% - 320px)'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
