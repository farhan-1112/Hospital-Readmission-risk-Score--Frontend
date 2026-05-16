import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictReadmission } from '../api';

const DEFAULTS = {
  patient_name: '', doctor_name: '',
  time_in_hospital: 5, num_lab_procedures: 44, num_procedures: 1,
  num_medications: 13, number_outpatient: 0, number_emergency: 0,
  number_inpatient: 0, number_diagnoses: 7, age: '[50-60)',
  race: 'Caucasian', gender: 'Female', admission_type_id: 1,
  discharge_disposition_id: 1, admission_source_id: 7,
  diag_1: '250', diag_2: '276', diag_3: '250',
  A1Cresult: 'None', max_glu_serum: 'None', insulin: 'No',
  metformin: 'No', repaglinide: 'No', nateglinide: 'No', glimepiride: 'No',
  glipizide: 'No', glyburide: 'No', pioglitazone: 'No', rosiglitazone: 'No',
  acarbose: 'No', miglitol: 'No', 'glyburide-metformin': 'No',
  'glipizide-metformin': 'No', 'glimepiride-pioglitazone': 'No',
  'metformin-rosiglitazone': 'No', 'metformin-pioglitazone': 'No',
  'chlorpropamide': 'No', 'acetohexamide': 'No', 'tolbutamide': 'No',
  'troglitazone': 'No', 'tolazamide': 'No', 'examide': 'No', 'citoglipton': 'No',
  change: 'No', diabetesMed: 'No',
};




const SAMPLES = {
  high: {
    ...DEFAULTS, patient_name: 'John Doe (High Risk)', time_in_hospital: 8, num_lab_procedures: 65, num_medications: 25, 
    number_emergency: 4, number_inpatient: 6, number_diagnoses: 12, age: '[70-80)', 
    diag_1: '428', diag_2: '250', diag_3: '276', A1Cresult: '>8', insulin: 'Up', metformin: 'Steady', 
    repaglinide: 'Steady', glipizide: 'Up', glyburide: 'Steady', pioglitazone: 'Steady', change: 'Ch', diabetesMed: 'Yes'
  },
  medium: {
    ...DEFAULTS, patient_name: 'Jane Smith (Medium Risk)', time_in_hospital: 4, num_lab_procedures: 35, num_medications: 12, 
    number_inpatient: 1, number_diagnoses: 6, age: '[50-60)', diag_1: '250', diag_2: '276', diag_3: '401',
    A1Cresult: 'Norm', insulin: 'Steady', metformin: 'No', glimepiride: 'Steady', rosiglitazone: 'Steady', change: 'No', diabetesMed: 'Yes'
  },
  low: {
    ...DEFAULTS, patient_name: 'Bob Wilson (Low Risk)', time_in_hospital: 2, num_lab_procedures: 20, num_medications: 8, 
    number_inpatient: 0, number_diagnoses: 3, age: '[30-40)', diag_1: '250', diag_2: '', diag_3: '',
    A1Cresult: 'None', insulin: 'No', metformin: 'No', change: 'No', diabetesMed: 'No'
  }
};



export default function PredictPage() {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(DEFAULTS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const tabs = ['Demographics', 'Clinical', 'Diagnoses', 'Diabetes Care'];
  const setTabAndClearError = (i) => {
    setTab(i);
    setError('');
  };
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setN = (k, v) => { const n = parseInt(v); set(k, isNaN(n) ? '' : n); };

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const result = await predictReadmission(form);
      navigate('/result', { state: { result, patient: form } });
    } catch (e) { setError(e.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const Select = ({ label, field, options }) => (
    <div className="form-group"><label>{label}</label>
      <select value={form[field]} onChange={e => set(field, e.target.value)}>
        {options.map(o => <option key={typeof o === 'string' ? o : o.v} value={typeof o === 'string' ? o : o.v}>{typeof o === 'string' ? o : o.l}</option>)}
      </select></div>
  );
  const Num = ({ label, field, min = 0, max }) => (
    <div className="form-group"><label>{label}</label>
      <input type="number" min={min} max={max} value={form[field]} onChange={e => setN(field, e.target.value)} /></div>
  );

  return (
    <div className="page"><div className="predict-page">
      <div className="predict-header">
        <h1>Patient <span className="accent-text">Risk Assessment</span></h1>
        <p>Enter patient details to predict 30-day readmission risk</p>
        <div className="sample-buttons" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.8rem', alignSelf: 'center', color: 'var(--text-muted)' }}>Load Sample:</span>
          <button className="btn btn-outline btn-sm" onClick={() => { setForm(SAMPLES.high); setShowAdvanced(true); setTab(3); }}>High Risk</button>
          <button className="btn btn-outline btn-sm" onClick={() => { setForm(SAMPLES.medium); setShowAdvanced(true); setTab(3); }}>Medium Risk</button>
          <button className="btn btn-outline btn-sm" onClick={() => { setForm(SAMPLES.low); setShowAdvanced(false); setTab(3); }}>Low Risk</button>
        </div>

      </div>
      <div className="tabs">
        {tabs.map((t, i) => <button key={t} className={`tab ${tab === i ? 'active' : ''}`} onClick={() => setTabAndClearError(i)}>{t}</button>)}
      </div>
      <div className="card" style={{ padding: '2rem' }}>
        {tab === 0 && <div className="form-section active"><h3 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Patient Demographics</h3><div className="form-grid">
          <div className="form-group"><label>Patient Name</label><input value={form.patient_name} onChange={e => set('patient_name', e.target.value)} placeholder="Full Name" /></div>
          <div className="form-group"><label>Attending Physician</label><input value={form.doctor_name} onChange={e => set('doctor_name', e.target.value)} placeholder="Dr. Name" /></div>
          <Select label="Age Group" field="age" options={['[0-10)','[10-20)','[20-30)','[30-40)','[40-50)','[50-60)','[60-70)','[70-80)','[80-90)','[90-100)']} />
          <Select label="Race" field="race" options={['Caucasian','AfricanAmerican','Hispanic','Asian','Other']} />
          <Select label="Gender" field="gender" options={['Female','Male']} />
          <Select label="Admission Type" field="admission_type_id" options={[{v:1,l:'Emergency'},{v:2,l:'Urgent'},{v:3,l:'Elective'},{v:7,l:'Trauma Center'}]} />
          <Select label="Discharge Disposition" field="discharge_disposition_id" options={[{v:1,l:'Home'},{v:2,l:'Transfer'},{v:3,l:'SNF'},{v:6,l:'Home + Health'},{v:11,l:'Expired'}]} />
          <Select label="Admission Source" field="admission_source_id" options={[{v:1,l:'Physician'},{v:2,l:'Clinic'},{v:7,l:'Emergency Room'},{v:4,l:'Transfer'}]} />
        </div></div>}

        {tab === 1 && <div className="form-section active"><h3 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Clinical Information</h3><div className="form-grid">
          <Num label="Days in Hospital" field="time_in_hospital" min={1} max={30} />
          <Num label="Lab Procedures" field="num_lab_procedures" />
          <Num label="Non-Lab Procedures" field="num_procedures" />
          <Num label="Medications" field="num_medications" />
          <Num label="Outpatient Visits" field="number_outpatient" />
          <Num label="Emergency Visits" field="number_emergency" />
          <Num label="Inpatient Visits" field="number_inpatient" />
          <Num label="Number of Diagnoses" field="number_diagnoses" min={1} />
        </div></div>}

        {tab === 2 && <div className="form-section active"><h3 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Diagnosis Codes (ICD-9)</h3><div className="form-grid">
          <div className="form-group"><label>Primary Diagnosis</label><input value={form.diag_1} onChange={e => set('diag_1', e.target.value)} placeholder="e.g. 250.83" /></div>
          <div className="form-group"><label>Secondary Diagnosis</label><input value={form.diag_2} onChange={e => set('diag_2', e.target.value)} placeholder="e.g. 276" /></div>
          <div className="form-group"><label>Tertiary Diagnosis</label><input value={form.diag_3} onChange={e => set('diag_3', e.target.value)} placeholder="e.g. 250" /></div>
        </div><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Common: 250.xx (Diabetes), 428 (Heart Failure), 276 (Fluid Disorders)</p></div>}

        {tab === 3 && <div className="form-section active"><h3 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Diabetes Care</h3>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <Select label="A1C Result" field="A1Cresult" options={[{v:'None',l:'Not Tested'},{v:'Norm',l:'Normal'},{v:'>7',l:'>7'},{v:'>8',l:'>8'}]} />
            <Select label="Glucose Serum" field="max_glu_serum" options={[{v:'None',l:'Not Tested'},{v:'Norm',l:'Normal'},{v:'>200',l:'>200'},{v:'>300',l:'>300'}]} />
            <Select label="Insulin" field="insulin" options={['No','Steady','Up','Down']} />
            <Select label="Metformin" field="metformin" options={['No','Steady','Up','Down']} />
            <Select label="Medication Changed" field="change" options={[{v:'No',l:'No'},{v:'Ch',l:'Yes'}]} />
            <Select label="Diabetes Med" field="diabetesMed" options={['No','Yes']} />
          </div>

          <div className="advanced-profile" style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <button 
              type="button"
              className="advanced-toggle"
              data-open={showAdvanced}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="arrow">▸</span>
                <span className="label-main">Advanced Medication Profile</span>
              </div>
              <span className="label-sub">Optional Dataset Parameters</span>
            </button>

            
            {showAdvanced && (
              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(168,85,247,0.03)', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.1)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--accent)' }}>ℹ</span>
                    These advanced parameters from the UCI Diabetic dataset allow for a more granular risk profile. All fields default to "No" if not specified.
                  </p>
                </div>
                <div className="form-grid" style={{ gap: '1.25rem' }}>
                  <Select label="Repaglinide" field="repaglinide" options={['No','Steady','Up','Down']} />
                  <Select label="Nateglinide" field="nateglinide" options={['No','Steady','Up','Down']} />
                  <Select label="Glimepiride" field="glimepiride" options={['No','Steady','Up','Down']} />
                  <Select label="Glipizide" field="glipizide" options={['No','Steady','Up','Down']} />
                  <Select label="Glyburide" field="glyburide" options={['No','Steady','Up','Down']} />
                  <Select label="Pioglitazone" field="pioglitazone" options={['No','Steady','Up','Down']} />
                  <Select label="Rosiglitazone" field="rosiglitazone" options={['No','Steady','Up','Down']} />
                  <Select label="Acarbose" field="acarbose" options={['No','Steady','Up','Down']} />
                  <Select label="Miglitol" field="miglitol" options={['No','Steady','Up','Down']} />
                  <Select label="Glyburide-Metformin" field="glyburide-metformin" options={['No','Steady','Up','Down']} />
                </div>
              </div>
            )}

          </div>
        </div>}


        {error && <div style={{ background:'var(--risk-high-bg)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'12px 16px', color:'var(--risk-high)', fontSize:'0.9rem', marginTop:'1rem' }}>Warning: {error}</div>}

        <div className="form-actions">
          <button className="btn btn-outline" onClick={() => setTabAndClearError(Math.max(0, tab-1))} disabled={tab===0}>Previous</button>
          {tab < 3 ? <button className="btn btn-primary" onClick={() => setTabAndClearError(tab+1)}>Next</button>
            : <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Analyzing...' : 'Predict Risk'}</button>}
        </div>
      </div>
    </div></div>
  );
}
