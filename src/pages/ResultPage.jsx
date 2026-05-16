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

  return (
    <div className="page"><div className="result-page">
      <div className="predict-header">
        <h1>Risk <span className="accent-text">Predict Score</span></h1>
      </div>

      {/* Main Risk Card - Image 1 Style */}
      <div className="card reveal" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Readmission Risk</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI-generated hospital risk score</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '4.5rem', fontWeight: 800, color, lineHeight: 1 }}>{pct}</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color, marginLeft: '4px' }}>%</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>Risk Level</span>
            <div className={`risk-pill ${risk_level.toLowerCase()}`} style={{ background: color }}>
               ● {risk_level} Risk
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>Prediction</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
              {risk_level === 'High' ? 'Readmitted within 30 days' : risk_level === 'Medium' ? 'Readmitted within 30 days' : 'No readmission predicted'}
            </span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '4px', height: '40px', background: 'var(--risk-medium)', borderRadius: '2px' }}></div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              AI-assisted decision support. Final clinical decision must be made by healthcare professionals.
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Summary Section - Image 2 Style */}
      <div className="card reveal reveal-d1" style={{ padding: '2rem', background: 'rgba(168, 85, 247, 0.03)', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Top Risk Signals</h3>
        
        {loadingSummary ? (
          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', minHeight: '100px', justifyContent: 'center' }}>
            Analyzing patient profile... <span className="terminal-cursor" style={{ marginLeft: '8px' }}></span>
          </div>
        ) : (
          <div className="markdown-content ai-summary-text bullet-list" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', lineHeight: '1.7' }}>
            <ReactMarkdown>{aiSummary}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Secondary Metrics */}
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

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
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

      <div className="disclaimer" style={{ marginTop: '4rem' }}>
        This assessment is for clinical assistance only and should not replace professional medical judgment.
      </div>
    </div></div>
  );
}

