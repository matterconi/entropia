"use client";

import { Environment, Points, PointMaterial } from "@react-three/drei";
import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Model from "./Model";
import { getSharedPoints } from "@/lib/helpers";

// StarField Component

const StarField = ({isDarkMode}) => {
  const pointsRef = useRef();
  const points = getSharedPoints(); // Get shared points array

  // Rotate the points subtly
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001; // Subtle rotation
    }
  });

  return (
    <Points ref={pointsRef} positions={points} stride={3} renderOrder={1}>
      <PointMaterial
        transparent
        color={isDarkMode ? "#ffffff" : "#000000"} // Change color based on theme
        size={0.01}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};

// Camera Controller Component
const CameraController = ({ mouse }) => {
  useFrame(({ camera }) => {
    camera.rotation.x += (mouse.current.y * 0.1 - camera.rotation.x) * 0.05;
    camera.rotation.y += (mouse.current.x * 0.1 - camera.rotation.y) * 0.05;
  });

  return null;
};

// Main Component
const Index = ({ scrollProgress, isLastCycle, currentImage, isDarkMode }) => {
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

  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      {/* Attach mouse interaction to camera */}
      <CameraController mouse={mouse} />
      <StarField isDarkMode={isDarkMode}/>
      <directionalLight intensity={2} position={[0, 2, 3]} />
      <Environment preset="city" />
    </Canvas>
  );
};

export default Index;
