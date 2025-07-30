// Filename: src/App.js
import { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';

// Import screen components
import MainMenu from './MainMenu';
import LevelSelectScreen from './LevelSelectScreen';
import OptionsScreen from './OptionsScreen'; // New
import { GameScene } from './GameScene'; // Assuming GameScene is in a separate file now

// Import CSS
import './App.css';

// --- Game Data (Levels defined here) ---
const levels = [
    {
        id: '1',
        name: 'Simple Pair',
        dots: [
            { id: 'dot1', position: [-0.3, 0, 0], color: 'blue' },
            { id: 'dot2', position: [0.3, 0, 0], color: 'blue' },
            { id: 'dot3', position: [0, 0.3, 0], color: 'red' },
            { id: 'dot4', position: [0, -0.3, 0], color: 'red' }
        ],
    },
    {
        id: '2',
        name: 'Double Pair',
        dots: [
            { id: 'd2_1', position: [-0.5, 0.2, 0], color: 'blue' },
            { id: 'd2_2', position: [0.5, 0.2, 0], color: 'blue' },
            { id: 'd2_3', position: [-0.5, -0.2, 0], color: 'red' },
            { id: 'd2_4', position: [0.5, -0.2, 0], color: 'red' },
            { id: 'd2_5', position: [0, 0, 0.3], color: 'green' },
            { id: 'd2_6', position: [0, 0, -0.3], color: 'green' }
        ],
    },
    {
        id: '3',
        name: 'Vertical Challenge',
        dots: [
            { id: 'd3_1', position: [-0.2, -0.2, 0], color: 'purple' },
            { id: 'd3_2', position: [-0.2, 0.2, 0], color: 'purple' },
            { id: 'd3_3', position: [0.2, -0.2, 0], color: 'yellow' },
            { id: 'd3_4', position: [0.2, 0.2, 0], color: 'yellow' },
            { id: 'd3_5', position: [0, 0, -0.3], color: 'orange' },
            { id: 'd3_6', position: [0, 0, 0.3], color: 'orange' },
        ],
    },
    { id: '4', name: 'Locked Level', dots: [] } // Example of a locked level
];

// --- Main App Component ---
export default function App() {
    const [currentScreen, setCurrentScreen] = useState('main'); // 'main', 'levelSelect', 'options', 'inLevel'
    const [selectedLevelId, setSelectedLevelId] = useState(null);
    const [unlockedLevels, setUnlockedLevels] = useState(['1', '2', '3']); // Level 1, 2, 3 unlocked initially

    const currentLevelData = selectedLevelId ? levels.find(l => l.id === selectedLevelId) : null;

    // --- Navigation Callbacks ---
    const handlePlayClick = useCallback(() => {
        setCurrentScreen('levelSelect');
    }, []);

    const handleOptionsClick = useCallback(() => {
        setCurrentScreen('options');
    }, []);

    const handleBackToMainClick = useCallback(() => {
        setCurrentScreen('main');
    }, []);

    const handleSelectLevel = useCallback((levelId) => {
        setSelectedLevelId(levelId);
        setCurrentScreen('inLevel');
    }, []);

    const handleLevelComplete = useCallback((completedLevelId) => {
        console.log(`Level ${completedLevelId} completed!`);
        const nextLevelIndex = levels.findIndex(l => l.id === completedLevelId) + 1;
        if (nextLevelIndex < levels.length) {
            const nextLevelId = levels[nextLevelIndex].id;
            if (!unlockedLevels.includes(nextLevelId)) {
                setUnlockedLevels(prev => [...prev, nextLevelId]);
                alert(`Level ${completedLevelId} completed! Level ${nextLevelId} unlocked!`);
            }
        } else {
            alert("Congratulations! All levels completed!");
        }
        setCurrentScreen('levelSelect');
    }, [unlockedLevels]);

    return (
        // Use className instead of style prop
        <div className="app-container">
            {/* UI Overlay for menus */}
            <div className="ui-overlay">
                {currentScreen === 'main' && (
                    <MainMenu
                        onPlayClick={handlePlayClick}
                        onOptionsClick={handleOptionsClick}
                    />
                )}
                {currentScreen === 'levelSelect' && (
                    <LevelSelectScreen
                        levels={levels}
                        unlockedLevels={unlockedLevels}
                        onSelectLevel={handleSelectLevel}
                        onBackClick={handleBackToMainClick}
                    />
                )}
                {currentScreen === 'options' && (
                    <OptionsScreen
                        onBackClick={handleBackToMainClick}
                    />
                )}
                {currentScreen === 'inLevel' && (
                    <h1 className="level-title">Playing Level: {currentLevelData?.name || 'Unknown'}</h1>
                )}
            </div>

            {/* Canvas for the 3D scene (only rendered when in a level) */}
            {currentScreen === 'inLevel' && currentLevelData && (
                <Canvas
                    camera={{ position: [0, 0, 1.5], fov: 75 }}
                    className="game-canvas" // Use className here
                >
                    {/* Background color is now set in CSS for .game-canvas */}
                    {/* <color attach="background" args={['lightgray']} /> */}
                    <GameScene
                        dotsData={currentLevelData.dots}
                        onLevelComplete={() => handleLevelComplete(selectedLevelId)}
                    />
                </Canvas>
            )}

            {/* Basic instructions outside the menus */}
            {currentScreen === 'inLevel' && (
                <div className="instructions">
                    Click two dots of the **SAME** color to connect them. Multiple connections allowed!
                    <button onClick={() => setCurrentScreen('levelSelect')} className="back-to-levels-button">Back to Levels</button>
                </div>
            )}
        </div>
    );
}