import { useState, useEffect } from 'react';
import { getModelInfo } from '../api';

const metricBars = [
  { label: 'Recall', value: 0.823, color: '#A855F7' },
  { label: 'F2 Score', value: 0.432, color: '#3b82f6' },
  { label: 'F1 Score', value: 0.252, color: '#8b5cf6' },
  { label: 'ROC-AUC', value: 0.687, color: '#06b6d4' },
  { label: 'Accuracy', value: 0.455, color: '#6366f1' },
];

const ageData = [
  { label: '0-30', rate: 6 },
  { label: '30-50', rate: 9 },
  { label: '50-60', rate: 11 },
  { label: '60-70', rate: 12 },
  { label: '70-80', rate: 14 },
  { label: '80+', rate: 13 },
];

const featureImportance = [
  { name: 'number_inpatient', importance: 0.95 },
  { name: 'number_emergency', importance: 0.82 },
  { name: 'discharge_disposition_id', importance: 0.74 },
  { name: 'number_diagnoses', importance: 0.68 },
  { name: 'time_in_hospital', importance: 0.61 },
];

export default function AnalyticsPage() {
  const [modelInfo, setModelInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    getModelInfo().then(setModelInfo).catch(() => {});
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page">
      <div className="container analytics-page">
        {/* Header */}
        <div className={`predict-header reveal ${isVisible ? 'visible' : ''}`}>
          <span className="eyebrow">Data Science Insights</span>
          <h1>Model <span className="accent-text">Analytics</span></h1>
          <p>Comprehensive performance breakdown of our clinical decision support system.</p>
        </div>

        {/* High Level Stats */}
        <div className={`grid-4 reveal reveal-d1 ${isVisible ? 'visible' : ''}`} style={{ marginBottom: '2.5rem' }}>
          {[
            { icon: '🎯', value: '82.3%', label: 'Recall', bg: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' },
            { icon: '📊', value: '0.687', label: 'ROC-AUC', bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
            { icon: '🏥', value: '101,766', label: 'Patients', bg: 'rgba(62, 207, 142, 0.15)', color: '#3ECF8E' },
            { icon: '🧬', value: '124', label: 'Features', bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' },
          ].map((s, i) => (
            <div key={s.label} className="card stat-card" style={{ borderBottom: `2px solid ${s.color}` }}>
              <div className="stat-icon" style={{ background: s.bg, border: `1px solid ${s.color}33` }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className={`grid-2 reveal reveal-d2 ${isVisible ? 'visible' : ''}`} style={{ marginBottom: '2.5rem' }}>
          {/* Performance Metrics Chart */}
          <div className="card chart-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Model Performance Metrics</h3>
              <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>XGBOOST V1.0</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {metricBars.map(m => (
                <div key={m.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{m.label}</span>
                    <span style={{ fontWeight: 800, color: m.color }}>{(m.value * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: isVisible ? `${m.value * 100}%` : '0%', 
                        background: `linear-gradient(90deg, ${m.color}88, ${m.color})`, 
                        borderRadius: 5, 
                        transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: `0 0 10px ${m.color}44`
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Age Distribution Chart */}
          <div className="card chart-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Readmission Rate by Age</h3>
              <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>POPULATION STUDY</span>
            </div>
            <div className="chart-bars" style={{ height: '220px', alignItems: 'flex-end', paddingBottom: '20px' }}>
              {ageData.map(d => (
                <div key={d.label} className="chart-bar">
                  <div 
                    className="bar" 
                    style={{ 
                      height: isVisible ? `${d.rate * 12}px` : '0px', 
                      background: `linear-gradient(to top, var(--accent-glow), var(--accent))`,
                      boxShadow: '0 4px 12px var(--accent-dim)',
                      width: '80%',
                      borderRadius: '4px 4px 2px 2px'
                    }} 
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '8px' }}>{d.rate}%</span>
                  <span className="bar-label" style={{ fontSize: '0.7rem' }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model Comparison Table */}
        <div className={`card reveal reveal-d3 ${isVisible ? 'visible' : ''}`} style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Benchmark Comparison</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>How our optimized model stacks up against traditional algorithms.</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Model', 'Recall (Primary)', 'F1 Score', 'ROC-AUC', 'Accuracy'].map(h => (
                    <th key={h} style={{ padding: '12px 15px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'XGBoost (Optimized)', r: '0.8230', f1: '0.2519', auc: '0.6871', acc: '0.4547', best: true },
                  { name: 'XGBoost (Standard)', r: '0.6156', f1: '0.2490', auc: '0.6424', acc: '0.5857' },
                  { name: 'Logistic Regression', r: '0.0762', f1: '0.1016', auc: '0.5715', acc: '0.8496' },
                  { name: 'Random Forest', r: '0.0220', f1: '0.0409', auc: '0.6239', acc: '0.8849' },
                  { name: 'LightGBM', r: '0.0269', f1: '0.0506', auc: '0.6678', acc: '0.8875' },
                ].map(m => (
                  <tr key={m.name} style={{ borderBottom: '1px solid var(--border)', background: m.best ? 'var(--accent-glow)' : 'transparent', transition: 'background 0.2s' }}>
                    <td style={{ padding: '15px', fontWeight: m.best ? 700 : 400 }}>
                      {m.name} {m.best && <span style={{ marginLeft: '8px', fontSize: '0.7rem', padding: '2px 6px', background: 'var(--accent)', color: '#000', borderRadius: '4px' }}>BEST</span>}
                    </td>
                    <td style={{ padding: '15px', color: m.best ? 'var(--accent)' : 'inherit', fontWeight: m.best ? 800 : 400 }}>{m.r}</td>
                    <td style={{ padding: '15px' }}>{m.f1}</td>
                    <td style={{ padding: '15px' }}>{m.auc}</td>
                    <td style={{ padding: '15px' }}>{m.acc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribution and Features */}
        <div className={`grid-2 reveal reveal-d3 ${isVisible ? 'visible' : ''}`} style={{ marginBottom: '4rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700 }}>Data Imbalance Handling</h3>
            <div style={{ display: 'flex', gap: '1rem', height: '80px' }}>
              <div style={{ flex: 8.8, background: 'var(--risk-low-bg)', border: '1px solid var(--risk-low)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--risk-low)' }}>88.8%</div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Negative Class</div>
              </div>
              <div style={{ flex: 1.2, background: 'var(--risk-high-bg)', border: '1px solid var(--risk-high)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--risk-high)' }}>11.2%</div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1.2rem', lineHeight: 1.5 }}>
              The dataset contains an 8:1 imbalance ratio. We addressed this by optimizing for the **F2-score**, which prioritizes Recall (finding positives) over Precision.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700 }}>Top Predictive Features</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {featureImportance.map((f, i) => (
                <div key={f.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700, marginRight: '10px' }}>0{i+1}</span>
                      {f.name.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: isVisible ? `${f.importance * 100}%` : '0%', background: 'var(--accent)', borderRadius: 2, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="disclaimer" style={{ marginBottom: '5rem' }}>
          <div className="disclaimer-icon">ⓘ</div>
          <p>
            Analytics generated from the UCI Diabetic Patient Readmission Dataset (1999–2008). 
            Model performance is validated on a hold-out test set of 20,354 patient records.
          </p>
        </div>
      </div>
    </div>
  );
}
