import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', background: '#050508', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: 'var(--primary, #00f5d4)' }}>عذراً، حدث خطأ تقني</h2>
          <p style={{ color: 'var(--text-muted, #94a3b8)', marginBottom: '30px' }}>يرجى تصوير هذه الشاشة وإرسالها للمطور للمساعدة في حل المشكلة.</p>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            <code style={{ whiteSpace: 'pre-wrap', color: '#ef4444' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </code>
          </div>
          <button 
            onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
            }}
            style={{ 
              marginTop: '30px', 
              padding: '12px 24px', 
              background: '#00f5d4', 
              color: '#050508', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            تسجيل الخروج وإعادة المحاولة
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
