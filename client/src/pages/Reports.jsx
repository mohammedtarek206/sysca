import React, { useState, useEffect } from 'react';
import api from '../api';
import { TrendingUp, TrendingDown, DollarSign, Users, Award, PieChart, ArrowRight } from 'lucide-react';
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

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>{t('reports.loading')}</div>;
  if (!report) return <div style={{ padding: '40px', textAlign: 'center' }}>{t('reports.error')}</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{t('reports.title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('reports.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {/* Total Income Card */}
        <div className="glass-card" style={{ padding: '30px', borderLeft: isRTL ? 'none' : '5px solid #10b981', borderRight: isRTL ? '5px solid #10b981' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ background: '#10b98122', color: '#10b981', padding: '12px', borderRadius: '15px' }}>
              <TrendingUp size={28} />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '8px' }}>{t('reports.totalIncome')}</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>{report.totalIncome} <span style={{ fontSize: '1rem', fontWeight: '400' }}>{t('common.currency')}</span></h2>
        </div>

        {/* Expenses Card */}
        <div className="glass-card" style={{ padding: '30px', borderLeft: isRTL ? 'none' : '5px solid #f43f5e', borderRight: isRTL ? '5px solid #f43f5e' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ background: '#f43f5e22', color: '#f43f5e', padding: '12px', borderRadius: '15px' }}>
              <TrendingDown size={28} />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '8px' }}>{t('reports.totalExpenses')}</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>{report.totalSalaries + report.totalCommissions} <span style={{ fontSize: '1rem', fontWeight: '400' }}>{t('common.currency')}</span></h2>
        </div>

        {/* Net Profit Card */}
        <div className="glass-card" style={{ padding: '30px', borderLeft: isRTL ? 'none' : '5px solid var(--primary)', borderRight: isRTL ? '5px solid var(--primary)' : 'none', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.1) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ background: 'var(--primary)22', color: 'var(--primary)', padding: '12px', borderRadius: '15px' }}>
              <PieChart size={28} />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '8px' }}>{t('reports.netProfit')}</p>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary)' }}>{report.netProfit} <span style={{ fontSize: '1rem', fontWeight: '400' }}>{t('common.currency')}</span></h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Award size={20} color="var(--primary)" />
             {t('reports.expensesDetails')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <span>{t('reports.fixedSalaries')}</span>
              <span style={{ fontWeight: '600' }}>{report.totalSalaries} {t('common.currency')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <span>{t('reports.commissionsDue')}</span>
              <span style={{ fontWeight: '600' }}>{report.totalCommissions} {t('common.currency')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'var(--primary)10', borderRadius: '12px', marginTop: '10px' }}>
              <span style={{ fontWeight: '700' }}>{t('reports.total')}</span>
              <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{report.totalSalaries + report.totalCommissions} {t('common.currency')}</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <DollarSign size={40} color="var(--primary)" />
          </div>
          <h3 style={{ marginBottom: '10px' }}>{t('reports.financialPerformance')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px', lineHeight: '1.6' }}>
            {t('reports.performanceDesc1')} {( (report.netProfit / report.totalIncome) * 100).toFixed(1)}%. {t('reports.performanceDesc2')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;

