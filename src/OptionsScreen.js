// Filename: src/OptionsScreen.js
function OptionsScreen({ onBackClick }) {
    return (
        <div className="options-screen">
            <h1 className="options-title">Options</h1>
            <p className="options-text">Game Volume: [Slider Placeholder]</p>
            <p className="options-text">Graphics Quality: [Low | Medium | High]</p>
            <button className="options-back-button" onClick={onBackClick}>Back to Main Menu</button>
        </div>
    );
}

export default OptionsScreen;