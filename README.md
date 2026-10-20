# AI Cover Letter Generator

this is my sprint 4 project for prodesk IT internship called AI Cover Letter Generator i built it using html css vanilla javascript vite pdf js and google gemini api


## what this project does

its a web app where you put your name company job role and skills and it generates a professional cover letter for you it has two modes one is quick template which uses string interpolation to make a cover letter instantly and other is ai mode which sends your details to google gemini api and gets a personalized letter back you can also upload your resume pdf and it extracts text from it and sends to gemini for better personalization


## what i used

html for the form layout and preview card structure
css for dark theme responsive grid and paper styling
vanilla javascript for all the logic fetch calls and dom handling
vite for dev server and secure env variable support
pdf js library for reading pdf files and extracting text in browser
google gemini 1.5 flash api for ai cover letter generation
dot env file for keeping api key safe and hidden from github


## features

form taking candidate name target company job role key skills and optional job description
quick template mode that puts your details into a hardcoded template string
ai generation mode that sends details to gemini api with prompt engineering
loading spinner state while waiting for ai response
error handling when api key is missing or api fails
fallback button to switch to quick template if ai fails
pdf resume upload with drag and drop or file browse
text extraction from pdf using pdf js arraybuffer and page content
resume text gets added to gemini prompt for personalized output
markdown parser that converts ai response to clean html paragraphs not raw text
copy to clipboard button with copied feedback animation
download button to save letter as text file
fill sample button to quickly load test data for demo
word count that updates live
reset button to clear everything


## project files

index html has the form dropzone preview area and layout
style css has dark theme styling responsive grid
script js has all the javascript logic fetch gemini pdf extract dom
dot env has the api key locally and is ignored by git
dot env example shows the template variable name
dot gitignore keeps dot env node modules and dist out of git
Prompts md has the prompts i used
README md is this file


## how to run

1 clone and go to the folder
2 npm install
3 make dot env file and add VITE_GEMINI_API_KEY=your_key
4 npm run dev
5 open localhost in browser
6 you can test without api key using quick template button
