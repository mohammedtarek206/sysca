import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Courses from './pages/Courses';
import Payments from './pages/Payments';
import Attendance from './pages/Attendance';
import Profile from './pages/Profile';
import Halls from './pages/Halls';
import Reports from './pages/Reports';
import Statement from './pages/Statement';
import Messages from './pages/Messages';
import Exams from './pages/Exams';
import Expenses from './pages/Expenses';
import Library from './pages/Library';
import Certificates from './pages/Certificates';
import Schedule from './pages/Schedule';

// Placeholder Pages for future implementation
const Placeholder = ({ name }) => (
  <div className="animate-fade-in">
    <h1>{name}</h1>
    <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>جاري العمل على هذه الصفحة...</p>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="primary-btn" style={{ borderRadius: '50%', width: '60px', height: '60px' }}>...</div>
    </div>
  );
  
  if (!user || !user.role) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute roles={['admin', 'instructor', 'student']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/students" element={<ProtectedRoute roles={['admin']}><Students /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute roles={['admin']}><Teachers /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute roles={['admin', 'instructor']}><Courses /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute roles={['admin', 'student']}><Payments /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute roles={['admin', 'instructor']}><Attendance /></ProtectedRoute>} />
          <Route path="/halls" element={<ProtectedRoute roles={['admin']}><Halls /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />
          <Route path="/statement/:type/:id" element={<ProtectedRoute roles={['admin', 'instructor', 'student']}><Statement /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute roles={['admin', 'instructor', 'student']}><Profile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute roles={['admin', 'instructor', 'student']}><Messages /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute roles={['admin', 'instructor', 'student']}><Exams /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute roles={['admin']}><Expenses /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute roles={['admin', 'instructor', 'student']}><Library /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute roles={['admin', 'instructor', 'student']}><Certificates /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute roles={['admin', 'instructor', 'student']}><Schedule /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
