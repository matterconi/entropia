import React, { useEffect, useRef, useState, useContext } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture, useAspect, Text } from "@react-three/drei";
import { transform } from "framer-motion";

import { fragment, vertex } from "./Shader";
import { DimensionsContext } from "@/context/DimensionsContext";

export default function Model({ scrollProgress, isLastCycle, currentImage, id }) {
  const { setDimensions } = useContext(DimensionsContext);
  const image = useRef(null);
  const [amplitude, setAmplitude] = useState(0.37);
  const [waveLength, setWaveLength] = useState(5);

  const texture = useLoader(THREE.TextureLoader, currentImage);
  const { width, height } = texture.image;

  const { viewport, size, camera } = useThree();
  const aspectRatio = viewport.width / viewport.height;

  const uniforms = useRef({
    uTime: { value: 0 },
    uAmplitude: { value: amplitude },
    uWaveLength: { value: waveLength },
    uTexture: { value: texture },
    vUvScale: { value: new THREE.Vector2(1, 1) },
    uOpacity: { value: 1 },
  });

  const initialScale = useAspect(width, height, 0.77); // Set the desired starting scale

  useFrame(() => {
    const progress = scrollProgress.get();
  
    // Define maximum scale based on viewport
    const maxScaleX = viewport.width * 0.9; // Adjust as needed
    const maxScaleY = viewport.height * 0.9; // Adjust as needed
  
    // Scale relative to progress, keeping it proportional
    const scaleX = transform(
      progress,
      [0, 1],
      [initialScale[0], maxScaleX]
    );
    const scaleY = transform(
      progress,
      [0, 1],
      [initialScale[1], maxScaleY]
    );
  
    // Calculate opacity
    const opacity = transform(progress, [0.9, 1], [1, 0], { clamp: true });
  
    if (image.current) {
      // Apply scaling and keep proportions
      image.current.scale.x = Math.min(scaleX, maxScaleX);
      image.current.scale.y = Math.min(scaleY, maxScaleY);
  
      // Maintain aspect ratio for UV scale
      const aspectRatio = width / height;
      const scaleRatio = image.current.scale.x / image.current.scale.y;
      image.current.material.uniforms.vUvScale.value.set(1, aspectRatio / scaleRatio);

      const modifiedAmplitude = transform(
        progress,
        [0, 1],
        [amplitude, 0]
      );

      image.current.material.uniforms.uTime.value += 0.04;
      image.current.material.uniforms.uAmplitude.value = modifiedAmplitude;
      image.current.material.uniforms.uWaveLength.value = waveLength;
      image.current.material.uniforms.uOpacity.value = isLastCycle
        ? 1
        : opacity;

      // Calculate pixel position
      const vector = new THREE.Vector3();
      vector.copy(image.current.position); // Model's position in world space
      vector.project(camera); // Convert to NDC (-1 to 1)

      // Get model dimensions in world units
      const worldWidth = image.current.scale.x; // Scaled width in world units
      const worldHeight = image.current.scale.y; // Scaled height in world units

      // Calculate the frustum dimensions at the model's Z position
      const fovInRadians = (camera.fov * Math.PI) / 180; // FOV in radians
      const distance = Math.abs(camera.position.z - image.current.position.z); // Distance from camera to model
      const frustumHeight = 2 * Math.tan(fovInRadians / 2) * distance; // Frustum height at Z
      const frustumWidth = frustumHeight * camera.aspect; // Frustum width at Z

      // Convert world units to pixels
      const pixelsPerUnitX = size.width / frustumWidth; // Pixels per unit horizontally
      const pixelsPerUnitY = size.height / frustumHeight; // Pixels per unit vertically
      const pixelWidth = worldWidth * pixelsPerUnitX; // Model width in pixels
      const pixelHeight = worldHeight * pixelsPerUnitY; // Model height in pixels

      // Update dimensions only if they have changed
      setDimensions((prevDimensions) => {
        // Check if dimensions for this ID already exist
        const existingIndex = prevDimensions.findIndex((item) => item.id === id);
      
        if (existingIndex !== -1) {
          // Update existing dimensions
          return prevDimensions.map((item, index) =>
            index === existingIndex
              ? { ...item, width: pixelWidth, height: pixelHeight }
              : item
          );
        } else {
          // Add new dimensions for this ID
          return [...prevDimensions, { id, width: pixelWidth, height: pixelHeight }];
        }
      });
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
