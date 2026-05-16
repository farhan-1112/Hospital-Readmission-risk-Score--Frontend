import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Initial Load Animation
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 50);

    // Intersection Observer for Reveals
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          
          // Terminal animation trigger
          if (e.target.id === 'terminal' && !e.target.dataset.typed) {
            e.target.dataset.typed = 'true';
            runTerminalAnimation();
          }

          // Metrics counter trigger
          if (e.target.classList.contains('metrics-strip') && !e.target.dataset.counted) {
            e.target.dataset.counted = 'true';
            runCounters();
          }

          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Terminal Typewriter Animation
    const lines = [
      "loading patient_id: 4821",
      "age_group: [70-80] · gender: Female",
      "prior_inpatient: 3 · A1C: >8",
      "insulin: Steady · diabetesMed: Yes",
      "num_medications: 14",
      "running XGBoost classifier...",
      "risk_score: 0.89",
      "risk_level: HIGH ⚠",
      "ai summary: generating..."
    ];
    
    function runTerminalAnimation() {
      const typeBlock = document.getElementById('typewriter');
      if (!typeBlock) return;
      
      let i = 0;
      const cursor = '<span class="terminal-cursor"></span>';
      
      const interval = setInterval(() => {
        if (i < lines.length) {
          const currentLines = lines.slice(0, i + 1).join('\n');
          typeBlock.innerHTML = currentLines + cursor;
          i++;
        } else {
          clearInterval(interval);
        }
      }, 120);
    }

    // Number Counters
    function runCounters() {
      const counters = document.querySelectorAll('.counter');
      const duration = 1200;
      
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        const startTime = performance.now();
        
        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(easeOut * target);
          
          counter.innerText = current > 999 ? current.toLocaleString() : current;
          
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            counter.innerText = target > 999 ? target.toLocaleString() : target;
          }
        }
        requestAnimationFrame(update);
      });
    }

    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <header className={`hero ${loaded ? 'loaded' : ''}`} id="hero">
        <div className="container">
          <div className="hero-content">
            <span className="eyebrow anim-eyebrow">// clinical &middot; ai &middot; readmission-risk</span>
            <h1>
              <span className="hero-line-wrapper"><span className="hero-line anim-line1">Predict who comes back</span></span>
              <span className="hero-line-wrapper"><span className="hero-line anim-line2">before discharge.</span></span>
            </h1>
            <p className="anim-subtext">An AI system that flags high-risk diabetic patients before they leave. Built on XGBoost. Explained by OpenRouter AI.</p>
            
            <div className="hero-actions anim-actions">
              <Link to="/predict" className="btn btn-primary">Run a prediction</Link>
              <a href="#pipeline" className="btn btn-ghost">See how it works &darr;</a>
            </div>

            <div className="hero-stats anim-stats">
              <div className="hero-stat-item">
                <span className="val mono">87%</span>
                <span className="lbl">Recall rate</span>
              </div>
              <div className="stat-divider"></div>
              <div className="hero-stat-item">
                <span className="val mono">&lt;30s</span>
                <span className="lbl">Prediction time</span>
              </div>
              <div className="stat-divider"></div>
              <div className="hero-stat-item">
                <span className="val mono">101k</span>
                <span className="lbl">Patient records trained</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* LIVE RISK TERMINAL */}
      <section className="terminal-section">
        <div className="container">
          <div className="terminal-card reveal" id="terminal">
            <div className="terminal-topbar">
              <div className="mac-dots">
                <div className="dot dot-r"></div>
                <div className="dot dot-y"></div>
                <div className="dot dot-g"></div>
              </div>
              <div className="terminal-title mono">risk-scorer &middot; patient #4821 &middot; LIVE</div>
            </div>
            <div className="terminal-body">
              <div className="terminal-code mono" id="typewriter"></div>
              <div className="terminal-meter">
                <div className="arc-container">
                  <svg className="arc-svg" viewBox="0 0 160 160">
                    <path className="arc-bg" d="M 10 150 A 70 70 0 0 1 150 150" />
                    <path className="arc-fill" d="M 10 150 A 70 70 0 0 1 150 150" />
                  </svg>
                  <div className="arc-value">
                    <span className="num mono">89%</span>
                    <span className="lvl">HIGH RISK</span>
                  </div>
                </div>
                <div className="meter-legend">
                  <div className="legend-item l-g">&lt;40%</div>
                  <div className="legend-item l-y">40-70%</div>
                  <div className="legend-item l-r">&gt;70%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="pipeline">
        <div className="container">
          <div className="section-header reveal">
            <span className="eyebrow">// pipeline</span>
            <h2>From patient data to clinical action.</h2>
          </div>
          <div className="grid-3">
            <div className="step-card reveal reveal-d1">
              <span className="step-label mono">01</span>
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              </div>
              <h3>Enter clinical features</h3>
              <p>Age, medications, diagnosis codes, prior visits — the same variables clinicians already track.</p>
            </div>
            <div className="step-card reveal reveal-d2">
              <span className="step-label mono">02</span>
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
              </div>
              <h3>Model scores the risk</h3>
              <p>Trained on 101,000 diabetic patient records. Outputs a probability score and risk tier in under 30 seconds.</p>
            </div>
            <div className="step-card reveal reveal-d3">
              <span className="step-label mono">03</span>
              <div className="step-icon">
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <h3>AI suggests treatment plan</h3>
              <p>Using the OpenRouter AI API, the system generates a tailored clinical summary based on the risk score, suggesting actionable treatment and follow-up care to the doctor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RISK OUTPUT SHOWCASE */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <span className="eyebrow">// output</span>
            <h2>What the system returns.</h2>
          </div>
          <div className="grid-3">
            <div className="output-card risk-low reveal reveal-d1">
              <div className="out-header">
                <div className="out-score">32%</div>
                <div className="out-badge">LOW</div>
              </div>
              <div className="out-label mono">risk_level: "Low"</div>
              <p className="out-summary">Patient shows stable indicators. Standard discharge protocol recommended.</p>
            </div>
            <div className="output-card risk-med reveal reveal-d2">
              <div className="out-header">
                <div className="out-score">61%</div>
                <div className="out-badge">MEDIUM</div>
              </div>
              <div className="out-label mono">risk_level: "Medium"</div>
              <p className="out-summary">Elevated risk from prior inpatient history. Schedule 7-day follow-up.</p>
            </div>
            <div className="output-card risk-high reveal reveal-d3">
              <div className="out-header">
                <div className="out-score">89%</div>
                <div className="out-badge">HIGH</div>
              </div>
              <div className="out-label mono">risk_level: "High"</div>
              <p className="out-summary">Multiple risk factors active. Recommend pre-discharge intervention and glucose monitoring.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI TREATMENT PLAN SHOWCASE */}
      <section className="section" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header reveal">
            <span className="eyebrow">// generative ai</span>
            <h2>Actionable Clinical Plans.</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '16px auto 0' }}>Our integration with OpenRouter AI analyzes the high-risk factors to provide a structured, step-by-step preventative care plan.</p>
          </div>
          
          <div className="reveal" style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--bg-base)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: '0 12px 32px var(--accent-dim)' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>AI Treatment Protocol Generated</span>
            </div>
            <div style={{ padding: '32px', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '16px' }}>1. Immediate Actions</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '24px' }}>
                <li>Schedule a follow-up appointment within 7 days of discharge.</li>
                <li>Assign a dedicated care coordinator to oversee the post-discharge transition.</li>
              </ul>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '16px' }}>2. Medication Management</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '24px' }}>
                <li>Review the recent increase in insulin dosage; ensure the patient understands the new regimen.</li>
                <li>Conduct a comprehensive medication reconciliation to address polypharmacy (14 active medications).</li>
              </ul>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '16px' }}>3. Lifestyle Interventions</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '24px' }}>
                <li>Refer to a diabetes educator for guidance on managing A1C levels (&gt;8).</li>
              </ul>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', textAlign: 'right' }}>
               <Link to="/predict" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>Generate a Plan</Link>
            </div>
          </div>
        </div>
      </section>

      {/* KEY METRICS STRIP */}
      <section className="metrics-strip reveal">
        <div className="container">
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-num"><span className="counter" data-target="101766">0</span></div>
              <div className="metric-lbl">Patient records in training set</div>
            </div>
            <div className="metric-div"></div>
            <div className="metric-item">
              <div className="metric-num"><span className="counter" data-target="87">0</span>%</div>
              <div className="metric-lbl">Recall on test set</div>
            </div>
            <div className="metric-div"></div>
            <div className="metric-item">
              <div className="metric-num"><span className="counter" data-target="3">0</span></div>
              <div className="metric-lbl">Risk tiers (Low &middot; Medium &middot; High)</div>
            </div>
            <div className="metric-div"></div>
            <div className="metric-item">
              <div className="metric-num">&lt;<span className="counter" data-target="30">0</span>s</div>
              <div className="metric-lbl">End-to-end prediction time</div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="section" style={{ overflow: 'hidden' }}>
        <div className="container">
          <div className="section-header reveal">
            <span className="eyebrow">// built with</span>
            <h2>The stack behind it.</h2>
          </div>
          <div className="solar-system reveal reveal-d1">
            <div className="solar-core">
              RiskScore
              <span>RiskScore</span>
            </div>
            
            {/* Dashed Orbit Rings */}
            <div className="orbit-ring orbit-ring-1"></div>
            <div className="orbit-ring orbit-ring-2"></div>
            <div className="orbit-ring orbit-ring-3"></div>

            {/* Orbit 1: Core ML & API */}
            <div className="planet o1-p1">XGBoost</div>
            <div className="planet o1-p2">Python</div>
            <div className="planet o1-p3">FastAPI</div>

            {/* Orbit 2: Frontend & AI */}
            <div className="planet o2-p1">React</div>
            <div className="planet o2-p2">Tailwind</div>
            <div className="planet o2-p3">OpenRouter AI</div>
            <div className="planet o2-p4">SMOTE</div>

            {/* Orbit 3: DevOps & Tracking */}
            <div className="planet o3-p1">MLflow</div>
            <div className="planet o3-p2">Docker</div>
            <div className="planet o3-p3">GitHub Actions</div>
          </div>
        </div>
      </section>

      {/* DISCLAIMER BANNER */}
      <section className="container">
        <div className="disclaimer reveal">
          <div className="disclaimer-icon">&#9888;</div>
          <p>This system is intended for clinical decision support only. It does not replace professional medical judgment. Always consult a qualified healthcare provider.</p>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="section">
        <div className="container">
          <div className="cta-banner reveal">
            <h2>Ready to predict readmission risk?</h2>
            <p>Connect it to your FastAPI backend and start scoring patients in under a minute.</p>
            <div className="cta-actions">
              <Link to="/predict" className="btn btn-primary">Start predicting</Link>
              <Link to="/analytics" className="btn btn-ghost">View Analytics</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M12 8v8"/>
                  <path d="M8 12h8"/>
                </svg>
                RiskScore
              </div>
              <p>An AI-powered clinical decision support system.</p>
            </div>
            <div className="footer-links">
              <Link to="/">Overview</Link>
              <Link to="/predict">Risk Model</Link>
              <Link to="#">Documentation</Link>
              <Link to="#">GitHub Repository</Link>
            </div>
            <div>
              <p>Built for clinicians.<br />Engineered by developers.</p>
            </div>
          </div>
          <div className="footer-bottom">
            <div>&copy; 2026 Hospital Readmission Risk Scorer</div>
            <div className="mono">model: xgboost &middot; recall: 87% &middot; v1.0.0</div>
          </div>
        </div>
      </footer>
    </>
  );
}
