export const fragment = `
	uniform sampler2D uTexture;
	uniform vec2 vUvScale;
	uniform float uOpacity; // New uniform for controlling opacity
	varying vec2 vUv;

	void main() {
		vec2 uv = (vUv - 0.5) * vUvScale + 0.5; // Adjust UVs for scaling
		vec4 color = texture2D(uTexture, uv);

		// Apply opacity to the fragment's alpha channel
		color.a *= uOpacity;

		// Discard pixels with very low alpha (optional for better performance)
		if (color.a < 0.01) discard;

		gl_FragColor = color;
	}
`
	export const vertex = `
	varying vec2 vUv;
	uniform float uTime;
	uniform float uAmplitude;
	uniform float uWaveLength;
	void main() {
		vUv = uv;
		vec3 newPosition = position;
	
		float wave = uAmplitude * sin(position.x * uWaveLength + uTime);
		newPosition.z = position.z + wave; 
	
		gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
	  }
	`