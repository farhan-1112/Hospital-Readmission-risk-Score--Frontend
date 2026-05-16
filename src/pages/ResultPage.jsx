import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateClinicalPDF } from '../utils/pdfGenerator';
import { analyzeRisk } from '../api';

export default function ResultPage() {
  const { state } = useLocation();
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    // Intersection Observer for Reveals
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    if (!state?.result) return;
    
    const fetchSummary = async () => {
      try {
        const { risk_score } = state.result;
        const patient = state.patient;
        
        const data = await analyzeRisk(risk_score, patient);
        
        if (data.summary) {
          setAiSummary(data.summary);
        } else {
          setAiSummary("Unable to generate clinical summary at this time.");
        }
      } catch (error) {
        console.error(error);
        setAiSummary(error.message || "Failed to communicate with backend analysis service.");
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();

    return () => {
      io.disconnect();
    };
  }, [state]);

  if (!state?.result) return (
    <div className="page"><div className="result-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h2>No prediction data</h2><p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>Please run a prediction first.</p>
      <Link to="/predict" className="btn btn-primary">Go to Prediction</Link>
    </div></div>
  );

  const { risk_score, risk_level } = state.result;
  const patient = state.patient;
  const pct = Math.round(risk_score * 100);
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (risk_score * circumference);
  const color = risk_level === 'High' ? 'var(--risk-high)' : risk_level === 'Medium' ? 'var(--risk-medium)' : 'var(--risk-low)';

  const recommendations = risk_level === 'High'
    ? ['Schedule follow-up within 7 days', 'Monitor blood glucose daily', 'Review medication adherence', 'Assign care coordinator', 'Consider home health services']
    : risk_level === 'Medium'
    ? ['Schedule follow-up within 14 days', 'Monitor blood glucose regularly', 'Review discharge medications', 'Patient education on warning signs']
    : ['Standard discharge protocol', 'Schedule routine follow-up', 'Provide patient education materials'];

  const factors = [];
  if (patient.number_inpatient > 2) factors.push('Multiple prior inpatient visits');
  if (patient.number_emergency > 1) factors.push('History of emergency visits');
  if (patient.A1Cresult === '>8') factors.push('Elevated A1C levels (>8)');
  if (patient.insulin === 'Up') factors.push('Insulin dosage increase');
  if (patient.number_diagnoses > 7) factors.push('High comorbidity burden');
  if (patient.time_in_hospital > 7) factors.push('Extended hospital stay');
  if (patient.change === 'Ch') factors.push('Recent medication changes');
  if (factors.length === 0) factors.push('No major individual risk factors identified', 'Risk may be from combined feature interactions');
  
  const getRiskInsight = (score) => {
    if (score >= 80) return { title: 'Critical Risk Profile', text: 'This patient is in the highest risk decile. Immediate clinical intervention and intensive post-discharge oversight are strongly recommended.', icon: '🔴', color: 'var(--risk-high)' };
    if (score >= 60) return { title: 'Elevated Risk Profile', text: 'High probability of readmission detected. Prioritize early follow-up and comprehensive medication reconciliation before discharge.', icon: '🟠', color: 'var(--risk-medium)' };
    if (score >= 40) return { title: 'Moderate Risk Profile', text: 'Risk factors are present but manageable. Ensure the patient has a clear understanding of their care plan and warning signs.', icon: '🟡', color: 'var(--accent)' };
    return { title: 'Standard Risk Profile', text: 'Patient shows stable indicators. Risk of readmission is within expected ranges for this demographic.', icon: '🟢', color: 'var(--risk-low)' };
  };

  const insight = getRiskInsight(pct);

  return (
    <div className="page"><div className="result-page">
      <div className="predict-header">
        <h1>Risk <span className="accent-text">Assessment Result</span></h1>
      </div>

      <div className="card">
        <div className="risk-meter-container">
          <div className="risk-meter">
            <svg viewBox="0 0 200 200">
              <circle className="bg-ring" cx="100" cy="100" r="90" />
              <circle className="progress-ring" cx="100" cy="100" r="90"
                style={{ stroke: color, strokeDasharray: circumference, strokeDashoffset: offset }} />
            </svg>
            <div className="center-text">
              <div className="score" style={{ color }}>{pct}%</div>
              <div className="label">Risk Score</div>
            </div>
          </div>
          <div className={`risk-badge ${risk_level.toLowerCase()}`}>
            {risk_level === 'High' ? '🔴' : risk_level === 'Medium' ? '🟡' : '🟢'} {risk_level} Risk
          </div>
        </div>

        <div className="confidence-bar">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Confidence</span><span>{pct}%</span>
          </div>
          <div className="bar-bg"><div className="bar-fill" style={{ width: `${pct}%`, background: color }}></div></div>
        </div>
      </div>

      <div className="card reveal reveal-d1" style={{ marginTop: '1.5rem', background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', boxShadow: '0 4px 20px rgba(168, 85, 247, 0.05)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          Clinical AI Summary
        </h3>
        {loadingSummary ? (
          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem', display: 'flex', alignItems: 'center', minHeight: '60px' }}>
            Consulting Clinical AI Assistant... <span className="terminal-cursor" style={{ marginLeft: '8px' }}></span>
          </div>
        ) : (
          <div className="markdown-content ai-summary-text" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            <ReactMarkdown>{aiSummary}</ReactMarkdown>
          </div>
        )}
      </div>

      <div className="metrics-cards-container reveal reveal-d2">
        <div className="metric-card">
          <div className="label">Recall</div>
          <div className="value">1.000</div>
        </div>
        <div className="metric-card">
          <div className="label">Precision</div>
          <div className="value">0.112</div>
        </div>
        <div className="metric-card">
          <div className="label">F1 Score</div>
          <div className="value">0.201</div>
        </div>
        <div className="metric-card">
          <div className="label">False Negatives</div>
          <div className="value">0</div>
        </div>
      </div>

      <div className="recall-info-card reveal reveal-d3">
        <p>
          <strong>Why recall matters:</strong> In hospital readmission prediction, a 
          false negative means a truly high-risk patient may not receive timely follow-up 
          care. This project prioritizes <strong>100% Recall</strong> to ensure zero 
          high-risk patients are missed.
        </p>
      </div>

      <div className="card reveal reveal-d3" style={{ marginTop: '1.5rem', borderLeft: `4px solid ${insight.color}` }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{insight.icon}</span> {insight.title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {insight.text}
        </p>
      </div>

      <div className="info-panels">
        <div className="card info-panel">
          <h3>📋 Contributing Factors</h3>
          <ul>{factors.map((f, i) => <li key={i}><span className="bullet"></span>{f}</li>)}</ul>
        </div>
        <div className="card info-panel">
          <h3>💡 Recommendations</h3>
          <ul>{recommendations.map((r, i) => <li key={i}><span className="bullet"></span>{r}</li>)}</ul>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
        <Link to="/predict" className="btn btn-outline">New Prediction</Link>
        <button 
          onClick={() => generateClinicalPDF(patient, state.result, null, aiSummary)}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download PDF
        </button>
        <Link to="/treatment-plan" state={{ result: state.result, patient: state.patient }} className="btn btn-primary">AI Treatment Plan</Link>
        <Link to="/analytics" className="btn btn-primary">View Analytics</Link>
      </div>

      <div className="disclaimer">
        This assessment is for clinical assistance only and should not replace professional medical judgment.
      </div>
    </div></div>
  );
}
