import * as THREE from 'three';

export class InteriorScene {
    constructor(container) {
        this.container = container;
        
        // Create the scene
        this.scene = new THREE.Scene();
        
        this.createCamera();
        this.createRenderer();
        this.createLights();
        
        // Set initial size
        this.onResize(
            this.container.clientWidth,
            this.container.clientHeight
        );
    }
    
    createCamera() {
        // Using perspective camera to simulate real lens
        const aspect = this.container.clientWidth / this.container.clientHeight;
        
        // 24mm equivalent on full frame (75° FOV)
        this.camera = new THREE.PerspectiveCamera(
            75,  // vertical FOV in degrees
            aspect,
            0.1,
            1000
        );
        
        // Position camera 5 meters from back wall (moved 2m closer)
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 2, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Brighter overall scene
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    createLights() {
        // Soft ambient light - increased for better base illumination
        const ambientLight = new THREE.AmbientLight(0xfff2e6, 0.8);
        this.scene.add(ambientLight);
        
        // LED ceiling lights
        const ledColor = 0xfff2e6; // Slightly warmer white
        const ledPositions = [
            [-2, 5.5, -2],
            [2, 5.5, -2],
            [-2, 5.5, 0],
            [2, 5.5, 0]
        ];
        
        ledPositions.forEach(pos => {
            // LED light source (visible geometry)
            const ledGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.6);
            const ledMaterial = new THREE.MeshStandardMaterial({
                color: ledColor,
                emissive: ledColor,
                emissiveIntensity: 0.8
            });
            const ledMesh = new THREE.Mesh(ledGeometry, ledMaterial);
            ledMesh.position.set(...pos);
            this.scene.add(ledMesh);
            
            // LED point light (actual light source)
            const ledLight = new THREE.PointLight(ledColor, 0.6, 10, 1);
            ledLight.position.set(...pos);
            this.scene.add(ledLight);
        });
        
        // Window light (cooler color temperature)
        const windowLight = new THREE.DirectionalLight(0x9cb5ff, 0.7);
        windowLight.position.set(-5, 4, 2);
        this.scene.add(windowLight);

        // Increase overall scene exposure
        this.renderer.toneMappingExposure = 1.2;
    }
    
    onResize(width, height) {
        const aspect = width / height;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    // Helper method to add objects to the scene
    add(object) {
        this.scene.add(object);
    }
    
    // Helper method to remove objects from the scene
    remove(object) {
        this.scene.remove(object);
    }
} 