import Particle from "./Particle";

export default class System {
  particles: Particle[] = [];
  x: number;
  y: number;
  isDarkMode: boolean;

  constructor(x: number, y: number, isDarkMode: boolean) {
    this.x = x;
    this.y = y;
    this.isDarkMode = isDarkMode;

    // Create initial particles
    for (let i = 0; i < 50; i++) {
      this.addParticle();
    }
  }

  addParticle(): void {
    this.particles.push(new Particle(this.x, this.y, this.isDarkMode));
  }

  update(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach((particle) => {
      particle.update();
      particle.draw(ctx);
    });

    // Remove particles that are done
    this.particles = this.particles.filter((particle) => particle.isAlive());
  }

  isEmpty(): boolean {
    return this.particles.length === 0;
  }
}
