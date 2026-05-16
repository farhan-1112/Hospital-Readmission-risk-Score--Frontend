export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Predict readmission risk for a patient
 */
export async function predictReadmission(patientData) {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });
  if (!response.ok) {
    const error = await response.json();
    let msg = 'Prediction failed';
    if (error.detail) {
      if (typeof error.detail === 'string') msg = error.detail;
      else if (error.detail.message) msg = error.detail.message;
      else if (Array.isArray(error.detail)) {
        msg = error.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
      }
    }
    throw new Error(msg);
  }
  return response.json();
}

/**
 * Get clinical summary (OpenRouter AI)
 */
export async function analyzeRisk(riskScore, patient) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ risk_score: riskScore, patient }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail?.message || 'Analysis failed');
  }
  return response.json();
}

/**
 * Generate treatment plan (OpenRouter AI)
 */
export async function generateTreatmentPlan(riskScore, patient) {
  const response = await fetch(`${API_BASE}/treatment_plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ risk_score: riskScore, patient }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail?.message || 'Treatment plan generation failed');
  }
  return response.json();
}

/**
 * Chat with AI about the treatment plan
 */
export async function chatWithAI(message, history, patient, treatmentPlan) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, patient, treatment_plan: treatmentPlan }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail?.message || 'Chat failed');
  }
  return response.json();
}

/**
 * Get health status
 */
export async function getHealth() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}

/**
 * Get model metrics and info
 */
export async function getModelInfo() {
  const response = await fetch(`${API_BASE}/model/info`);
  return response.json();
}

/**
 * Register a new user
 */
export async function signup(email, password, name) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data;
}

/**
 * Login an existing user
 */
export async function login(email, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data;
}
