const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';

const coverLetterForm = document.getElementById('coverLetterForm');
const candidateNameInput = document.getElementById('candidateName');
const targetCompanyInput = document.getElementById('targetCompany');
const jobRoleInput = document.getElementById('jobRole');
const keySkillsInput = document.getElementById('keySkills');
const jobDescInput = document.getElementById('jobDesc');

const resumeUpload = document.getElementById('resumeUpload');
const dropZone = document.getElementById('dropZone');
const resumeStatus = document.getElementById('resumeStatus');
const resumeName = document.getElementById('resumeName');
const resumeWords = document.getElementById('resumeWords');
const removeResumeBtn = document.getElementById('removeResumeBtn');

const btnAiGenerate = document.getElementById('btnAiGenerate');
const btnSimulate = document.getElementById('btnSimulate');
const btnReset = document.getElementById('btnReset');
const btnSample = document.getElementById('btnSample');

const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorTitle = document.getElementById('errorTitle');
const errorMessage = document.getElementById('errorMessage');
const btnErrorFallback = document.getElementById('btnErrorFallback');

const outputContainer = document.getElementById('outputContainer');
const letterContent = document.getElementById('letterContent');
const generationBadge = document.getElementById('generationBadge');
const wordCountBadge = document.getElementById('wordCount');
const btnCopy = document.getElementById('btnCopy');
const copyBtnText = document.getElementById('copyBtnText');
const btnDownload = document.getElementById('btnDownload');

let extractedResumeText = '';
let currentLetterRaw = '';
let lastPayload = null;

function getPayload() {
  return {
    name: candidateNameInput.value.trim(),
    company: targetCompanyInput.value.trim(),
    jobRole: jobRoleInput.value.trim(),
    skills: keySkillsInput.value.trim(),
    jobDesc: jobDescInput.value.trim()
  };
}

function validateInputs(payload) {
  if (!payload.name || !payload.company || !payload.jobRole || !payload.skills) {
    alert('Please fill in all mandatory fields: Candidate Name, Target Company, Job Role, and Key Skills.');
    return false;
  }
  return true;
}

function showView(viewName) {
  emptyState.classList.add('hidden');
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  outputContainer.classList.add('hidden');

  if (viewName === 'empty') emptyState.classList.remove('hidden');
  if (viewName === 'loading') loadingState.classList.remove('hidden');
  if (viewName === 'error') errorState.classList.remove('hidden');
  if (viewName === 'output') outputContainer.classList.remove('hidden');
}

function updateWordCount(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  wordCountBadge.textContent = `${words} words`;
}

function parseMarkdownToHtml(markdown) {
  const blocks = markdown.split(/\n\s*\n/);
  const htmlBlocks = blocks.map(block => {
    let clean = block.trim();
    if (!clean) return '';

    if (clean.startsWith('### ')) {
      return `<h4>${escapeHtml(clean.substring(4))}</h4>`;
    }
    if (clean.startsWith('## ') || clean.startsWith('# ')) {
      return `<h3>${escapeHtml(clean.replace(/^#+\s*/, ''))}</h3>`;
    }

    if (clean.startsWith('- ') || clean.startsWith('* ')) {
      const items = clean.split(/\n/).map(line => {
        const itemText = line.replace(/^[-*]\s*/, '').trim();
        return `<li>${formatInline(itemText)}</li>`;
      }).join('');
      return `<ul>${items}</ul>`;
    }

    const lines = clean.split('\n').map(l => formatInline(l)).join('<br>');
    return `<p>${lines}</p>`;
  });

  return htmlBlocks.filter(Boolean).join('');
}

function formatInline(str) {
  let res = escapeHtml(str);
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
  return res;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function buildSimulationTemplate(payload, resumeInfo) {
  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  let resumeSection = '';
  if (resumeInfo) {
    const resumeExcerpt = resumeInfo.slice(0, 300).replace(/\s+/g, ' ');
    resumeSection = `\n\nDrawing directly from my practical background:\n"${resumeExcerpt}..."\nI have cultivated hands-on engineering experience that empowers me to build reliable, high-performance web solutions and hit the ground running on day one.`;
  }

  let jobDescSection = '';
  if (payload.jobDesc) {
    jobDescSection = `\n\nReviewing your requirements, I noted your emphasis on ${payload.jobDesc.slice(0, 150)}. My practical focus on ${payload.skills} directly aligns with these core responsibilities and will allow me to immediately support your sprint objectives.`;
  }

  return `${today}

Hiring Team & Engineering Management
${payload.company}

Subject: Application for ${payload.jobRole} Role

Dear Hiring Manager at ${payload.company},

I am writing to express my strong enthusiasm for the ${payload.jobRole} position at ${payload.company}. With a rigorous foundation in ${payload.skills}, I am eager to contribute to your engineering milestones and support your ongoing technological innovations.

Having tracked ${payload.company}'s work and industry impact, I am deeply impressed by your commitment to engineering excellence. My skill set in ${payload.skills} equips me to design responsive, scalable solutions, collaborate effectively within sprint pipelines, and ensure high code quality across every feature deployment.${jobDescSection}${resumeSection}

I welcome the opportunity to discuss how my technical skills, proactive work ethic, and dedication to modern software engineering can benefit ${payload.company}. Thank you very much for your time and consideration.

Sincerely,

${payload.name}
Candidate for ${payload.jobRole}`;
}

function renderOutput(rawText, mode) {
  currentLetterRaw = rawText;
  letterContent.innerHTML = parseMarkdownToHtml(rawText);
  showView('output');

  btnCopy.disabled = false;
  btnDownload.disabled = false;
  updateWordCount(rawText);

  if (mode === 'ai') {
    generationBadge.textContent = 'Gemini AI Generated';
    generationBadge.className = 'mode-badge ai-mode';
  } else {
    generationBadge.textContent = 'Simulated Template';
    generationBadge.className = 'mode-badge sim-mode';
  }
}

function handleSimulation() {
  const payload = getPayload();
  if (!validateInputs(payload)) return;

  lastPayload = payload;
  const templateLetter = buildSimulationTemplate(payload, extractedResumeText);
  renderOutput(templateLetter, 'simulate');
}

async function handleAiGeneration(e) {
  if (e) e.preventDefault();

  const payload = getPayload();
  if (!validateInputs(payload)) return;

  lastPayload = payload;

  if (!API_KEY) {
    showView('error');
    errorTitle.textContent = 'API Key Missing in .env';
    errorMessage.textContent = 'VITE_GEMINI_API_KEY is not defined in your .env file. Please add your Gemini API key or use Quick Template simulation.';
    return;
  }

  showView('loading');

  const systemPrompt = `You are an expert career consultant and professional technical writer.
Write a personalized, compelling, and professional cover letter with the following parameters:
- Candidate Name: ${payload.name}
- Target Company: ${payload.company}
- Job Role: ${payload.jobRole}
- Core Technical Skills: ${payload.skills}
${payload.jobDesc ? `- Job Description / Requirements: ${payload.jobDesc}` : ''}
${extractedResumeText ? `- Uploaded Resume Background: ${extractedResumeText.slice(0, 1500)}` : ''}

Strict Formatting Guidelines:
1. Address it professionally to the Hiring Team at ${payload.company}.
2. Hook the reader in the opening paragraph with enthusiasm for the ${payload.jobRole} role.
3. In the body paragraphs, highlight how the candidate's skills in ${payload.skills} and background solve key engineering challenges.
4. If resume context is provided, naturally weave in specific achievements.
5. Close with a confident call to action for an interview.
6. Format in clean, readable markdown paragraphs separated by blank lines. Do not return a singular block of text.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
      throw new Error(msg);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Empty response received from Gemini API.');
    }

    renderOutput(candidateText, 'ai');
  } catch (err) {
    showView('error');
    errorTitle.textContent = 'AI Generation Failed';
    errorMessage.textContent = `Gemini API Error: ${err.message}. You can review your .env API key or use the simulation fallback.`;
  }
}

async function extractTextFromPdf(file) {
  try {
    if (!window.pdfjsLib) {
      alert('PDF parser library is still loading. Please try again in a few seconds.');
      return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map(item => item.str);
      fullText += pageStrings.join(' ') + '\n';
    }

    extractedResumeText = fullText.trim();
    const words = extractedResumeText ? extractedResumeText.split(/\s+/).length : 0;

    resumeName.textContent = file.name;
    resumeWords.textContent = `${words} words extracted`;
    resumeStatus.classList.remove('hidden');
    dropZone.classList.add('hidden');
  } catch (err) {
    alert('Failed to parse PDF file. Ensure the PDF contains selectable text.');
    clearResume();
  }
}

function clearResume() {
  extractedResumeText = '';
  resumeUpload.value = '';
  resumeStatus.classList.add('hidden');
  dropZone.classList.remove('hidden');
}

dropZone.addEventListener('click', () => resumeUpload.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type === 'application/pdf') {
    extractTextFromPdf(file);
  } else {
    alert('Please upload a valid PDF document.');
  }
});

resumeUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    extractTextFromPdf(file);
  }
});

removeResumeBtn.addEventListener('click', clearResume);

coverLetterForm.addEventListener('submit', handleAiGeneration);
btnSimulate.addEventListener('click', handleSimulation);

btnReset.addEventListener('click', () => {
  clearResume();
  currentLetterRaw = '';
  showView('empty');
  btnCopy.disabled = true;
  btnDownload.disabled = true;
  generationBadge.textContent = 'Awaiting Generation';
  generationBadge.className = 'mode-badge';
  wordCountBadge.textContent = '0 words';
});

btnErrorFallback.addEventListener('click', () => {
  if (lastPayload) {
    const templateLetter = buildSimulationTemplate(lastPayload, extractedResumeText);
    renderOutput(templateLetter, 'simulate');
  } else {
    handleSimulation();
  }
});

btnSample.addEventListener('click', () => {
  candidateNameInput.value = 'Harsh Vardhan';
  targetCompanyInput.value = 'Prodesk IT';
  jobRoleInput.value = 'Junior Full Stack Developer';
  keySkillsInput.value = 'HTML5, CSS3, JavaScript ES6+, REST APIs, Git, Vite, Asynchronous Programming';
  jobDescInput.value = 'Looking for an enthusiastic engineer to develop responsive web applications, integrate LLM APIs, and collaborate effectively within fast-paced sprint cycles.';
});

btnCopy.addEventListener('click', async () => {
  if (!currentLetterRaw) return;
  try {
    await navigator.clipboard.writeText(currentLetterRaw);
    btnCopy.classList.add('copied');
    copyBtnText.textContent = 'Copied!';
    setTimeout(() => {
      btnCopy.classList.remove('copied');
      copyBtnText.textContent = 'Copy';
    }, 2000);
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = currentLetterRaw;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    btnCopy.classList.add('copied');
    copyBtnText.textContent = 'Copied!';
    setTimeout(() => {
      btnCopy.classList.remove('copied');
      copyBtnText.textContent = 'Copy';
    }, 2000);
  }
});

btnDownload.addEventListener('click', () => {
  if (!currentLetterRaw) return;
  const name = candidateNameInput.value.trim().replace(/\s+/g, '_') || 'Cover_Letter';
  const blob = new Blob([currentLetterRaw], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}_Cover_Letter.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
