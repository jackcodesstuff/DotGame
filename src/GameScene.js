// Filename: src/GameScene.js
import { useRef, useState, useCallback, useEffect } from 'react'; // React import is good practice
import { OrbitControls, Line as DreiLine } from '@react-three/drei';
import { useThree } from '@react-three/fiber'; // <-- Re-import useThree
import * as THREE from 'three';
// import { useTexture } from '@react-three/drei';

/**
 * Dot Component
 * Renders a single 3D dot (sphere) in the scene.
 * @param {object} props - Component props.
 * @param {number[]} props.position - The [x, y, z] coordinates of the dot.
 * @param {string} props.color - The color of the dot.
 * @param {string} props.dotId - A unique identifier for the dot.
 * @param {function} props.onClick - Callback function when the dot is clicked.
 */
function Dot({ position, color, dotId, onClick }) {
    const meshRef = useRef();

    /**
     * Handles the click event on the dot.
     * Stops event propagation to prevent interference with OrbitControls.
     * @param {object} event - The click event object.
     */
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
            <meshStandardMaterial
                color={color}
            />
        </mesh>
    );
}

/**
 * GameScene Component
 * Sets up the 3D environment and manages game logic for a single level.
 * @param {object} props - Component props.
 * @param {object[]} props.dotsData - Array of dot objects for the current level.
 * @param {function} props.onLevelComplete - Callback function to notify when the level is completed.
 */
export function GameScene({ dotsData, onLevelComplete, level }) {
    const { camera } = useThree(); // <--- Get the camera instance from useThree
    const controlsRef = useRef(); // Ref for OrbitControls

    const [firstSelectedDot, setFirstSelectedDot] = useState(null);
    const [connectedLines, setConnectedLines] = useState(new Set());

    /**
     * Sets the initial camera position and target when the component mounts or dotsData changes.
     */
    useEffect(() => {
        setConnectedLines(new Set());
        setFirstSelectedDot(null);

        // Set initial camera position (This overrides the Canvas camera prop for OrbitControls)
        if (camera && controlsRef.current) {
            camera.position.set(level.camera[0], level.camera[1], level.camera[2]); // Example: Isometric view position
            controlsRef.current.target.set(0, 0, 0); // Example: Look at the center of the scene
            controlsRef.current.update(); // Important: Update controls after changing camera/target
        }
    }, [dotsData, camera, level]); // Depend on camera as well

    /**
     * Handles the click logic for dots.
     * Manages selecting the first dot and attempting to connect to a second dot.
     * @param {string} clickedDotId - The ID of the clicked dot.
     * @param {number[]} clickedDotPositionArray - The [x, y, z] position array of the clicked dot.
     */
    const handleDotClick = useCallback((clickedDotId, clickedDotPositionArray) => {
        const clickedDotData = dotsData.find(d => d.id === clickedDotId);
        console.log(camera.position)

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

                        if (newLines.size >= expectedSameColorConnections && newLines.size > 0) {
                            setTimeout(() => {
                                onLevelComplete();
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
            setFirstSelectedDot(null);
        }
    }, [firstSelectedDot, connectedLines, dotsData, onLevelComplete, camera]);

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

            {/* Grid Helper Background */}
            <gridHelper args={[100, 100, '#d1d1d1', '#d1d1d1']} position={[0, -0.5, 0]} />

            {/* OrbitControls for camera interaction (pan, zoom, rotate) */}
            <OrbitControls ref={controlsRef} makeDefault /> {/* <-- Assign ref here */}
        </>
    );
}