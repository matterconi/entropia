import React, { useEffect, useRef, useState } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture, useAspect, Text } from "@react-three/drei";
import { transform } from "framer-motion";

import GUI from "lil-gui";
import { fragment, vertex } from "./Shader";

export default function Model({ scrollProgress, isLastCycle, currentImage }) {
  const image = useRef(null);
  // State for amplitude and wavelength
  const [amplitude, setAmplitude] = useState(0.25);
  const [waveLength, setWaveLength] = useState(5);

  const texture = useLoader(THREE.TextureLoader, currentImage);
  const { width, height } = texture.image;

  const { viewport } = useThree();
  const aspectRatio = viewport.width / viewport.height;

  // Uniforms for the shader
  const uniforms = useRef({
    uTime: { value: 0 },
    uAmplitude: { value: amplitude },
    uWaveLength: { value: waveLength },
    uTexture: { value: texture },
    vUvScale: { value: new THREE.Vector2(1, 1) },
    uOpacity: { value: 1 }, // Add opacity uniform
  });

  // Calculate the initial scale based on the texture's aspect ratio
  const initialScale = useAspect(width, height, aspectRatio > 1.5 ? 0.2 : 0.3);

  useFrame(() => {
    // Maximum scale based on the 80vh div
    const containerHeight = viewport.height * 0.7; // 80vh
    const maxScaleX = containerHeight * 0.7; // Scale X to fit within 80vh
    const maxScaleY = maxScaleX / (width / height); // Maintain aspect ratio
  
    // Map scroll progress to scale values
    const scaleX = transform(
      scrollProgress.get(),
      [0, 1], // Normalized progress range
      [initialScale[0], maxScaleX] // Initial to maximum scale
    );
    const scaleY = scaleX / (width / height); // Maintain aspect ratio
  
    // Gradual fade-out opacity based on scroll progress
    const progress = scrollProgress.get();
    const opacity = transform(
      progress,
      [0.7, 1], // Start fading out at 90% progress, fully transparent at 100%
      [1, 0], // Opacity transition from 1 (fully visible) to 0 (fully invisible)
      { clamp: true } // Ensure opacity stays within [1, 0]
    );
  
    // Update plane scaling, positioning, and opacity
    if (image.current) {
      // Constrain the scaling to avoid exceeding 80vh bounds
      image.current.scale.set(
        Math.min(scaleX, maxScaleX), // Clamp to maxScaleX
        Math.min(scaleY, maxScaleY), // Clamp to maxScaleY
        1
      );
  
      // Center the image in the 80vh div
      image.current.position.set(0, 0, 0);
  
      // Update shader uniforms for UV scale
      const aspectRatio = width / height;
      const scaleRatio = scaleX / scaleY;
      image.current.material.uniforms.vUvScale.value.set(1, aspectRatio / scaleRatio);
  
      // Adjust amplitude based on normalized scroll progress
      const modifiedAmplitude = transform(
        progress,
        [0, 1],
        [amplitude, 0] // Gradually reduce amplitude to 0
      );
  
      // Update shader uniforms for animation effects
      image.current.material.uniforms.uTime.value += 0.04;
      image.current.material.uniforms.uAmplitude.value = modifiedAmplitude;
      image.current.material.uniforms.uWaveLength.value = waveLength;
  
      // Apply gradual fade-out effect
      image.current.material.transparent = true; // Enable transparency
      image.current.material.uniforms.uOpacity.value = isLastCycle
      ? 1 // Keep full opacity for the last cycle
      : opacity; // Apply fade-out for other cycles
        }
  });

  return (
    <>
      <mesh ref={image} scale={initialScale} renderOrder={2}>
        <planeGeometry args={[1, 1, 15, 15]} />
        <shaderMaterial
          wireframe={false}
          fragmentShader={fragment}
          vertexShader={vertex}
          uniforms={uniforms.current}
          transparent={true}
        />
      </mesh>
    </>
  );
}
