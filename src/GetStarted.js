import React from 'react';
import { useNavigate } from 'react-router-dom'; // Use useNavigate hook for navigation
import './GetStarted.css'; // We'll add a few styles here

// Data for the example cards - much cleaner than repeating JSX!
const exampleEntries = [
  {
    title: "My First Pottery Class: Mud-Filled Chaos & Creativity",
    aiResponse: "What a beautiful mess! You made memories even prettier than the pottery.",
    icon: "🌷",
    gradient: 'linear-gradient(to bottom right, #fbcfe8, #f5d0fe)'
  },
  {
    title: "Waiting for a Call That Never Came",
    aiResponse: "Sometimes silence says more. You still deserve kindness and connection.",
    icon: "🌵",
    gradient: 'linear-gradient(to bottom right, #20B2AA, #9ACD32, #66CDAA)'
  },
  {
    title: "The Day the Sun Felt Heavy but Still Shone",
    aiResponse: "Even heavy days have their own light. You are that light too.",
    icon: "🌞",
    gradient: 'linear-gradient(to bottom right, #F0E68C, #FFFACD, #FFFF00)'
  },
  {
    title: "When the Rain Did Not Stop but Neither Did I",
    aiResponse: "That’s strength right there — dancing through the downpour. Proud of you.",
    icon: "🌈",
    gradient: 'linear-gradient(to bottom right, #87CEFA, #ADD8E6, #6495ED)'
  },
  {
    title: "Warm Soup, Cold Rain, Happy Heart",
    aiResponse: "Isn’t it magical how little comforts warm the soul? You deserve many more.",
    icon: "🥣",
    gradient: 'linear-gradient(to bottom right, #FFD700, #FFA500, #DC143C)'
  },
  {
    title: "Avoiding the Mirror, Avoiding Myself",
    aiResponse: "You’re more beautiful than you feel right now. Be gentle with yourself.",
    icon: "🧡",
    gradient: 'linear-gradient(to bottom right, #FFA07A, #E9967A, #FF7F50)'
  },
  {
    title: "Danced in My Kitchen to Old Songs: The Perfect Sunday Bliss",
    aiResponse: "That joy is contagious — never stop finding little reasons to dance.",
    icon: "🎶",
    gradient: 'linear-gradient(to bottom right, #7B68EE, #DDA0DD, #DA70D6)'
  }
];

const GetStarted = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 font-sans overflow-hidden" style={{ backgroundImage: 'linear-gradient(#ffb7c3, #c5d2c2, #b4ebca, #fa92ac)' }}>
      {/* --- Main Title Section --- */}
      <div className="text-center max-w-2xl mx-auto z-10 mb-12 animate-fade-in-down">
        <h1 className="text-5xl md:text-6xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#556B2F', textShadow: '0 0 10px rgba(255, 105, 180, 0.5)' }}>
          Write your mind, <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#C71585', textShadow: '0 0 10px #9ACD32' }}>pour your heart</span>
        </h1>
        <h2 className="text-4xl mb-2 font-extrabold" style={{ fontFamily: "'Kranky',serif", marginTop: '20px', color: '#800000', textShadow: '0 0 10px #808000' }}>
          Because SafeSpace is all yours
        </h2>
        <p className="text-3xl text-gray-500 mb-8 font-extrabold" style={{ fontFamily: "'Winky Rough', sans-serif", marginTop: '20px', color: '#556B2F' }}>
          Crafted just for you with only one goal: <span style={{ fontFamily: "'Ubuntu', sans-serif", color: '#C71585', textShadow: '0 0 10px pink' }}>You are important and you will be heard.</span>
        </p>
        <button
          onClick={() => navigate('/signin')}
          className="get-started-btn" // Replaced inline styles with a class
        >
          Get Started
        </button>
      </div>

      {/* --- Horizontal Scrolling Showcase --- */}
      <div className="showcase-container animate-fade-in-up">
        {exampleEntries.map((entry, index) => (
          // This is the card for each entry. It's now inside the scrolling container.
          <div key={index} className="journal-card">
            <div className="journal-entry-content">
              {/* User's entry title */}
              <p className="font-extrabold text-gray-800 text-lg">
                {entry.title}
              </p>
            </div>
            
            {/* SereneAI response is now correctly positioned BELOW the title */}
            <div
              className="serene-ai-response"
              style={{ background: entry.gradient }}
            >
              <strong>{entry.icon} SereneAI</strong><br />
              <i>{entry.aiResponse}</i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GetStarted;
