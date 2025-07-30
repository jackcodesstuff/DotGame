// Filename: src/App.js
import React, { useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line as DreiLine } from '@react-three/drei';
import * as THREE from 'three'; // For 3D vector math

// --- Hardcoded Dots List (Globally accessible within this module) ---
const DOTS_DATA = [
    { id: 'dot1', position: [-0.3, 0, 0], color: 'blue' },
    { id: 'dot2', position: [0.3, 0, 0], color: 'blue' },
    { id: 'dot3', position: [0, 0.3, 0], color: 'red' },
    { id: 'dot4', position: [0, -0.3, 0], color: 'red' },
    { id: 'dot5', position: [-0.6, 0.6, 0], color: 'green' },
    { id: 'dot6', position: [0.6, -0.6, 0], color: 'green' },
    { id: 'dot7', position: [-0.3, -0.3, -0.3], color: 'blue' },
    { id: 'dot8', position: [0.3, 0.3, 0.3], color: 'red' },
];

// --- Dot Component ---
function Dot({ position, color, dotId, onClick }) {
    const meshRef = useRef();

    const handleClick = useCallback((event) => {
        event.stopPropagation();
        // Pass position as a plain array, so GameScene can choose to convert it
        onClick(dotId, position);
    }, [dotId, position, onClick]);

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={handleClick}
            userData={{ isDot: true, dotId: dotId, color: color }}
        >
            <sphereGeometry args={[0.04]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

// --- GameScene Component ---
function GameScene() {
    const [firstSelectedDot, setFirstSelectedDot] = useState(null); // { id, position: THREE.Vector3, color }

    const [connectedLines, setConnectedLines] = useState(new Set());

    const handleDotClick = useCallback((clickedDotId, clickedDotPositionArray) => { // Now accepts array
        const clickedDotData = DOTS_DATA.find(d => d.id === clickedDotId);

        if (!clickedDotData) {
            console.error(`Clicked dot with ID ${clickedDotId} not found in DOTS_DATA.`);
            return;
        }

        if (!firstSelectedDot) {
            // First click: Store position as a THREE.Vector3
            console.log(`First dot selected: ${clickedDotId}`);
            setFirstSelectedDot({
                id: clickedDotId,
                position: new THREE.Vector3(...clickedDotPositionArray), // Convert to Vector3 here
                color: clickedDotData.color
            });
        } else {
            // Second click:
            const secondSelectedDotId = clickedDotId;
            const secondSelectedDotPosition = new THREE.Vector3(...clickedDotPositionArray); // Convert to Vector3 here

            if (firstSelectedDot.id === secondSelectedDotId) {
                console.log("Cannot connect a dot to itself. Deselecting.");
            }
            else if (firstSelectedDot.color === clickedDotData.color) {
                const connectionKey = [firstSelectedDot.id, secondSelectedDotId].sort().join('-');

                if (!connectedLines.has(connectionKey)) {
                    console.log(`Connected ${firstSelectedDot.id} to ${secondSelectedDotId} (Same Color!)`);
                    setConnectedLines(prevLines => new Set(prevLines).add(connectionKey));
                } else {
                    console.log(`Connection already exists between ${firstSelectedDot.id} and ${secondSelectedDotId}.`);
                }
            } else {
                console.log(`Cannot connect: ${firstSelectedDot.id} (${firstSelectedDot.color}) to ` +
                            `${secondSelectedDotId} (${clickedDotData.color}). Colors must match.`);
            }

            setFirstSelectedDot(null); // Reset selection
        }
    }, [firstSelectedDot, connectedLines]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <pointLight position={[-10, -10, -10]} />

            {DOTS_DATA.map(dot => (
                <Dot
                    key={dot.id}
                    dotId={dot.id}
                    position={dot.position}
                    color={dot.color}
                    onClick={handleDotClick}
                />
            ))}

            {Array.from(connectedLines).map(key => {
                const [id1, id2] = key.split('-');
                const dot1Data = DOTS_DATA.find(d => d.id === id1);
                const dot2Data = DOTS_DATA.find(d => d.id === id2);

                if (dot1Data && dot2Data) {
                    return (
                        <DreiLine
                            key={key}
                            // Ensure positions are arrays here
                            points={[dot1Data.position, dot2Data.position]} // These are already plain arrays from DOTS_DATA
                            color="gray"
                            lineWidth={3}
                        />
                    );
                }
                return null;
            })}

            {/* Optional: Render a temporary "active" line or highlight for the first selected dot */}
            {firstSelectedDot && (
                <DreiLine
                    // Use .toArray() on the THREE.Vector3 instance
                    points={[firstSelectedDot.position.toArray(), firstSelectedDot.position.toArray()]}
                    color="yellow"
                    lineWidth={5}
                />
            )}

            <OrbitControls makeDefault />
        </>
    );
}

// --- Main App Component ---
export default function App() {
    return (
        <div style={styles.container}>
            <div style={styles.uiOverlay}>
                <h1 style={styles.title}>Multi-Connect Dot Game</h1>
                <p style={styles.instructions}>Click two dots of the **SAME** color to connect them. Multiple connections allowed!</p>
            </div>
            <Canvas
                camera={{ position: [0, 0, 1.5], fov: 75 }}
                style={styles.canvas}
            >
                <color attach="background" args={['lightgray']} />
                <GameScene />
            </Canvas>
        </div>
    );
}

// --- Basic CSS for Layout ---
const styles = {
    container: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        fontFamily: 'Arial, sans-serif',
    },
    uiOverlay: {
        position: 'absolute',
        top: 20,
        zIndex: 10,
        color: 'white',
        textAlign: 'center',
    },
    title: {
        fontSize: '2.5em',
        marginBottom: '10px',
    },
    instructions: {
        fontSize: '1.2em',
        color: '#bbb',
    },
    canvas: {
        width: '90%',
        height: '70%',
        maxWidth: '800px',
        maxHeight: '600px',
        borderRadius: '15px',
        boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
    },
};