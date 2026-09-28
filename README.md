# PrepWise AI

PrepWise AI is a premium, AI-powered interview preparation web app built with React, Vite, Tailwind CSS, and Framer Motion. It acts as a daily habit-building tool for final-year students and freshers preparing for placements in Software Engineering (SDE), Product Management (PM), and Consulting.

## Core Features
1. **Role-Aware Practice**: Dynamically generated mock interviews tailored to SDE, PM, or Consulting roles (e.g., DSA, System Design, Case Studies, Guesstimates).
2. **Streak Engine**: Encourages daily practice over cramming. Complete a drill or session to maintain your streak and unlock 3D milestone badges.
3. **AI Coach & Micro-Drills**: Analyzes your answers to detect recurring weak areas (e.g., "unstructured answer", "missing metrics") and generates targeted 5-minute drills (like a STAR Method Sprint).
4. **Voice & Text Input**: Supports both text and speech-to-text (via the Web Speech API) for a realistic interview feel.
5. **Bold, Premium UI**: Deep space dark mode, glassmorphism, 3D extruded badges, fluid Framer Motion animations, and custom gradient score dials.

## Technology Stack
- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS + Custom Design Tokens (index.css)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI Integration**: Google Gemini API (`@google/generative-ai`)
- **Persistence**: `localStorage` (easily swappable for a real backend via `src/services/storage.js`)

## Setup & Running Locally

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your Google Gemini API key:
     \`\`\`env
     VITE_GEMINI_API_KEY=your_api_key_here
     \`\`\`
   *(Get your free key from [Google AI Studio](https://aistudio.google.com/))*

3. **Start the Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open in Browser**
   - Navigate to `http://localhost:5173`

## Application Flow

1. **Resume + Target Role**: User selects their role (SDE, PM, Consulting) and optionally pastes their resume context.
2. **Question Generation (LLM)**: Gemini generates 5 role-specific questions tailored to the selected category and difficulty.
3. **Mock Interview (Text/Voice)**: User answers questions with a timer and live recording HUD.
4. **Answer Evaluation (NLP Scoring)**: Gemini evaluates the answer, assigning a score out of 10, identifying strengths/improvements, extracting issue tags, and generating a "better answer" outline.
5. **Feedback & Report Generation**: A summary report aggregates the session performance, updating the skill radar chart.
6. **Performance Dashboard**: AI coach recommends the next practice drill based on accumulated weak area tags.
