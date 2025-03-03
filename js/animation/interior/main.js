import { InteriorScene } from './scene.js';
import { Environment } from './environment.js';

class InteriorAnimation {
    constructor() {
        this.container = document.querySelector('#scene-container');
        this.scene = new InteriorScene(this.container);
        this.lastTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        // Time control (for now just advancing automatically)
        this.currentHour = 9;
        this.currentMinute = 0;
        this.timeSpeed = 1; // minutes per frame
        
        this.init();
    }
    
    init() {
        // Initialize components
        this.environment = new Environment(this.scene);
        
        // Start animation loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    updateTime() {
        this.currentMinute += this.timeSpeed;
        if (this.currentMinute >= 60) {
            this.currentHour = (this.currentHour + Math.floor(this.currentMinute / 60)) % 24;
            this.currentMinute = this.currentMinute % 60;
        }
        
        // Update time display
        const timeDisplay = document.querySelector('#time-display');
        timeDisplay.textContent = `${String(this.currentHour).padStart(2, '0')}:${String(Math.floor(this.currentMinute)).padStart(2, '0')}`;
    }
    
    updateFPS() {
        const now = performance.now();
        const delta = now - this.lastFpsUpdate;
        
        if (delta >= 1000) { // Update every second
            const fps = Math.round((this.frameCount * 1000) / delta);
            document.querySelector('#fps-display').textContent = fps;
            
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
        
        this.frameCount++;
    }
    
    animate(currentTime = 0) {
        requestAnimationFrame((time) => this.animate(time));
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update time
        this.updateTime();
        
        // Update components
        this.environment.update(deltaTime, this.currentHour, this.currentMinute);
        
        // Render scene
        this.scene.render();
        
        // Update FPS counter
        this.updateFPS();
    }
    
    onWindowResize() {
        this.scene.onResize(
            this.container.clientWidth,
            this.container.clientHeight
        );
    }
}

// Start the animation when the page loads
window.addEventListener('load', () => {
    new InteriorAnimation();
}); 