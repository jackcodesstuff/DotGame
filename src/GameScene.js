// Filename: src/GameScene.js
import { useRef, useState, useCallback, useEffect } from 'react';
import { OrbitControls, Line as DreiLine } from '@react-three/drei';
import * as THREE from 'three';

// --- Dot Component ---
// Renders a single 3D dot (sphere).
function Dot({ position, color, dotId, onClick }) {
    const meshRef = useRef();

    const handleClick = useCallback((event) => {
        event.stopPropagation();
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
// This component sets up the 3D environment and manages game logic for a single level.
export function GameScene({ dotsData, onLevelComplete }) { // Export GameScene
    const [firstSelectedDot, setFirstSelectedDot] = useState(null); // { id, position: THREE.Vector3, color }
    const [connectedLines, setConnectedLines] = useState(new Set()); // Stores 'dotA-dotB' keys

    // Reset connections and selection when dotsData changes (i.e., new level loaded)
    useEffect(() => {
        setConnectedLines(new Set());
        setFirstSelectedDot(null);
    }, [dotsData]);

    const handleDotClick = useCallback((clickedDotId, clickedDotPositionArray) => {
        const clickedDotData = dotsData.find(d => d.id === clickedDotId);

        if (!clickedDotData) {
            console.error(`Clicked dot with ID ${clickedDotId} not found in current level's dots data.`);
            return;
        }

        if (!firstSelectedDot) {
            // First click: Store position as a THREE.Vector3
            console.log(`First dot selected: ${clickedDotId}`);
            setFirstSelectedDot({
                id: clickedDotId,
                position: new THREE.Vector3(...clickedDotPositionArray),
                color: clickedDotData.color
            });
        } else {
            // Second click:
            const secondSelectedDotId = clickedDotId;

            if (firstSelectedDot.id === secondSelectedDotId) {
                console.log("Cannot connect a dot to itself. Deselecting.");
            } else if (firstSelectedDot.color === clickedDotData.color) {
                const connectionKey = [firstSelectedDot.id, secondSelectedDotId].sort().join('-');

                if (!connectedLines.has(connectionKey)) {
                    console.log(`Connected ${firstSelectedDot.id} to ${secondSelectedDotId} (Same Color!)`);
                    setConnectedLines(prevLines => {
                        const newLines = new Set(prevLines).add(connectionKey);
                        // --- Level Completion Check (Simple: just count same-color connections) ---
                        // For a real game, you'd check `newLines.size` against `dotsData.targetConnections.length`
                        // and ensure all required specific connections are made.
                        const blueDots = dotsData.filter(d => d.color === 'blue');
                        const redDots = dotsData.filter(d => d.color === 'red');
                        const greenDots = dotsData.filter(d => d.color === 'green');
                        const purpleDots = dotsData.filter(d => d.color === 'purple');
                        const yellowDots = dotsData.filter(d => d.color === 'yellow');
                        const orangeDots = dotsData.filter(d => d.color === 'orange');

                        let expectedSameColorConnections = 0;
                        if (blueDots.length >= 2) expectedSameColorConnections += 1;
                        if (redDots.length >= 2) expectedSameColorConnections += 1;
                        if (greenDots.length >= 2) expectedSameColorConnections += 1;
                        if (purpleDots.length >= 2) expectedSameColorConnections += 1;
                        if (yellowDots.length >= 2) expectedSameColorConnections += 1;
                        if (orangeDots.length >= 2) expectedSameColorConnections += 1;


                        // This is a very basic completion check: if we have any valid connections.
                        // You'll need to expand this based on your actual level design (e.g., targetConnections in level data).
                        if (newLines.size >= expectedSameColorConnections && newLines.size > 0) {
                            // Delay slightly so the last line renders before screen transition
                            setTimeout(() => {
                                onLevelComplete(); // Call the App.js callback
                            }, 500);
                        }
                        return newLines;
                    });
                } else {
                    console.log(`Connection already exists between ${firstSelectedDot.id} and ${secondSelectedDotId}.`);
                }
            } else {
                console.log(`Cannot connect: ${firstSelectedDot.id} (${firstSelectedDot.color}) to ` +
                            `${clickedDotData.id} (${clickedDotData.color}). Colors must match.`);
            }
            setFirstSelectedDot(null); // Reset selection
        }
    }, [firstSelectedDot, connectedLines, dotsData, onLevelComplete]);

    return (
        <>
            <ambientLight intensity={2} />
            <pointLight position={[10, 10, 10]} />
            <pointLight position={[-10, -10, -10]} />

            {dotsData.map(dot => (
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
                const dot1Data = dotsData.find(d => d.id === id1);
                const dot2Data = dotsData.find(d => d.id === id2);

                if (dot1Data && dot2Data) {
                    return (
                        <DreiLine
                            key={key}
                            points={[dot1Data.position, dot2Data.position]}
                            color={dot1Data.color}
                            lineWidth={3}
                        />
                    );
                }
                return null;
            })}

            {/* Visual highlight for the first selected dot */}
            {firstSelectedDot && (
                <DreiLine
                    points={[firstSelectedDot.position.toArray(), firstSelectedDot.position.toArray()]}
                    color="yellow"
                    lineWidth={5}
                />
            )}

            <OrbitControls makeDefault />
        </>
    );
}