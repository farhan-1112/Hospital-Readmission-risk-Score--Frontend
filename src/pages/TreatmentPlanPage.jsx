import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateClinicalPDF } from '../utils/pdfGenerator';
import { generateTreatmentPlan, chatWithAI } from '../api';

export default function TreatmentPlanPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const newMessage = { role: 'user', content: chatInput };
    setChatHistory(prev => [...prev, newMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const data = await chatWithAI(newMessage.content, chatHistory, state.patient, treatmentPlan);
      setChatHistory(prev => [...prev, { role: 'model', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'model', content: "Sorry, I couldn't process your request." }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (!state?.result) {
      navigate('/predict');
      return;
    }
    
    const fetchTreatmentPlan = async () => {
      try {
        const { risk_score } = state.result;
        const patient = state.patient;
        
        const data = await generateTreatmentPlan(risk_score, patient);
        
        if (data.summary) {
          setTreatmentPlan(data.summary);
        } else {
          setTreatmentPlan("Unable to generate treatment plan at this time.");
        }
      } catch (error) {
        console.error(error);
        setTreatmentPlan("Failed to communicate with backend analysis service.");
      } finally {
        setLoading(false);
      }
    };

    fetchTreatmentPlan();
  }, [state, navigate]);

  if (!state?.result) return null;

  return (
    <div className="page">
      <div className="result-page">
        <div className="predict-header" style={{ marginBottom: '2rem' }}>
          <h1>AI <span className="accent-text">Treatment Plan</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Personalized preventative action plan to reduce readmission risk</p>
        </div>

        <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--accent-border)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', color: 'var(--accent)', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Clinical Recommendation
          </h3>
          
          {loading ? (
            <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '1rem', display: 'flex', alignItems: 'center', minHeight: '200px', justifyContent: 'center' }}>
              Synthesizing treatment plan from clinical data... <span className="terminal-cursor" style={{ marginLeft: '4px' }}></span>
            </div>
          ) : (
            <div className="markdown-content" style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.8' }}>
              <ReactMarkdown>{treatmentPlan}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Chatbot Section */}
        {!loading && (
          <div className="card chat-container reveal reveal-d3" style={{ 
            marginTop: '3rem', 
            background: 'rgba(13, 13, 13, 0.6)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--accent-border)',
            boxShadow: '0 8px 32px var(--accent-glow)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: 0
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px var(--accent-glow)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                Clinical AI Assistant
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(62, 207, 142, 0.1)', padding: '4px 10px', borderRadius: '999px' }}>
                <span className="pulse-dot" style={{ width: '6px', height: '6px', background: 'var(--green)', animation: 'none', boxShadow: '0 0 8px var(--green)' }}></span>
                Online
              </div>
            </div>
            
            <div className="chat-messages" style={{ 
              padding: '24px', 
              height: '350px', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px',
              scrollBehavior: 'smooth'
            }}>
              {chatHistory.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '16px', opacity: 0.5 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                  <p style={{ fontSize: '1rem' }}>Ask any questions about the patient's treatment plan.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>E.g., "What are the common side effects of Metformin?"</p>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div key={i} style={{ 
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', 
                    maxWidth: '85%',
                    animation: 'heroFadeInUp 0.3s ease forwards'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', marginLeft: msg.role === 'user' ? '0' : '4px', textAlign: msg.role === 'user' ? 'right' : 'left', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      {msg.role === 'model' && (
                        <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}></span>
                      )}
                      {msg.role === 'user' ? 'Dr. Smith (You)' : 'AI Assistant'}
                    </div>
                    <div className="markdown-content" style={{ 
                      background: msg.role === 'user' ? 'linear-gradient(135deg, var(--accent) 0%, #8A2BE2 100%)' : 'rgba(255,255,255,0.05)', 
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                      padding: '14px 18px', 
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      boxShadow: msg.role === 'user' ? '0 4px 12px rgba(168, 85, 247, 0.3)' : 'none'
                    }}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div style={{ alignSelf: 'flex-start', maxWidth: '80%', animation: 'heroFadeInUp 0.3s ease forwards' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}></span>
                    AI Assistant
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '14px 18px', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className="dot-pulse"></span>
                    <span className="dot-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="dot-pulse" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid var(--border)' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your clinical question here..."
                  style={{ 
                    flex: 1, 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid var(--border)', 
                    padding: '16px 20px', 
                    borderRadius: '12px', 
                    color: 'var(--text-primary)', 
                    outline: 'none',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  disabled={chatLoading}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={!chatInput.trim() || chatLoading} 
                  style={{ 
                    padding: '0 24px', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Send</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)} className="btn btn-outline">&larr; Back to Results</button>
          <button 
            onClick={() => generateClinicalPDF(state.patient, state.result, treatmentPlan, "AI-Generated Clinical Treatment Plan")}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download Plan PDF
          </button>
          <Link to="/predict" className="btn btn-primary">New Prediction</Link>
        </div>
        
        <div className="disclaimer" style={{ marginTop: '2rem' }}>
          This assessment is for clinical assistance only and should not replace professional medical judgment.
        </div>
      </div>
    </div>
  );
}

// Add simple markdown styling to the document if not present
const style = document.createElement('style');
style.textContent = `
  .markdown-content h1, .markdown-content h2, .markdown-content h3 {
    color: var(--text-primary);
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  .markdown-content h2 { font-size: 1.3rem; }
  .markdown-content h3 { font-size: 1.1rem; }
  .markdown-content p { margin-bottom: 1rem; }
  .markdown-content ul {
    list-style-type: disc;
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }
  .markdown-content ol {
    list-style-type: decimal;
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }
  .markdown-content li { margin-bottom: 0.5rem; display: list-item; }
  .markdown-content strong { color: var(--accent); }
  
  /* Chat styles */
  .chat-messages::-webkit-scrollbar {
    width: 6px;
  }
  .chat-messages::-webkit-scrollbar-track {
    background: transparent;
  }
  .chat-messages::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
  }
  .chat-messages::-webkit-scrollbar-thumb:hover {
    background: var(--accent-border);
  }
  .dot-pulse {
    width: 6px;
    height: 6px;
    background-color: var(--text-muted);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); background-color: var(--accent); }
  }
`;
document.head.appendChild(style);
