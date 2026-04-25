import React, { useState, useEffect } from 'react';
import api from '../api';
import { TrendingUp, TrendingDown, DollarSign, Users, Award, PieChart, ArrowRight, BarChart3, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Reports = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await api.get('/reports/profit');
      setReport(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-dim)' }}>{t('reports.loading')}...</div>;
  if (!report) return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-dim)' }}>{t('reports.error')}</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '12px' }}>{t('reports.title')}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t('reports.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '48px' }}>
        {/* Total Income Card */}
        <div className="glass-card" style={{ padding: '32px', borderBottom: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>
              <TrendingUp size={28} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '20px' }}>الإيرادات</span>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginBottom: '8px', fontWeight: '600' }}>{t('reports.totalIncome')}</p>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900' }}>{report.totalIncome} <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-dim)' }}>{t('common.currency')}</span></h2>
        </div>

        {/* Expenses Card */}
        <div className="glass-card" style={{ padding: '32px', borderBottom: '4px solid var(--error)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>
              <TrendingDown size={28} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 12px', borderRadius: '20px' }}>المصروفات</span>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginBottom: '8px', fontWeight: '600' }}>{t('reports.totalExpenses')}</p>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900' }}>{report.totalSalaries + report.totalCommissions + report.totalAcademyExpenses} <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-dim)' }}>{t('common.currency')}</span></h2>
        </div>

        {/* Net Profit Card */}
        <div className="glass-card" style={{ 
          padding: '32px', 
          borderBottom: '4px solid var(--primary)',
          background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.05) 0%, rgba(0, 245, 212, 0.1) 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: '1px solid var(--primary-dark)' }}>
              <TrendingUp size={28} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--primary-dark)' }}>صافي الربح</span>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginBottom: '8px', fontWeight: '600' }}>{t('reports.netProfit')}</p>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--primary)' }}>{report.netProfit} <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-dim)' }}>{t('common.currency')}</span></h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Wallet size={24} color="var(--primary)" />
             {t('reports.expensesDetails')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
              <span style={{ color: 'var(--text-dim)', fontWeight: '600' }}>{t('reports.fixedSalaries')}</span>
              <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{report.totalSalaries} {t('common.currency')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
              <span style={{ color: 'var(--text-dim)', fontWeight: '600' }}>{t('reports.commissionsDue')}</span>
              <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{report.totalCommissions} {t('common.currency')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
              <span style={{ color: 'var(--text-dim)', fontWeight: '600' }}>{t('expenses.title')}</span>
              <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{report.totalAcademyExpenses} {t('common.currency')}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '24px', 
              background: 'var(--primary-glow)', 
              borderRadius: '16px', 
              marginTop: '16px',
              border: '1px solid var(--primary-dark)'
            }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{t('reports.total')}</span>
              <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '1.3rem' }}>{report.totalSalaries + report.totalCommissions + report.totalAcademyExpenses} {t('common.currency')}</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '32px', 
            background: 'var(--primary-glow)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '32px',
            border: '1px solid var(--primary-dark)',
            boxShadow: '0 20px 40px rgba(0, 245, 212, 0.15)'
          }}>
            <PieChart size={48} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '16px' }}>{t('reports.financialPerformance')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '360px', lineHeight: '1.8' }}>
            {t('reports.performanceDesc1')} <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{( (report.netProfit / report.totalIncome) * 100).toFixed(1)}%</span>. {t('reports.performanceDesc2')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;


