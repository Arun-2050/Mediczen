const { OpenAI } = require('openai');
require('dotenv').config();

let openai = null;
if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your-openai')) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Analyzes patient symptoms and vitals using AI (ChatGPT / OpenAI or intelligent fallback)
 */
async function analyzeSymptoms({ patientName, age, gender, symptoms, vitals }) {
  const prompt = `You are a clinical decision support AI assistant. Analyze the following patient record:
- Patient Name: ${patientName || 'Unknown'}
- Age: ${age || 'N/A'} | Gender: ${gender || 'N/A'}
- Symptoms: ${symptoms}
- Vitals: ${JSON.stringify(vitals || {})}

Provide a structured clinical decision support summary with:
1. Top 3 Differential Diagnoses (ranked with likelihood %)
2. Recommended Clinical Next Steps & Diagnostic Tests
3. Warning Red-Flag Symptoms to Watch Out For

Keep it concise, clear, and professional. Add a disclaimer that this is AI decision support and not a final clinical diagnosis.`;

  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (content) return `Source: OpenAI clinical decision support\n\n${content}`;
    } catch (error) {
      console.error('OpenAI API Error:', error.message);
    }
  }

  const text = String(symptoms || '').toLowerCase();
  let differential;
  let tests;
  let redFlags;

  if (/(chest pain|pressure|shortness of breath|breathless)/.test(text)) {
    differential = '1. Acute coronary syndrome or other cardiac cause\n2. Pulmonary embolism or respiratory cause\n3. Musculoskeletal chest-wall pain';
    tests = 'Urgent ECG, serial troponins, oxygen saturation, and clinician-directed chest imaging.';
    redFlags = 'Emergency symptoms include severe chest pressure, fainting, blue lips, or worsening breathlessness.';
  } else if (/(abdominal|stomach|vomit|diarrhea|nausea)/.test(text)) {
    differential = '1. Gastrointestinal infection or inflammation\n2. Medication or food-related illness\n3. Appendicitis or another acute abdominal process';
    tests = 'Abdominal examination, hydration assessment, CBC, metabolic panel, and imaging if localized pain persists.';
    redFlags = 'Emergency symptoms include severe localized pain, rigid abdomen, blood in vomit or stool, or inability to keep fluids down.';
  } else if (/(headache|dizzy|weakness|numb|speech|vision)/.test(text)) {
    differential = '1. Migraine or other primary headache disorder\n2. Dehydration or metabolic cause\n3. Neurologic event requiring urgent exclusion';
    tests = 'Neurologic examination, glucose and vital-sign review; urgent imaging when symptoms are sudden or focal.';
    redFlags = 'Emergency symptoms include sudden worst-ever headache, one-sided weakness, confusion, seizure, or speech difficulty.';
  } else if (/(fever|cough|sore throat|cold|congestion)/.test(text)) {
    differential = '1. Viral upper respiratory infection\n2. Influenza or COVID-19\n3. Bacterial throat or lower respiratory infection';
    tests = 'Temperature and oxygen review, viral testing when indicated, and chest imaging if breathing symptoms persist.';
    redFlags = 'Emergency symptoms include shortness of breath at rest, chest pain, confusion, or oxygen saturation below 94%.';
  } else {
    differential = '1. Non-specific symptom syndrome requiring clinical correlation\n2. Medication, metabolic, or infectious cause\n3. Condition-specific diagnosis after examination';
    tests = 'Repeat vital signs, focused physical examination, medication review, and targeted laboratory testing.';
    redFlags = 'Seek urgent care for rapidly worsening symptoms, fainting, severe pain, breathing difficulty, or confusion.';
  }

  return `Source: Local symptom-based clinical decision support (OpenAI unavailable)\n\n### Consultation Summary\n**Patient:** ${patientName || 'Patient'} (${gender || 'N/A'}, ${age || 'N/A'} years)\n**Reported Symptoms:** ${symptoms}\n**Vitals:** ${JSON.stringify(vitals || {})}\n\n#### Differential Diagnoses\n${differential}\n\n#### Recommended Next Steps\n${tests}\n\n#### Red-Flag Symptoms\n${redFlags}\n\n*Disclaimer: Decision support only. A qualified clinician must make the final diagnosis.*`;
}

module.exports = {
  analyzeSymptoms
};
