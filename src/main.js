const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

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

var resumeText = "";
var currentLetter = "";

function showState(which) {
   emptyBox.classList.add("hidden");
   loadBox.classList.add("hidden");
   errBox.classList.add("hidden");
   outputBox.classList.add("hidden");

   if (which === "empty") emptyBox.classList.remove("hidden");
   if (which === "loading") loadBox.classList.remove("hidden");
   if (which === "error") errBox.classList.remove("hidden");
   if (which === "output") outputBox.classList.remove("hidden");
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
      alert("Fill all required fields - Name, Company, Role and Skills");
      return false;
   }
   return true;
}

function escapeHtml(str) {
   var d = document.createElement("div");
   d.textContent = str;
   return d.innerHTML;
}

function markdownToHtml(text) {
   var parts = text.split(/\n\s*\n/);
   var html = "";

   for (var i = 0; i < parts.length; i++) {
      var block = parts[i].trim();
      if (!block) continue;

      if (block.startsWith("### ")) {
         html += "<h4>" + escapeHtml(block.substring(4)) + "</h4>";
       continue;
      }
      if (block.startsWith("## ") || block.startsWith("# ")) {
         html += "<h3>" + escapeHtml(block.replace(/^#+\s*/, "")) + "</h3>";
       continue;
      }

      if (block.startsWith("- ") || block.startsWith("* ")) {
         var lines = block.split("\n");
         html += "<ul>";
         for (var j = 0; j < lines.length; j++) {
            var li = lines[j].replace(/^[-*]\s*/, "").trim();
            html += "<li>" + inlineFormat(li) + "</li>";
         }
         html += "</ul>";
       continue;
      }

      var pLines = block.split("\n");
    var pContent = "";
      for (var k = 0; k < pLines.length; k++) {
         if (k > 0) pContent += "<br>";
       pContent += inlineFormat(pLines[k]);
      }
      html += "<p>" + pContent + "</p>";
   }

   return html;
}

function inlineFormat(str) {
   var out = escapeHtml(str);
   out = out.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
   out = out.replace(/\*(.*?)\*/g, "<em>$1</em>");
   return out;
}

function countWords(text) {
   if (!text || !text.trim()) return 0;
   return text.trim().split(/\s+/).length;
}

function makeTemplate(data) {
   var today = new Date();
   var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
   var dateStr = today.getDate() + " " + months[today.getMonth()] + " " + today.getFullYear();

   var letter = dateStr + "\n\n";
   letter += "Hiring Team\n" + data.company + "\n\n";
   letter += "Subject: Application for " + data.role + "\n\n";
   letter += "Dear Hiring Manager at " + data.company + ",\n\n";
   letter += "I am writing to express my interest in the " + data.role + " position at " + data.company + ". ";
   letter += "With skills in " + data.skills + " I am confident I can contribute to your team and help achieve engineering goals.\n\n";

   if (data.jd) {
      letter += "Looking at your job requirements I noticed you need someone who can handle " + data.jd.slice(0, 200) + ". ";
      letter += "My experience with " + data.skills + " aligns well with these requirements.\n\n";
   }

   if (resumeText) {
      var snippet = resumeText.slice(0, 400).replace(/\s+/g, " ");
      letter += "From my background: \"" + snippet + "...\" I have gained practical experience that prepares me for this role.\n\n";
   }

   letter += "I am eager to discuss how my skills can benefit " + data.company + ". Thank you for your time and consideration.\n\n";
   letter += "Sincerely,\n" + data.name;

   return letter;
}

function renderLetter(text) {
   currentLetter = text;
   letterOut.innerHTML = markdownToHtml(text);
   showState("output");
   copyBtn.disabled = false;
   dlBtn.disabled = false;
   wordCount.textContent = countWords(text) + " words";
}

function doSimulation() {
   var data = getFormData();
   if (!checkRequired(data)) return;
   renderLetter(makeTemplate(data));
}

async function doAiGeneration(e) {
   if (e) e.preventDefault();

   var data = getFormData();
   if (!checkRequired(data)) return;

   if (!GEMINI_KEY) {
      showState("error");
    errTitle.textContent = "API Key Not Found";
      errMsg.textContent = "Add VITE_GEMINI_API_KEY in your .env file or use Quick Template instead.";
      return;
   }

   showState("loading");

   var prompt = "You are a professional cover letter writer. Write a cover letter with these details:\n";
   prompt += "Candidate Name: " + data.name + "\n";
   prompt += "Target Company: " + data.company + "\n";
   prompt += "Job Role: " + data.role + "\n";
   prompt += "Skills: " + data.skills + "\n";
   if (data.jd) {
      prompt += "Job Description: " + data.jd + "\n";
   }
   if (resumeText) {
      prompt += "Resume Background: " + resumeText.slice(0, 1500) + "\n";
   }
   prompt += "\nWrite in clean paragraphs separated by blank lines. Use markdown formatting. Make it professional but not too long.";

   try {
      var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_KEY;

      var res = await fetch(url, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
         })
      });

      if (!res.ok) {
         var errData = await res.json().catch(function () { return {}; });
         var msg = errData.error ? errData.error.message : "HTTP " + res.status;
         throw new Error(msg);
      }

      var json = await res.json();
    var aiText = json.candidates[0].content.parts[0].text;

      if (!aiText) {
         throw new Error("Empty response from Gemini");
      }

      renderLetter(aiText);
   } catch (err) {
      showState("error");
    errTitle.textContent = "Generation Failed";
      errMsg.textContent = "Gemini Error: " + err.message;
   }
}

async function extractPdfText(file) {
   try {
      if (!window.pdfjsLib) {
         alert("PDF library still loading try again in a sec");
         return;
      }

      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      var buffer = await file.arrayBuffer();
    var pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

      var allText = "";
      for (var p = 1; p <= pdf.numPages; p++) {
         var page = await pdf.getPage(p);
       var content = await page.getTextContent();
         var strings = content.items.map(function (item) { return item.str; });
         allText += strings.join(" ") + "\n";
      }

      resumeText = allText.trim();
    var wc = countWords(resumeText);

      pdfName.textContent = file.name;
    pdfWords.textContent = wc + " words extracted";
      pdfInfo.classList.remove("hidden");
    dropArea.classList.add("hidden");
   } catch (err) {
      alert("Could not read PDF make sure it has selectable text");
    clearPdf();
   }
}

function clearPdf() {
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
   var f = e.dataTransfer.files[0];
   if (f && f.type === "application/pdf") {
      extractPdfText(f);
   } else {
      alert("Please upload a PDF file");
   }
});

pdfFileInput.addEventListener("change", function (e) {
   var f = e.target.files[0];
   if (f) extractPdfText(f);
});

removePdfBtn.addEventListener("click", clearPdf);

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
   clearPdf();
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
      var ta = document.createElement("textarea");
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
   var fileName = nameInput.value.trim().replace(/\s+/g, "_") || "Cover_Letter";
   var blob = new Blob([currentLetter], { type: "text/plain" });
   var url = URL.createObjectURL(blob);
   var a = document.createElement("a");
   a.href = url;
   a.download = fileName + "_Cover_Letter.txt";
   document.body.appendChild(a);
   a.click();
   document.body.removeChild(a);
   URL.revokeObjectURL(url);
});
