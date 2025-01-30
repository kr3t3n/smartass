# 🧠 SmartAss X Post Generator

Generate pretentious, smart-sounding posts for X (formerly Twitter) using AI. Each generation creates three variations of your input in different writing styles, from Tech Visionary to Philosophy Nerd.

## ✨ Features

- 🎭 8 Different writing styles:
  - Tech Visionary (futuristic predictions, tech buzzwords)
  - Wellness Guru (mindful, spiritual wisdom)
  - Business Maverick (strategic, leadership-focused)
  - Cultural Critic (analytical, social commentary)
  - Life Coach (motivational, action-oriented)
  - Philosophy Nerd (deep thoughts, existential questions)
  - Trend Setter (cutting-edge, pop culture)
  - Satirist (ironic, clever wordplay)

- 🎲 Random style selection for each generation
- 🔄 Three unique variations per prompt
- 📝 Optional "written by SmartAss" signature
- 🚀 One-click posting to X
- ⚡ Powered by Groq's Mixtral-8x7b model
- 🎨 Beautiful, responsive UI with glass-morphism design

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **AI**: Groq API (Mixtral-8x7b model)
- **Database**: Supabase
- **Styling**: Custom CSS with glass-morphism effects
- **Animation**: Custom transitions and loading states

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/kr3t3n/smartass.git
   cd smartass
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:
   ```env
   GROQ_API_KEY=your_groq_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔒 Rate Limiting

To prevent abuse, the app implements rate limiting:
- 3 generations per IP address per hour
- Accurate countdown timer until rate limit reset
- Persistent tracking using Supabase

## 🎯 Usage Guidelines

1. Enter your topic or idea in the input field
2. Click "Blow My Mind" or press Enter
3. Wait for the AI to generate three variations
4. Toggle the signature option if desired
5. Click "Post to X" on any variation you like
6. The post will open in X with your selected text

## 🤖 AI Implementation

The app uses Groq's Mixtral-8x7b model with:
- Temperature: 0.9 (high creativity)
- Top P: 0.9 (diverse outputs)
- Frequency/Presence Penalty: 0.7 (reduce repetition)
- Parallel processing for multiple variations
- Style-specific prompt engineering

## 🔐 Privacy & Data

- Only stores: prompts, generated posts, IP addresses, and timestamps
- No personal data collection
- No tracking of social media activity
- Data used only for rate limiting and quality improvement
- See [Legal Stuff](/legal) for full details

## 👨‍💻 Author

Created by [Georgi](https://x.com/georgipep) from Mangia Studios Limited.

## ❤️ Support

If you find SmartAss funny/useful/whatever, consider [buying me a coffee ☕](https://www.buymeacoffee.com/georgipep) 