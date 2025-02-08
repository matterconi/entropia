// sharedPoints.js
let points = null;

export const getSharedPoints = () => {
  if (!points) {
    const numPoints = 4000; // Adjusted number of points for a smoother gradient
    const positions = new Float32Array(numPoints * 3); // numPoints points, 3 coordinates each

    for (let i = 0; i < numPoints; i++) {
      // X and Z coordinates: uniformly distributed with noise
      const x = (Math.random() - 0.5) * 10 + addNoise(); // Range: -5 to 5 with noise
      const z = (Math.random() - 0.5) * 10 + addNoise();

      // Y coordinate: custom density function with noise
      const y = customBellCurve() * 5 + addNoise(); // Scale to adjust range and add randomness

      // Assign the generated values to the positions array
      positions[i * 3] = x; // X
      positions[i * 3 + 1] = y; // Y
      positions[i * 3 + 2] = z; // Z
    }

    points = positions; // Save the generated points
  }
  return points; // Return the shared points
};

// Custom function for denser middle and sparser edges
function customBellCurve() {
  const u = Math.random() - 0.5; // Range: -0.5 to 0.5
  return u * u * Math.sign(u); // Squaring reduces extreme values, retaining sign
}

// Noise function for randomness
function addNoise() {
  return (Math.random() - 0.5) * 0.5; // Small noise range: -0.25 to 0.25
}
