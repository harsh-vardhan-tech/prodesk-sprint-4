# AI Cover Letter Generator

this is my sprint 4 project for prodesk IT internship called AI Cover Letter Generator i built it using html css vanilla javascript vite pdf js and google gemini api


## what this project does

basically its a web app where you put your candidate name target company job role and key skills and it generates a professional cover letter for you it has two modes one is quick template which uses string interpolation to make a cover letter instantly without api and other is ai mode which sends your details to google gemini api and gets a personalized letter back you can also upload your resume pdf and it extracts text from it using pdf js and sends it to gemini for dynamic personalization


## what i used

html for the form layout and preview card structure
css for dark theme styling and responsive layout
vanilla javascript for form handling fetch api and dom manipulation
vite for local dev server
pdf js library for extracting text from uploaded resume pdf
google gemini api for generating cover letter


## features i added

form capturing candidate name target company job role key skills and optional job description
quick template mode that interpolates state variables into hardcoded template string
preview card showing the generated cover letter
copy to clipboard button with copied animation
download button to save generated letter as text file
google gemini api integration using fetch post request
generating loading state with spinner during api wait time
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
Prompts md has the prompts i used during development
README md is this file


## ai help

i used ai to help me understand how to connect google gemini api using fetch how to extract text from pdf using pdf js and how to write markdown parser function the design layout and styling i built myself


## how to run

1 clone the repo and open folder
2 run npm install
3 run npm run dev
4 open localhost in browser
5 you can test using quick template or add api key to test ai mode
