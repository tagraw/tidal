import React, { useState, useEffect } from 'react';
import WorkScreen from './WorkScreen';
import AlertScreen from './AlertScreen';
import MemeScreen from './MemeScreen';
import StatsScreen from './StatsScreen';
// Import Tailwind styles if needed (or include them in index.css)
// import './index.css'; 

// Define the available screens as constants
const SCREENS = {
    WORK: 'work',
    ALERT: 'alert',
    MEME: 'meme',
    STATS: 'stats'
};

const App = () => {
    // 1. Core State Management
    const [currentScreen, setCurrentScreen] = useState(SCREENS.WORK);
    const [insult, setInsult] = useState("");
    const [distractionCount, setDistractionCount] = useState(0);

    // Function to navigate between screens
    const navigate = (screen, data = {}) => {
        if (screen === SCREENS.ALERT) {
            setDistractionCount(prev => prev + 1);
            setInsult(data.insult || "You were caught!");
        }
        setCurrentScreen(screen);
    };

    // Helper to conditionally render the current screen
    const renderScreen = () => {
        switch (currentScreen) {
            case SCREENS.WORK:
                // Pass the trigger function and the navigate function to the monitor component
                return <WorkScreen navigate={navigate} setInsult={setInsult} />;

            case SCREENS.ALERT:
                // AlertScreen uses the insult state and provides the "Get Back to Work" button
                return <AlertScreen 
                            insult={insult} 
                            navigate={navigate} 
                            memeData={{ text: "Generated Meme Text" }}
                        />;
            
            case SCREENS.MEME:
                return <MemeScreen navigate={navigate} memeData={{ text: "The Meme" }} />; // Placeholder props

            case SCREENS.STATS:
                return <StatsScreen navigate={navigate} count={distractionCount} />;

            default:
                return <WorkScreen navigate={navigate} setInsult={setInsult} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Simple Navigation Bar (Good for quick demo access) */}
            <nav className="p-4 bg-white shadow flex justify-center space-x-4">
                <button 
                    onClick={() => navigate(SCREENS.WORK)} 
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
                >
                    Work Mode
                </button>
                <button 
                    onClick={() => navigate(SCREENS.STATS)} 
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                    View Stats
                </button>
            </nav>

            {/* The primary screen rendering area */}
            <main className="flex-grow p-8 flex justify-center items-center">
                {renderScreen()}
            </main>
        </div>
    );
};

export default App;