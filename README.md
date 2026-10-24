# AI Cover Letter Generator

this is my sprint 4 project for prodesk IT internship called AI Cover Letter Generator i built it using html css vanilla javascript vite pdf js and google gemini api


## Live Website

[Open AI Cover Letter Generator](https://prodesk-sprint-4.vercel.app/)


## what this project does

basically its a web app where you put your candidate name target company job role and key skills and it generates a professional cover letter for you it has two modes one is quick template which uses string interpolation to make a cover letter instantly without api and other is ai mode which sends your details to google gemini api and gets a personalized letter back you can also upload your resume pdf and it extracts text from it using pdf js and sends it to gemini for dynamic personalization


## what i used

html for the form layout and preview card structure
css for dark theme styling and responsive layout
vanilla javascript for form handling fetch api and dom manipulation
vite for local dev server and secure env variable support
pdf js library for extracting text from uploaded resume pdf
google gemini api for generating cover letter
dot env file for keeping api key safe and hidden from github


## features i added

form capturing candidate name target company job role key skills and optional job description
state handling on form submit and quick template click
data simulation controller function interpolating state variables into a hardcoded template string
preview card showing the generated cover letter
copy to clipboard button with copied animation
download button to save generated letter as text file
google gemini api integration using fetch post request
prompt engineering injecting candidate parameters into system prompt payload
environment variable security using dot env and vite so api key never leaks on github
generating loading state with spinner during 2-5 second api wait time
error handling card with fallback button to quick template if api fails
drag and drop resume upload zone with file browse support
pdf text extraction using pdf js in browser
extracted word count badge showing resume words
resume text appended to gemini prompt for personalized cover letter
markdown parser converting ai response into clean html paragraphs instead of single text block
fill sample button to quickly load demo data for testing
word count badge updating live for generated letter
reset button to clear form and preview


## project files

index html has the form upload dropzone and preview card layout
style css has dark theme colors responsive layout and letter paper styling
script js has all the javascript logic fetch call pdf text extraction and dom handling
dot env has the gemini api key locally and is ignored by git
dot env example shows the sample variable name
dot gitignore keeps dot env node modules and dist out of git
Prompts md has the prompts i used during development
README md is this file


## ai help

i used ai to help me understand how to connect google gemini api using fetch how to manage api key securely in dot env with vite how to extract text from pdf using pdf js and how to write markdown parser function the design layout and styling i built myself


## how to run

1 clone the repo and open folder
2 run npm install
3 create dot env file and add VITE_GEMINI_API_KEY=your_key
4 run npm run dev
5 open localhost in browser
6 you can also test without api key by clicking quick template button
