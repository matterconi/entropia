import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

const InteractiveBackground = () => {
  const cameraRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  // Capture mouse movement
  useEffect(() => {
    const handleMouseMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1; // Normalize [-1, 1]
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Smoothly animate the camera based on mouse position
  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.rotation.x += (mouse.current.y * 0.05 - cameraRef.current.rotation.x) * 0.1;
      cameraRef.current.rotation.y += (mouse.current.x * 0.05 - cameraRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <Canvas camera={{ position: [0, 0, 5], ref: cameraRef }}>
		<Model scrollProgress={scrollProgress} isLastCycle={isLastCycle} currentImage={currentImage}/>
		<directionalLight intensity={2} position={[0, 2, 3]} />
		<Environment preset="city" />
		<ambientLight intensity={0.5} />
		<DynamicParticles />
    </Canvas>
  );
};

const DynamicParticles = () => {
  const pointsRef = useRef();

  const generateParticles = () => {
    const positions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000 * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10; // Random spread
    }
    return positions;
  };

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001; // Subtle rotation effect
    }
  });

  return (
    <Points ref={pointsRef} positions={generateParticles()} stride={3}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};

export default InteractiveBackground;
