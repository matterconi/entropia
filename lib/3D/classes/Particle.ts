export default class Particle {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  size: number;
  lifespan: number;
  isDarkMode: boolean; // Track current theme mode

  constructor(x: number, y: number, isDarkMode: boolean) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 }; // Start with no velocity
    this.acceleration = this.randomAcceleration(0.05); // Random 2D acceleration scaled
    this.lifespan = 255; // Initial lifespan
    this.size = 2; // Particle size
    this.isDarkMode = isDarkMode; // Set theme mode
  }

  // Generate random 2D acceleration vector
  private randomAcceleration(scale: number): { x: number; y: number } {
    const angle = Math.random() * Math.PI * 2; // Random angle in radians
    return {
      x: Math.cos(angle) * scale,
      y: Math.sin(angle) * scale,
    };
  }

  // Updates the particle's position and reduces its lifespan
  update(): void {
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Reduce lifespan but clamp to 0
    this.lifespan = Math.max(0, this.lifespan - 3);
  }

  // Checks if the particle is still alive
  isAlive(): boolean {
    return this.lifespan > 0;
  }

  // Interpolate color based on lifespan
  private getColor(): string {
    // Define color ranges for light and dark modes
    const startColor = this.isDarkMode
      ? { r: 255, g: 200, b: 255 } // Light colors for dark mode
      : { r: 50, g: 50, b: 100 }; // Dark colors for light mode

    const endColor = this.isDarkMode
      ? { r: 100, g: 150, b: 255 } // Another light color for dark mode
      : { r: 20, g: 20, b: 50 }; // Another dark color for light mode

    const progress = this.lifespan / 255; // Normalize lifespan to 0-1

    // Linear interpolation between start and end colors
    const r = startColor.r + (endColor.r - startColor.r) * (1 - progress);
    const g = startColor.g + (endColor.g - startColor.g) * (1 - progress);
    const b = startColor.b + (endColor.b - startColor.b) * (1 - progress);

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  // Renders the particle on the canvas
  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.isAlive()) return;

    ctx.globalAlpha = this.lifespan / 255; // Fade out as lifespan decreases
    ctx.fillStyle = this.getColor(); // Dynamic color based on lifespan and mode
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
