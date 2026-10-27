const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || "";
const letterForm = document.getElementById("letterForm");
const nameInput = document.getElementById("nameInput");
const companyInput = document.getElementById("companyInput");
const roleInput = document.getElementById("roleInput");
const skillsInput = document.getElementById("skillsInput");
const jdInput = document.getElementById("jdInput");
const dropZone = document.getElementById("dropZone");
const resumeFile = document.getElementById("resumeFile");
const resumeInfo = document.getElementById("resumeInfo");
const resumeName = document.getElementById("resumeName");
const resumeWords = document.getElementById("resumeWords");
const removeResumeBtn = document.getElementById("removeResumeBtn");
const generateBtn = document.getElementById("generateBtn");
const templateBtn = document.getElementById("templateBtn");
const resetBtn = document.getElementById("resetBtn");
const sampleBtn = document.getElementById("sampleBtn");
const fallbackBtn = document.getElementById("fallbackBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorTitle = document.getElementById("errorTitle");
const errorMessage = document.getElementById("errorMessage");
const letterPaper = document.getElementById("letterPaper");
const wordCount = document.getElementById("wordCount");

let resumeText = "";
let currentLetterText = "";

function countWords(str) {
  if (!str || !str.trim()) return 0;
  return str.trim().split(/\s+/).length;
}

function showState(state) {
  emptyState.classList.add("hidden");
  loadingState.classList.add("hidden");
  errorState.classList.add("hidden");
  letterPaper.classList.add("hidden");
  if (state === "empty") emptyState.classList.remove("hidden");
  if (state === "loading") loadingState.classList.remove("hidden");
  if (state === "error") errorState.classList.remove("hidden");
  if (state === "output") letterPaper.classList.remove("hidden");
}

function getFormData() {
  return {
    name: nameInput.value.trim(),
    company: companyInput.value.trim(),
    role: roleInput.value.trim(),
    skills: skillsInput.value.trim(),
    jd: jdInput.value.trim()
  };
}

function validateForm(data) {
  if (!data.name || !data.company || !data.role || !data.skills) {
    alert("Please fill all required fields: Name, Target Company, Role, and Skills.");
    return false;
  }
  return true;
}

function createTemplate(data) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  let letter = date + "\n\n";
  letter += "Hiring Team\n";
  letter += data.company + "\n\n";
  letter += "Subject: Application for " + data.role + "\n\n";
  letter += "Dear Hiring Manager,\n\n";
  letter += "I am writing to express my strong interest in the " + data.role + " position at " + data.company + ". ";
  letter += "With practical hands-on experience in " + data.skills + ", I am confident in my ability to quickly contribute to your team's development goals.\n\n";
  if (data.jd) {
    letter += "Reviewing your job requirements for " + data.role + ", I noticed an emphasis on building responsive web solutions. ";
    letter += "My background in " + data.skills + " directly aligns with these technical expectations.\n\n";
  }
  if (resumeText) {
    const resumeSnippet = resumeText.slice(0, 200).replace(/\s+/g, " ");
    letter += "As demonstrated in my recent background (" + resumeSnippet + "...), I have consistently focused on delivering clean code and working effectively in sprint cycles.\n\n";
  }
  letter += "I would welcome the opportunity to discuss my qualifications in greater detail. Thank you for your time and consideration.\n\n";
  letter += "Sincerely,\n";
  letter += data.name;
  return letter;
}

function parseMarkdown(md) {
  const blocks = md.split(/\n\s*\n/);
  let html = "";
  for (let i = 0; i < blocks.length; i++) {
    let b = blocks[i].trim();
    if (!b) continue;
    b = b.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    b = b.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    b = b.replace(/\*(.*?)\*/g, "<em>$1</em>");
    if (b.startsWith("### ")) {
      html += "<h4>" + b.slice(4) + "</h4>";
    } else if (b.startsWith("## ") || b.startsWith("# ")) {
      html += "<h3>" + b.replace(/^#+\s*/, "") + "</h3>";
    } else if (b.startsWith("- ") || b.startsWith("* ")) {
      const items = b.split("\n");
      html += "<ul>";
      for (let j = 0; j < items.length; j++) {
        const item = items[j].replace(/^[-*]\s*/, "").trim();
        if (item) html += "<li>" + item + "</li>";
      }
      html += "</ul>";
    } else {
      const lines = b.split("\n");
      html += "<p>" + lines.join("<br>") + "</p>";
    }
  }
  return html;
}

function displayLetter(text) {
  currentLetterText = text;
  letterPaper.innerHTML = parseMarkdown(text);
  showState("output");
  wordCount.textContent = countWords(text) + " words";
  copyBtn.disabled = false;
  downloadBtn.disabled = false;
}

function handleQuickTemplate() {
  const data = getFormData();
  if (!validateForm(data)) return;
  displayLetter(createTemplate(data));
}

async function handleAiGeneration(e) {
  if (e) e.preventDefault();
  const data = getFormData();
  if (!validateForm(data)) return;
  if (!GEMINI_API_KEY) {
    showState("error");
    errorTitle.textContent = "API Key Missing";
    errorMessage.textContent = "Add your VITE_GEMINI_API_KEY to your .env file, or use Quick Template instead.";
    return;
  }
  showState("loading");
  let prompt = "You are a professional hiring consultant and cover letter writer.\n";
  prompt += "Write a high-impact, professional cover letter based on the following candidate parameters:\n";
  prompt += "- Candidate Name: " + data.name + "\n";
  prompt += "- Target Company: " + data.company + "\n";
  prompt += "- Job Role: " + data.role + "\n";
  prompt += "- Key Skills: " + data.skills + "\n";
  if (data.jd) prompt += "- Job Description Context: " + data.jd + "\n";
  if (resumeText) prompt += "- Extracted Resume Context: " + resumeText.slice(0, 1500) + "\n";
  prompt += "\nGuidelines:\n";
  prompt += "- Format with clear paragraphs separated by blank lines.\n";
  prompt += "- Make it concise, confident, and role-specific (around 200-300 words).\n";
  prompt += "- Do NOT include bracketed placeholders like [Address] or [Date].";

  const candidateModels = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-flash-latest"];
  let generatedText = "";
  let lastError = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 380,
            temperature: 0.7,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      });
      if (!response.ok) {
        if (i < candidateModels.length - 1) continue;
        const errJson = await response.json().catch(function () { return {}; });
        let msg = errJson.error && errJson.error.message ? errJson.error.message : "HTTP " + response.status;
        throw new Error(msg);
      }
      const result = await response.json();
      const candidate = result.candidates && result.candidates[0];
      if (candidate && candidate.content && Array.isArray(candidate.content.parts)) {
        const textParts = candidate.content.parts.filter(function (p) { return p.text && !p.thought; });
        if (textParts.length > 0) {
          generatedText = textParts.map(function (p) { return p.text; }).join("\n\n");
        } else if (candidate.content.parts[0] && candidate.content.parts[0].text) {
          generatedText = candidate.content.parts[0].text;
        }
      }
      if (generatedText) break;
    } catch (err) {
      lastError = err;
      if (i === candidateModels.length - 1) {
        showState("error");
        errorTitle.textContent = "AI Generation Failed";
        errorMessage.textContent = err.message || "Failed to generate cover letter.";
        return;
      }
    }
  }

  if (generatedText) {
    displayLetter(generatedText);
  } else {
    showState("error");
    errorTitle.textContent = "AI Generation Failed";
    errorMessage.textContent = lastError ? lastError.message : "No content returned by Gemini AI.";
  }
}

async function processPdfFile(file) {
  if (!file || file.type !== "application/pdf") {
    alert("Please select a valid PDF file.");
    return;
  }
  try {
    if (!window.pdfjsLib) {
      alert("PDF library is still loading. Please retry in a few seconds.");
      return;
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let extracted = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map(function (item) { return item.str; });
      extracted += pageStrings.join(" ") + "\n";
    }
    resumeText = extracted.trim();
    const words = countWords(resumeText);
    resumeName.textContent = file.name;
    resumeWords.textContent = words + " words";
    resumeInfo.classList.remove("hidden");
    dropZone.classList.add("hidden");
  } catch (err) {
    alert("Could not extract text from this PDF. Please ensure it has readable text.");
    resetResume();
  }
}

function resetResume() {
  resumeText = "";
  resumeFile.value = "";
  resumeInfo.classList.add("hidden");
  dropZone.classList.remove("hidden");
}

dropZone.addEventListener("click", function () {
  resumeFile.click();
});
dropZone.addEventListener("dragover", function (e) {
  e.preventDefault();
  dropZone.style.borderColor = "#3b82f6";
});
dropZone.addEventListener("dragleave", function () {
  dropZone.style.borderColor = "#334155";
});
dropZone.addEventListener("drop", function (e) {
  e.preventDefault();
  dropZone.style.borderColor = "#334155";
  const file = e.dataTransfer.files[0];
  if (file && file.type === "application/pdf") {
    processPdfFile(file);
  } else {
    alert("Please drop a valid PDF file.");
  }
});
resumeFile.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) processPdfFile(file);
});
removeResumeBtn.addEventListener("click", resetResume);

letterForm.addEventListener("submit", handleAiGeneration);
templateBtn.addEventListener("click", handleQuickTemplate);
fallbackBtn.addEventListener("click", handleQuickTemplate);

sampleBtn.addEventListener("click", function () {
  nameInput.value = "Harsh Vardhan";
  companyInput.value = "Prodesk IT";
  roleInput.value = "Junior Full Stack Developer";
  skillsInput.value = "HTML, CSS, JavaScript, REST APIs, Git";
  jdInput.value = "Looking for a proactive developer to build responsive web apps and integrate APIs in fast-paced sprint cycles.";
});

letterForm.addEventListener("reset", function () {
  resetResume();
  currentLetterText = "";
  showState("empty");
  copyBtn.disabled = true;
  downloadBtn.disabled = true;
  wordCount.textContent = "0 words";
});

copyBtn.addEventListener("click", async function () {
  if (!currentLetterText) return;
  try {
    await navigator.clipboard.writeText(currentLetterText);
    copyBtn.textContent = "Copied!";
    setTimeout(function () {
      copyBtn.textContent = "Copy";
    }, 2000);
  } catch (err) {
    const ta = document.createElement("textarea");
    ta.value = currentLetterText;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    copyBtn.textContent = "Copied!";
    setTimeout(function () {
      copyBtn.textContent = "Copy";
    }, 2000);
  }
});

downloadBtn.addEventListener("click", function () {
  if (!currentLetterText) return;
  const fileName = (nameInput.value.trim().replace(/\s+/g, "_") || "Cover_Letter") + "_Cover_Letter.txt";
  const blob = new Blob([currentLetterText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
