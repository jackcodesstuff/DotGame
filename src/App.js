// Filename: src/App.js
import { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';

// Import screen components
import MainMenu from './MainMenu';
import LevelSelectScreen from './LevelSelectScreen';
import OptionsScreen from './OptionsScreen';
import { GameScene } from './GameScene'; // Import GameScene from its own file

// Import CSS
import './App.css'; // Global styles for the app

/**
 * Game Data (Levels)
 * Defines the structure and dots for each level in the game.
 * Each level has a unique ID, a name, and an array of dot objects.
 */
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
        camera: [0.59, 0.44, 0.79],
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
        camera: [0.47, 0.32, 0.78],
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
        camera: [0.59, 0.44, 0.79],
    },
    {
        id: '4',
        name: 'The Bridge',
        dots: [
            // Left Side Dots
            { id: 'l_blue_top', position: [-0.4, 0.2, 0.1], color: 'blue' },
            { id: 'l_blue_bottom', position: [-0.4, -0.2, 0.1], color: 'blue' },
            { id: 'l_red_middle', position: [-0.4, 0, -0.1], color: 'red' },

            // Right Side Dots (mirrored across X-axis, slightly different Z)
            { id: 'r_blue_top', position: [0.4, 0.2, -0.1], color: 'blue' },
            { id: 'r_blue_bottom', position: [0.4, -0.2, -0.1], color: 'blue' },
            { id: 'r_red_middle', position: [0.4, 0, 0.1], color: 'red' },

            // Central Green dots (no pair in this level, for future complexity/distraction)
            { id: 'center_green1', position: [0, 0.1, 0.2], color: 'green' },
            { id: 'center_green2', position: [0, -0.1, -0.2], color: 'green' },
        ],
        // Camera for this level:
        camera: [0.59, 0.44, 0.79]
    },
    {
        id: '5',
        name: 'The X-Shape',
        dots: [
            { id: 'x1_blue', position: [-0.4, 0.2, 0], color: 'blue' },
            { id: 'x2_blue', position: [0.4, -0.2, 0], color: 'blue' },
            { id: 'x3_red', position: [0.4, 0.2, 0], color: 'red' },
            { id: 'x4_red', position: [-0.4, -0.2, 0], color: 'red' },
            { id: 'x5_green', position: [0, 0.4, 0.1], color: 'green' }, // Higher, slightly forward
            { id: 'x6_green', position: [0, -0.4, -0.1], color: 'green' }, // Lower, slightly backward
        ],
        camera: [0.59, 0.44, 0.79],
    },
    {
        id: '6',
        name: 'Layered Cube Corners',
        dots: [
            // Bottom Layer (Blue)
            { id: 'bc_1', position: [-0.3, -0.3, -0.3], color: 'blue' },
            { id: 'bc_2', position: [0.3, -0.3, -0.3], color: 'blue' },
            { id: 'bc_3', position: [-0.3, -0.3, 0.3], color: 'blue' },
            { id: 'bc_4', position: [0.3, -0.3, 0.3], color: 'blue' },
            // Top Layer (Red)
            { id: 'tc_1', position: [-0.3, 0.3, -0.3], color: 'red' },
            { id: 'tc_2', position: [0.3, 0.3, -0.3], color: 'red' },
            { id: 'tc_3', position: [-0.3, 0.3, 0.3], color: 'red' },
            { id: 'tc_4', position: [0.3, 0.3, 0.3], color: 'red' },
        ],
        camera: [0.59, 0.44, 0.79],
    },
    {
        id: '7',
        name: 'Spiral Twist',
        dots: [
            // Layer 1 (bottom)
            { id: 's_1_green', position: [0.4, -0.3, 0], color: 'green' },
            { id: 's_2_blue', position: [0, -0.3, 0.4], color: 'blue' },
            { id: 's_3_red', position: [-0.4, -0.3, 0], color: 'red' },
            { id: 's_4_yellow', position: [0, -0.3, -0.4], color: 'yellow' },

            // Layer 2 (middle - slightly rotated and elevated)
            { id: 's_5_green', position: [0.3, 0, -0.3], color: 'green' },
            { id: 's_6_blue', position: [-0.3, 0, -0.3], color: 'blue' },
            { id: 's_7_red', position: [-0.3, 0, 0.3], color: 'red' },
            { id: 's_8_yellow', position: [0.3, 0, 0.3], color: 'yellow' },

            // Layer 3 (top - slightly more rotated and elevated)
            { id: 's_9_green', position: [0, 0.3, 0.4], color: 'green' },
            { id: 's_10_blue', position: [0.4, 0.3, 0], color: 'blue' },
            { id: 's_11_red', position: [0, 0.3, -0.4], color: 'red' },
            { id: 's_12_yellow', position: [-0.4, 0.3, 0], color: 'yellow' },
        ],
        camera: [0.59, 0.44, 0.79],
    },
    {
        id: '8',
        name: 'Floating Pyramid',
        dots: [
            // Base square (bottom)
            { id: 'p_base1', position: [-0.4, -0.2, -0.4], color: 'orange' },
            { id: 'p_base2', position: [0.4, -0.2, -0.4], color: 'orange' },
            { id: 'p_base3', position: [0.4, -0.2, 0.4], color: 'orange' },
            { id: 'p_base4', position: [-0.4, -0.2, 0.4], color: 'orange' },
            // Floating corners (top)
            { id: 'p_top1', position: [-0.2, 0.2, -0.2], color: 'purple' },
            { id: 'p_top2', position: [0.2, 0.2, -0.2], color: 'purple' },
            { id: 'p_top3', position: [0.2, 0.2, 0.2], color: 'purple' },
            { id: 'p_top4', position: [-0.2, 0.2, 0.2], color: 'purple' },
            // Inner 'Core' (center)
            { id: 'p_core_pink', position: [0, 0, 0], color: 'pink' },
        ],
        camera: [0.59, 0.44, 0.79],
    },
    {
        id: '9',
        name: 'The Octahedron',
        dots: [
            // Apexes (2)
            { id: 'apex_top', position: [0, 0.5, 0], color: 'white' },
            { id: 'apex_bottom', position: [0, -0.5, 0], color: 'white' },
            // Equator (4 dots forming a square)
            { id: 'eq_front', position: [0, 0, 0.5], color: 'cyan' },
            { id: 'eq_right', position: [0.5, 0, 0], color: 'cyan' },
            { id: 'eq_back', position: [0, 0, -0.5], color: 'cyan' },
            { id: 'eq_left', position: [-0.5, 0, 0], color: 'cyan' },
        ],
        camera: [0.59, 0.44, 0.79],
    },
];

/**
 * MessageBox Component
 * A simple, customizable modal to display messages instead of alert().
 * @param {object} props - Component props.
 * @param {string} props.message - The message to display.
 * @param {function} props.onClose - Callback function when the message box is closed.
 */
function MessageBox({ message, onClose }) {
    if (!message) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <p className="text-xl font-semibold mb-4 text-gray-800">{message}</p>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
                >
                    OK
                </button>
            </div>
        </div>
    );
}

/**
 * App Component
 * The main application component that manages the game's overall flow and screen transitions.
 */
export default function App() {
    const [currentScreen, setCurrentScreen] = useState('main');
    const [selectedLevelId, setSelectedLevelId] = useState(null);
    const [unlockedLevels, setUnlockedLevels] = useState(['1', '2', '3']);
    const [message, setMessage] = useState('');
    const [isMessageVisible, setIsMessageVisible] = useState(false);

    const currentLevelData = selectedLevelId ? levels.find(l => l.id === selectedLevelId) : null;
    
    /**
     * Handles closing the message box.
     */
    const handleCloseMessage = useCallback(() => {
        setIsMessageVisible(false);
        setMessage('');
        // After closing the message, transition to level select
        setCurrentScreen('levelSelect');
    }, []);

    /**
     * Handles the click event for the "Play" button in the main menu.
     * Transitions the screen to 'levelSelect'.
     */
    const handlePlayClick = useCallback(() => {
        setCurrentScreen('levelSelect');
    }, []);

    /**
     * Handles the click event for the "Options" button in the main menu.
     * Transitions the screen to 'options'.
     */
    const handleOptionsClick = useCallback(() => {
        setCurrentScreen('options');
    }, []);

    /**
     * Handles the click event for the "Back to Main Menu" button on sub-screens.
     * Transitions the screen back to 'main'.
     */
    const handleBackToMainClick = useCallback(() => {
        setCurrentScreen('main');
    }, []);

    /**
     * Handles the selection of a level from the level select screen.
     * Sets the selected level and transitions the screen to 'inLevel'.
     * @param {string} levelId - The ID of the selected level.
     */
    const handleSelectLevel = useCallback((levelId) => {
        setSelectedLevelId(levelId);
        setCurrentScreen('inLevel');
    }, []);

    /**
     * Callback function invoked by GameScene when a level is completed.
     * Handles unlocking the next level and transitioning back to the level select screen.
     * @param {string} completedLevelId - The ID of the completed level.
     */
    const handleLevelComplete = useCallback((completedLevelId) => {
        console.log(`Level ${completedLevelId} completed!`);
        const nextLevelIndex = levels.findIndex(l => l.id === completedLevelId) + 1;
        let newMessage = '';

        if (nextLevelIndex < levels.length) {
            const nextLevelId = levels[nextLevelIndex].id;
            if (!unlockedLevels.includes(nextLevelId)) {
                setUnlockedLevels(prev => [...prev, nextLevelId]);
                newMessage = `Level ${completedLevelId} completed! Level ${nextLevelId} unlocked!`;
            } else {
                newMessage = `Level ${completedLevelId} completed!`;
            }
        } else {
            newMessage = "Congratulations! All levels completed!";
        }
        setMessage(newMessage);
        setIsMessageVisible(true);
        // Note: The screen transition to 'levelSelect' now happens after the message box is closed.
    }, [unlockedLevels]);

    return (
        <div className="app-container">
            {/* UI Overlay for menus */}
            <div className="ui-overlay" style={{
                display: currentScreen === 'inLevel' ? 'none' : 'flex'
            }}>
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
                     camera={{ fov: 75 }}
                    className="game-canvas"
                >
                    <GameScene
                        dotsData={currentLevelData.dots}
                        onLevelComplete={() => handleLevelComplete(selectedLevelId)}
                        level={currentLevelData}
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
            {/* Custom Message Box */}
            <MessageBox message={isMessageVisible ? message : ''} onClose={handleCloseMessage} />
        </div>
    );
}