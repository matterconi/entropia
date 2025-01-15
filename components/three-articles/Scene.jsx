"use client";

import { Environment, Points, PointMaterial } from "@react-three/drei";
import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Model from "./Model";
import { getSharedPoints } from "@/lib/helpers";

// Main Component
const Index = ({ scrollProgress, isLastCycle, currentImage, isDarkMode, id }) => {

  return (
    <Canvas camera={{ position: [0, 0, 5] }} gl={{ alpha: true }} // Enable alpha transparency
  style={{ background: "none" }}>
      {/* Attach mouse interaction to camera */}
      <Model
        scrollProgress={scrollProgress}
        isLastCycle={isLastCycle}
        currentImage={currentImage}
        id={id}
      />
      <directionalLight intensity={2} position={[0, 2, 3]} />
      <Environment preset="city" />
    </Canvas>
  );
};

export default Index;
