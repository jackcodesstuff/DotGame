// Filename: src/MainMenu.js
// import nothing else needed for styles, as App.css is globally imported in App.js

function MainMenu({ onPlayClick, onOptionsClick }) {
    return (
        <div className="menu-screen">
            <h1 className="menu-title">Dot Connect 3D</h1>
            <button className="menu-button" onClick={onPlayClick}>Play</button>
            <button className="menu-button" onClick={onOptionsClick}>Options</button>
        </div>
    );
}

export default MainMenu;