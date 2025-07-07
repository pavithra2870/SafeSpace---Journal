# SafeSpace: Modern Journaling & Wellness Web App

Welcome to **SafeSpace**, your cozy, modern, and data-driven journaling platform! SafeSpace is designed to help you track your moods, build positive habits, and connect with a supportive community—all in a beautiful, baby-pink themed interface.

---

## 🌸 Features

- **User Authentication**: Secure signup/login with JWT.
- **Personal Dashboard**: Visual stats, streaks, mood/happiness charts, activity heatmap, and calendar.
- **Journaling**: Create, view, and manage daily journal entries.
- **Affirmations Board**: 5x4 editable grid for daily affirmations (CRUD, tips, and guidance).
- **Manifestations**: Track your dreams and goals (CRUD).
- **Community Hub**: Share stories, tips, and connect with fellow journalers.
- **Insights & Analytics**: Mood distribution, writing patterns, AI-powered insights, and more.
- **Fun Elements**: Level badges, streaks, motivational quotes, and tips.
- **Responsive UI**: Beautiful, compact, and modern design with a baby-pink theme.

---

## 🛠️ Tech Stack

- **Frontend**: React, Recharts, React Calendar, Tailwind/CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT
- **LLM/AI**: LangChain, Groq, langchain-groq (for Dr. Luna chat and AI insights)

---

## 🚀 Getting Started

### 1. **Clone the Repository**

```bash
# Clone the repo
https://github.com/yourusername/SafeSpace.git
cd SafeSpace/jornal
```

### 2. **Install Dependencies**

#### Frontend
```bash
cd ../jornal
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 3. **Configure Environment Variables**

- Copy `backend/config.env.example` to `backend/config.env` and fill in your MongoDB URI, JWT secret, and any API keys needed for LLM/AI features.

### 4. **Run the App**

#### Start Backend
```bash
cd backend
npm start
```

#### Start Frontend
```bash
cd .. # Go back to /jornal
npm start
```

- The frontend runs on [http://localhost:3000](http://localhost:3000)
- The backend runs on [http://localhost:5001](http://localhost:5001)

---

## 📝 Usage Guide

1. **Sign Up / Log In**: Create your account or log in to access your dashboard.
2. **Dashboard**: View your stats, streaks, mood/happiness charts, activity heatmap, and calendar.
3. **Journals**: Write, edit, and view your daily entries.
4. **Affirmations**: Fill your 5x4 grid with positive affirmations. Edit, save, or delete as you wish.
5. **Manifestations**: Track your dreams and goals with full CRUD support.
6. **Community**: Share your stories, tips, and connect with others.
7. **Insights**: Explore your mood distribution, writing patterns, and get AI-powered insights.
8. **Dr. Luna Chat**: Get support and insights from the AI-powered Dr. Luna.

---

## 💡 Tips & Best Practices

- **Consistency is key!** Write daily to build your streak and unlock new achievements.
- **Use affirmations and manifestations** to stay positive and focused.
- **Check your insights** regularly to spot trends and improve your well-being.
- **Engage with the community** for support and inspiration.

---

## 🤖 AI & LLM Integration

- The backend integrates with LangChain, Groq, and langchain-groq for AI chat and insights.
- Make sure to provide any required API keys in your `config.env`.

---

## 🛠️ Development & Contribution

- Fork the repo and create a new branch for your feature or bugfix.
- Submit a pull request with a clear description.
- Please follow the existing code style and add comments where helpful.

---

## 📦 Project Structure

```
Journal/
  jornal/
    backend/         # Express/MongoDB backend
      src/
        controllers/
        middleware/
        models/
        routes/
        services/
        utils/
      config.env     # Backend environment variables
      server.js      # Backend entry point
    public/          # Frontend static assets
    src/             # React frontend
      components/
      App.js
      ...
    package.json     # Frontend dependencies
    start-app.js     # (Optional) Custom start script
```

---

## 🧑‍💻 Authors & Credits

- Designed & developed by Pavithra
- Special thanks to all contributors and the open-source community!

---

## 🛡️ License

This project is licensed under the MIT License.
