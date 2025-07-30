// Filename: src/LevelSelectScreen.js
function LevelSelectScreen({ levels, unlockedLevels, onSelectLevel, onBackClick }) {
    return (
        <div className="level-select-screen">
            <h1 className="level-select-title">Select Level</h1>
            <div className="level-grid">
                {levels.map(level => {
                    const isUnlocked = unlockedLevels.includes(level.id);
                    return (
                        <button
                            key={level.id}
                            className={isUnlocked ? "level-button" : "level-button-locked"}
                            onClick={() => isUnlocked && onSelectLevel(level.id)}
                            disabled={!isUnlocked}
                        >
                            {level.name}
                            {!isUnlocked && <span className="locked-text"> (Locked)</span>}
                        </button>
                    );
                })}
            </div>
            <button className="level-select-back-button" onClick={onBackClick}>Back to Main Menu</button>
        </div>
    );
}

export default LevelSelectScreen;