import * as THREE from 'three';

export class Character {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position;
        this.character = new THREE.Group();
        
        this.createCharacter();
        this.setupAnimations();
        
        // Add to scene
        this.scene.add(this.character);
        
        // Set initial position
        this.character.position.set(position.x, position.y, position.z);
    }
    
    createCharacter() {
        // Create a more detailed character
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x3366cc,
            roughness: 0.7
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.castShadow = true;
        this.character.add(this.body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc99,
            roughness: 0.6
        });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 0.3;
        this.head.castShadow = true;
        this.character.add(this.head);
        
        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0x3366cc,
            roughness: 0.7
        });
        
        this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
        this.leftArm.position.set(-0.2, 0.1, 0);
        this.leftArm.rotation.z = 0.2;
        this.leftArm.castShadow = true;
        this.character.add(this.leftArm);
        
        this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
        this.rightArm.position.set(0.2, 0.1, 0);
        this.rightArm.rotation.z = -0.2;
        this.rightArm.castShadow = true;
        this.character.add(this.rightArm);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.7
        });
        
        this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.leftLeg.position.set(-0.08, -0.3, 0);
        this.leftLeg.castShadow = true;
        this.character.add(this.leftLeg);
        
        this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.rightLeg.position.set(0.08, -0.3, 0);
        this.rightLeg.castShadow = true;
        this.character.add(this.rightLeg);

        // Position the entire character
        this.character.position.y = -0.9;
    }
    
    setupAnimations() {
        // Animation state
        this.animationState = {
            idle: true,
            working: false,
            walking: false
        };
        
        // Animation parameters
        this.idleTimer = 0;
        this.workTimer = 0;
        this.walkTimer = 0;
    }
    
    update(deltaTime) {
        // Update animation timers
        this.idleTimer += deltaTime * 0.001;
        
        // Idle animation - subtle floating motion
        if (this.animationState.idle) {
            const floatOffset = Math.sin(this.idleTimer * 2) * 0.03;
            this.character.position.y = this.position.y + floatOffset;
            
            // Subtle arm movement
            this.leftArm.rotation.z = 0.2 + Math.sin(this.idleTimer * 3) * 0.1;
            this.rightArm.rotation.z = -0.2 + Math.sin(this.idleTimer * 3) * 0.1;
            
            // Subtle head movement
            this.head.rotation.z = Math.sin(this.idleTimer) * 0.1;
        }
        
        // Working animation could be added here
        // Walking animation could be added here
    }
    
    startWorking() {
        Object.keys(this.animationState).forEach(key => {
            this.animationState[key] = false;
        });
        this.animationState.working = true;
    }
    
    startWalking() {
        Object.keys(this.animationState).forEach(key => {
            this.animationState[key] = false;
        });
        this.animationState.walking = true;
    }
    
    idle() {
        Object.keys(this.animationState).forEach(key => {
            this.animationState[key] = false;
        });
        this.animationState.idle = true;
    }
} 