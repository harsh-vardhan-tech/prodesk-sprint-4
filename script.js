const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || "";

const mainForm = document.getElementById("mainForm");
  const nameInput = document.getElementById("nameInput");
const companyInput = document.getElementById("companyInput");
  const roleInput = document.getElementById("roleInput");
const skillsInput = document.getElementById("skillsInput");
  const jdInput = document.getElementById("jdInput");

const pdfFileInput = document.getElementById("pdfFileInput");
  const dropArea = document.getElementById("dropArea");
const pdfInfo = document.getElementById("pdfInfo");
  const pdfName = document.getElementById("pdfName");
const pdfWords = document.getElementById("pdfWords");
  const removePdfBtn = document.getElementById("removePdfBtn");

const aiBtn = document.getElementById("aiBtn");
  const simBtn = document.getElementById("simBtn");
const resetBtn = document.getElementById("resetBtn");
  const sampleBtn = document.getElementById("sampleBtn");
const fallbackBtn = document.getElementById("fallbackBtn");

const emptyBox = document.getElementById("emptyBox");
  const loadBox = document.getElementById("loadBox");
const errBox = document.getElementById("errBox");
  const errTitle = document.getElementById("errTitle");
const errMsg = document.getElementById("errMsg");
  const outputBox = document.getElementById("outputBox");
const letterOut = document.getElementById("letterOut");
  const wordCount = document.getElementById("wordCount");
const copyBtn = document.getElementById("copyBtn");
  const copyText = document.getElementById("copyText");
const dlBtn = document.getElementById("dlBtn");

let resumeText = "";
let currentLetter = "";

function countWords(str) {
   if (!str || str.trim() === "") return 0;
   return str.trim().split(/\s+/).length;
}

function showState(state) {
   emptyBox.classList.add("hidden");
   loadBox.classList.add("hidden");
   errBox.classList.add("hidden");
   outputBox.classList.add("hidden");

   if (state === "empty") emptyBox.classList.remove("hidden");
   if (state === "loading") loadBox.classList.remove("hidden");
   if (state === "error") errBox.classList.remove("hidden");
   if (state === "output") outputBox.classList.remove("hidden");
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

function checkRequired(data) {
   if (!data.name || !data.company || !data.role || !data.skills) {
      alert("Fill all required fields: Name, Target Company, Role and Skills");
      return false;
   }
   return true;
}

function makeTemplate(data) {
   const today = new Date();
   const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
   const dateStr = today.getDate() + " " + months[today.getMonth()] + " " + today.getFullYear();

   let letter = dateStr + "\n\n";
   letter += "Hiring Team\n" + data.company + "\n\n";
   letter += "Subject: Application for " + data.role + "\n\n";
   letter += "Dear Hiring Manager,\n\n";
   letter += "I am writing to express my strong interest in the " + data.role + " position at " + data.company + ". ";
   letter += "With practical skills in " + data.skills + ", I am confident in my ability to quickly contribute to your engineering goals.\n\n";

   if (data.jd) {
      letter += "After reviewing your job description, I noticed your focus on " + data.jd.slice(0, 180) + "... ";
      letter += "My hands-on experience in " + data.skills + " directly aligns with these requirements.\n\n";
   }

   if (resumeText) {
      const cleanSnippet = resumeText.slice(0, 300).replace(/\s+/g, " ");
      letter += "As highlighted in my background (" + cleanSnippet + "...), I have practical project experience delivering clean code and working in fast-paced sprint cycles.\n\n";
   }

   letter += "I would welcome the opportunity to discuss how my skill set can benefit " + data.company + ". Thank you for your time and consideration.\n\n";
   letter += "Sincerely,\n" + data.name;

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
   currentLetter = text;
   letterOut.innerHTML = parseMarkdown(text);
   showState("output");
   wordCount.textContent = countWords(text) + " words";
   copyBtn.disabled = false;
   dlBtn.disabled = false;
}

function doSimulation() {
   const data = getFormData();
   if (!checkRequired(data)) return;
   displayLetter(makeTemplate(data));
}

async function doAiGeneration(e) {
   if (e) e.preventDefault();

   const data = getFormData();
   if (!checkRequired(data)) return;

   if (!GEMINI_API_KEY) {
      showState("error");
      errTitle.textContent = "API Key Missing";
      errMsg.textContent = "Add your VITE_GEMINI_API_KEY in the .env file, or use Quick Template instead.";
      return;
   }

   showState("loading");

   let prompt = "You are a professional hiring consultant and cover letter writer.\n";
   prompt += "Write a high-impact, professional cover letter with these candidate details:\n";
   prompt += "- Candidate Name: " + data.name + "\n";
   prompt += "- Target Company: " + data.company + "\n";
   prompt += "- Job Role: " + data.role + "\n";
   prompt += "- Key Skills: " + data.skills + "\n";
   if (data.jd) {
      prompt += "- Target Job Description: " + data.jd + "\n";
   }
   if (resumeText) {
      prompt += "- Resume Content Summary: " + resumeText.slice(0, 1500) + "\n";
   }
   prompt += "\nFormat guidelines:\n";
   prompt += "- Use clean markdown paragraphs separated by blank lines.\n";
   prompt += "- Make it concise, confident, and role-specific (approx 200-300 words).\n";
   prompt += "- Do NOT include bracketed placeholders like [Your Address] or [Phone Number].";

   try {
      const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

      const response = await fetch(endpoint, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": GEMINI_API_KEY
         },
         body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
         })
      });

      if (!response.ok) {
         const errJson = await response.json().catch(function () { return {}; });
         let msg = errJson.error && errJson.error.message ? errJson.error.message : "HTTP " + response.status;
         if (msg.includes("suspended")) {
            msg = "Your Google Cloud project is suspended. Please click 'Create API key in new project' in Google AI Studio or use Quick Template.";
         }
         throw new Error(msg);
      }

      const result = await response.json();
      const candidate = result.candidates && result.candidates[0];
      const generatedText = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text;

      if (!generatedText) {
         throw new Error("No response text returned by Gemini AI");
      }

      displayLetter(generatedText);
   } catch (err) {
      showState("error");
      errTitle.textContent = "AI Generation Failed";
      errMsg.textContent = err.message || "Failed to generate cover letter.";
   }
}

async function handlePdfFile(file) {
   if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file");
      return;
   }

   try {
      if (!window.pdfjsLib) {
         alert("PDF reader library is still loading, please retry in a moment");
         return;
      }

      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
         const page = await pdf.getPage(i);
         const textContent = await page.getTextContent();
         const pageStrings = textContent.items.map(function (item) { return item.str; });
         fullText += pageStrings.join(" ") + "\n";
      }

      resumeText = fullText.trim();
      const words = countWords(resumeText);

      pdfName.textContent = file.name;
      pdfWords.textContent = words + " words extracted";
      pdfInfo.classList.remove("hidden");
      dropArea.classList.add("hidden");
   } catch (e) {
      alert("Could not extract text from this PDF. Make sure it contains readable text.");
      resetPdf();
   }
}

function resetPdf() {
   resumeText = "";
   pdfFileInput.value = "";
   pdfInfo.classList.add("hidden");
   dropArea.classList.remove("hidden");
}

dropArea.addEventListener("click", function () {
   pdfFileInput.click();
});

dropArea.addEventListener("dragover", function (e) {
   e.preventDefault();
   dropArea.style.borderColor = "#0079ff";
});

dropArea.addEventListener("dragleave", function () {
   dropArea.style.borderColor = "#2e3d64";
});

dropArea.addEventListener("drop", function (e) {
   e.preventDefault();
   dropArea.style.borderColor = "#2e3d64";
   const f = e.dataTransfer.files[0];
   if (f && f.type === "application/pdf") {
      handlePdfFile(f);
   } else {
      alert("Please upload a valid PDF file");
   }
});

pdfFileInput.addEventListener("change", function (e) {
   const f = e.target.files[0];
   if (f) handlePdfFile(f);
});

removePdfBtn.addEventListener("click", resetPdf);

mainForm.addEventListener("submit", doAiGeneration);

simBtn.addEventListener("click", doSimulation);

fallbackBtn.addEventListener("click", function () {
   doSimulation();
});

sampleBtn.addEventListener("click", function () {
   nameInput.value = "Harsh Vardhan";
   companyInput.value = "Prodesk IT";
   roleInput.value = "Junior Full Stack Developer";
   skillsInput.value = "HTML, CSS, JavaScript, REST APIs, Git";
   jdInput.value = "Looking for a developer to build responsive web apps and integrate APIs in fast paced sprint cycles";
});

mainForm.addEventListener("reset", function () {
   resetPdf();
   currentLetter = "";
   showState("empty");
   copyBtn.disabled = true;
   dlBtn.disabled = true;
   wordCount.textContent = "0 words";
});

copyBtn.addEventListener("click", async function () {
   if (!currentLetter) return;
   try {
      await navigator.clipboard.writeText(currentLetter);
      copyBtn.classList.add("copied");
      copyText.textContent = "Copied!";
      setTimeout(function () {
         copyBtn.classList.remove("copied");
         copyText.textContent = "Copy";
      }, 2000);
   } catch (err) {
      const ta = document.createElement("textarea");
      ta.value = currentLetter;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      copyBtn.classList.add("copied");
      copyText.textContent = "Copied!";
      setTimeout(function () {
         copyBtn.classList.remove("copied");
         copyText.textContent = "Copy";
      }, 2000);
   }
});

dlBtn.addEventListener("click", function () {
   if (!currentLetter) return;
   const fileName = nameInput.value.trim().replace(/\s+/g, "_") || "Cover_Letter";
   const blob = new Blob([currentLetter], { type: "text/plain" });
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url;
   a.download = fileName + "_Cover_Letter.txt";
   document.body.appendChild(a);
   a.click();
   document.body.removeChild(a);
   URL.revokeObjectURL(url);
});
