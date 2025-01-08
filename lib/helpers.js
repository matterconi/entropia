// sharedPoints.js
let points = null;

export const getSharedPoints = () => {
  if (!points) {
    // Generate the points only once
    const positions = new Float32Array(5000 * 3); // 5000 points, 3 coordinates each
    for (let i = 0; i < 5000 * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10; // Spread out points
    }
    points = positions; // Save the generated points
  }
  return points; // Return the shared points
};
