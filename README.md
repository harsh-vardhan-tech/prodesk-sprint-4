# AI Cover Letter Generator SaaS Utility

this is my sprint 4 project for prodesk IT internship called AI Cover Letter Generator i built it using html css vanilla javascript vite pdf js library and google gemini api for dynamic llm generation


## what this project does

its a saas web utility where a job seeker can enter candidate name target company job role key skills job description and optionally upload their resume in pdf format the app extracts text from the pdf directly in the browser and sends all parameters to the google gemini api using prompt engineering to generate a personalized and professional cover letter it also includes an instant template simulation mode for offline or quick generation and copy to clipboard and download buttons


## what i used

html for structuring the form dropzone preview area and layout
css for responsive two column saas layout dark tech theme and paper styling
vanilla javascript with async await and fetch for api integration and state handling
vite for development environment and secure environment variable handling
pdf js library for extracting text from uploaded pdf resumes on client side
google gemini 1.5 flash api for generating customized cover letters
dot env file and dot gitignore for keeping api keys completely private and secure


## features i added

### phase 1 base mvp and data simulation
clean input form capturing candidate name target company job role and key skills
state logic capturing form input payload on change or submit
data simulation controller function interpolating state variables into a structured cover letter template string
dedicated preview paper card component displaying the generated letter
functional copy to clipboard button with animated copied confirmation feedback

### phase 2 llm integration and security
connected logic layer to google gemini api free tier using modern fetch and async await
prompt engineering programmatically injecting candidate parameters and role into the system prompt
security architecture using dot env and vite import meta env with dot env strictly ignored in dot gitignore so api keys are never committed to github
dedicated generating loading spinner state handling the 2 to 5 second latency during ai generation
error state handling with friendly message and quick template fallback button

### phase 3 saas level capabilities
upload resume drag and drop dropzone with browse file input for pdf resumes
client side text extraction using pdf js reading arraybuffer and page text strings
dynamic personalization appending parsed resume background into the gemini prompt payload
markdown parser converting returned ai response into clean html paragraphs headings and bullet points instead of a single raw text block

### bonus ux features
load sample button to quickly fill realistic job application data for testing
download text button to export generated cover letter as txt file
live word count counter updating dynamically
reset button to clear form and preview state


## project files

index html has the form dropzone preview window and header
src style css has the dark saas styling responsive grid and animations
src main js has the controller functions pdf extraction gemini fetch call and dom logic
dot env example shows the template for setting the gemini api key
dot gitignore ensures dot env is never pushed to github
Prompts md has all the prompts i used during development
README md is this documentation file


## how to run

1 clone repository and navigate to folder
2 run npm install to install dependencies
3 create dot env file in the root folder and add your gemini api key
VITE_GEMINI_API_KEY=your_key_here
4 run npm run dev to start the local development server
5 open the localhost url in your browser
6 you can also test without an api key by clicking quick template simulate
