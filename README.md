# FCAI Course Explorer & Academic Advisor

<p align="center">
  <img src="https://img.shields.io/github/stars/zzokm/fcai-course-explorer?style=for-the-badge&color=blue" alt="Stars" />
  <img src="https://img.shields.io/github/forks/zzokm/fcai-course-explorer?style=for-the-badge&color=green" alt="Forks" />
</p>

**Live URL**: [https://majors.yehia.dev](https://majors.yehia.dev)

A comprehensive, beautifully designed platform built for students at the Faculty of Computers and Artificial Intelligence (FCAI). This tool makes navigating complex course prerequisites, exploring different majors, and understanding faculty bylaws significantly easier.

---

## 🌟 Key Features

### 1. Interactive Major Explorer
- **Visual Course Trees**: Clean, modern UI to browse courses required for each major (Computer Science, Artificial Intelligence, Information Systems, etc.).
- **Dynamic Prerequisites**: Click on any course to instantly reveal its entire prerequisite chain, presented in a fluid, easy-to-understand visual map.
- **Smart Highlighting**: Prerequisites recursively map backwards so you understand exactly what you need to take before unlocking advanced courses.

### 2. AI Academic Advisor (BYOK)
- **Built-in Chatbot**: A powerful, RAG-enabled (Retrieval-Augmented Generation) AI assistant embedded directly in the app.
- **Understands the Rules**: The AI is fed context regarding FCAI bylaws, minimum GPA requirements, and course details, allowing it to give tailored, accurate academic advice.
- **Bring Your Own Key (BYOK)**: Connect the advisor securely using your own API keys for providers like OpenAI, Anthropic, Google Gemini, OpenRouter, Groq, DeepSeek, Mistral, Moonshot, Cerebras, or Ollama Cloud!

### 3. State-of-the-art Design
- **Premium Aesthetics**: Built with a sleek glassmorphism design, fluid micro-animations (Framer Motion), and a responsive layout that feels native on both mobile and desktop.
- **Dark/Light Mode**: First-class support for both themes to reduce eye strain during late-night studying.

---

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16.3.4 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Tailored variables for consistent theming)
- **Animations**: Framer Motion
- **Database/Vector Store**: Drizzle ORM + pgvector (for RAG context)
- **Icons**: Phosphor Icons

## 🚀 Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/zzokm/fcai-course-explorer.git
   cd fcai-course-explorer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root directory.
   *(Optional)* If you wish to enable the server-side embedding logic or admin bypass, set your variables:
   ```env
   GOOGLE_API_KEY=your_gemini_key
   ADMIN_PIN=your_secret_pin
   DATABASE_URL=your_postgres_db_url
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

<p align="center">
  <b>Made by Yehia Elzokm</b>
</p>