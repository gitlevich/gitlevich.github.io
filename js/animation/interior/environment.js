import * as THREE from 'three';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.objects = new THREE.Group();
        
        this.createStructure();
        this.createFurniture();
        this.createServerRack();
        this.createDecorations();
        this.createPerson();  // Add person to the scene
        
        // Add everything to the scene
        this.scene.add(this.objects);
    }
    
    createStructure() {
        // Floor - medium grey with subtle texture
        const floorGeometry = new THREE.PlaneGeometry(14, 8);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.4,
            metalness: 0.1
        });
        
        // Create subtle grid texture for floor
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#c0c0c0';
        ctx.lineWidth = 1;
        for(let i = 0; i < 512; i += 32) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }
        floorMaterial.map = new THREE.CanvasTexture(canvas);
        floorMaterial.map.repeat.set(4, 4);
        floorMaterial.map.wrapS = THREE.RepeatWrapping;
        floorMaterial.map.wrapT = THREE.RepeatWrapping;
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.objects.add(floor);
        
        // Back wall - almost white with subtle texture
        const wallGeometry = new THREE.PlaneGeometry(14, 4.5);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.1
        });
        
        // Create subtle noise texture for wall
        const wallCanvas = document.createElement('canvas');
        wallCanvas.width = 512;
        wallCanvas.height = 512;
        const wallCtx = wallCanvas.getContext('2d');
        wallCtx.fillStyle = '#ffffff';
        wallCtx.fillRect(0, 0, 512, 512);
        for(let i = 0; i < 10000; i++) {
            wallCtx.fillStyle = `rgba(200,200,200,${Math.random() * 0.03})`;
            wallCtx.fillRect(
                Math.random() * 512,
                Math.random() * 512,
                2,
                2
            );
        }
        wallMaterial.map = new THREE.CanvasTexture(wallCanvas);
        wallMaterial.map.repeat.set(2, 1);
        wallMaterial.map.wrapS = THREE.RepeatWrapping;
        wallMaterial.map.wrapT = THREE.RepeatWrapping;
        
        const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
        backWall.position.z = -4;
        backWall.position.y = 2.25;
        backWall.receiveShadow = true;
        this.objects.add(backWall);
        
        // Window view with bright light
        const viewGeometry = new THREE.PlaneGeometry(4, 3);
        const viewMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 1
        });
        
        // Create brighter gradient for window view
        const viewCanvas = document.createElement('canvas');
        viewCanvas.width = 512;
        viewCanvas.height = 512;
        const viewCtx = viewCanvas.getContext('2d');
        
        const gradient = viewCtx.createLinearGradient(0, 0, 0, viewCanvas.height);
        gradient.addColorStop(0, '#e6f3ff');    // Bright sky blue
        gradient.addColorStop(0.5, '#c6e6ff');  // Light blue
        gradient.addColorStop(0.7, '#90EE90');  // Light green
        gradient.addColorStop(1, '#228B22');    // Forest green
        
        viewCtx.fillStyle = gradient;
        viewCtx.fillRect(0, 0, viewCanvas.width, viewCanvas.height);
        
        const texture = new THREE.CanvasTexture(viewCanvas);
        viewMaterial.map = texture;
        
        const view = new THREE.Mesh(viewGeometry, viewMaterial);
        view.position.set(0, 2.5, -3.95);
        this.objects.add(view);
        
        // Add strong window light
        const windowLight = new THREE.RectAreaLight(0xffffff, 5, 4, 3);
        windowLight.position.set(0, 2.5, -3.8);
        windowLight.lookAt(0, 2.5, 0);
        this.objects.add(windowLight);
        
        // Add subtle volumetric light effect
        const windowGlow = new THREE.Mesh(
            new THREE.PlaneGeometry(4.2, 3.2),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            })
        );
        windowGlow.position.set(0, 2.5, -3.85);
        this.objects.add(windowGlow);
        
        // Create window hole
        const holeGeometry = new THREE.PlaneGeometry(4.2, 3.2);
        const holeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.position.set(0, 2.5, -3.9);
        this.objects.add(hole);

        // Add whiteboard
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            metalness: 0.8,
            roughness: 0.2
        });

        const boardMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.3
        });

        const boardWidth = 3;
        const boardHeight = 2;
        const frameThickness = 0.05;

        // Main surface
        const board = new THREE.Mesh(
            new THREE.BoxGeometry(boardWidth, boardHeight, 0.02),
            boardMaterial
        );

        // Create frame pieces
        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(boardWidth + frameThickness * 2, frameThickness, frameThickness),
            frameMaterial
        );
        topFrame.position.set(0, boardHeight/2 + frameThickness/2, frameThickness/2);

        const bottomFrame = new THREE.Mesh(
            new THREE.BoxGeometry(boardWidth + frameThickness * 2, frameThickness, frameThickness),
            frameMaterial
        );
        bottomFrame.position.set(0, -boardHeight/2 - frameThickness/2, frameThickness/2);

        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, boardHeight + frameThickness * 2, frameThickness),
            frameMaterial
        );
        leftFrame.position.set(-boardWidth/2 - frameThickness/2, 0, frameThickness/2);

        const rightFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, boardHeight + frameThickness * 2, frameThickness),
            frameMaterial
        );
        rightFrame.position.set(boardWidth/2 + frameThickness/2, 0, frameThickness/2);

        // Create a group for the whiteboard and frame
        const whiteboardGroup = new THREE.Group();
        whiteboardGroup.add(board);
        whiteboardGroup.add(topFrame);
        whiteboardGroup.add(bottomFrame);
        whiteboardGroup.add(leftFrame);
        whiteboardGroup.add(rightFrame);

        // Position the whiteboard on the wall
        whiteboardGroup.position.set(6.9, 2.2, 0);  // Right wall, closest to viewer
        whiteboardGroup.rotation.y = -Math.PI / 2;  // Rotate to face into room
        
        // Add shadows
        whiteboardGroup.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        this.objects.add(whiteboardGroup);
        this.whiteboard = whiteboardGroup;
        
        // Wooden roof structure
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Wood color
            roughness: 0.9
        });
        
        // Create wooden beams - extend past edges
        for (let x = -6.5; x <= 6.5; x += 2) {
            const beam = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.4, 8),
                roofMaterial
            );
            beam.position.set(x, 4.3, 0);
            beam.castShadow = true;
            this.objects.add(beam);
        }
        
        // Main support beam
        const mainBeam = new THREE.Mesh(
            new THREE.BoxGeometry(14, 0.4, 0.4),
            roofMaterial
        );
        mainBeam.position.set(0, 4.5, 0);
        mainBeam.castShadow = true;
        this.objects.add(mainBeam);
    }
    
    createFurniture() {
        // Helper function to create cables between equipment
        const createCable = (start, end) => {
            const curve = new THREE.QuadraticBezierCurve3(
                start,
                new THREE.Vector3(
                    (start.x + end.x) / 2,
                    start.y + 0.1,
                    (start.z + end.z) / 2
                ),
                end
            );
            
            const points = curve.getPoints(20);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x000000,
                linewidth: 2
            });
            
            const cable = new THREE.Line(geometry, material);
            this.objects.add(cable);
        };

        // Pure white desks with subtle texture
        const deskGeometry = new THREE.BoxGeometry(2, 0.8, 1);
        const deskMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.1
        });
        
        // Create subtle texture for desk
        const deskCanvas = document.createElement('canvas');
        deskCanvas.width = 512;
        deskCanvas.height = 512;
        const deskCtx = deskCanvas.getContext('2d');
        deskCtx.fillStyle = '#ffffff';
        deskCtx.fillRect(0, 0, 512, 512);
        for(let i = 0; i < 5000; i++) {
            deskCtx.fillStyle = `rgba(240,240,240,${Math.random() * 0.05})`;
            deskCtx.fillRect(
                Math.random() * 512,
                Math.random() * 512,
                1,
                1
            );
        }
        deskMaterial.map = new THREE.CanvasTexture(deskCanvas);
        
        // First desk
        const desk1 = new THREE.Mesh(deskGeometry, deskMaterial);
        desk1.position.set(-1.5, 0.4, -2);
        desk1.castShadow = true;
        desk1.receiveShadow = true;
        this.objects.add(desk1);
        
        // Second desk
        const desk2 = new THREE.Mesh(deskGeometry, deskMaterial);
        desk2.position.set(1.5, 0.4, -2);
        desk2.castShadow = true;
        desk2.receiveShadow = true;
        this.objects.add(desk2);
        
        // Add desk accent lights
        const desk1Light = new THREE.PointLight(0xffffff, 0.3, 3, 1);
        desk1Light.position.set(-1.5, 2, -2);
        this.objects.add(desk1Light);
        
        const desk2Light = new THREE.PointLight(0xffffff, 0.3, 3, 1);
        desk2Light.position.set(1.5, 2, -2);
        this.objects.add(desk2Light);
        
        // Red bean bag
        const beanBagGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const beanBagMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            roughness: 0.7,
            metalness: 0.1
        });
        const beanBag = new THREE.Mesh(beanBagGeometry, beanBagMaterial);
        beanBag.scale.y = 0.5;
        beanBag.position.set(3.5, 0.4, -1);
        beanBag.castShadow = true;
        beanBag.receiveShadow = true;
        this.objects.add(beanBag);
        
        // Add workbench for AI development
        const benchLength = 5;  // Longer bench
        const benchDepth = 0.8;
        const benchHeight = 0.9;
        const legWidth = 0.05;
        
        // Create legs first
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,  // Dark metallic color
            roughness: 0.3,
            metalness: 0.8
        });

        // Helper function to create a leg
        const createLeg = (x, z) => {
            const leg = new THREE.Mesh(
                new THREE.BoxGeometry(legWidth, benchHeight, legWidth),
                legMaterial
            );
            leg.position.set(x, benchHeight/2, z);
            leg.castShadow = true;
            this.objects.add(leg);

            // Add foot detail
            const foot = new THREE.Mesh(
                new THREE.BoxGeometry(legWidth * 2, legWidth, legWidth * 2),
                legMaterial
            );
            foot.position.set(x, legWidth/2, z);
            foot.castShadow = true;
            this.objects.add(foot);
        };

        // Create legs at corners and middle
        const benchX = -4.5;  // Left edge touches wall at x=-7
        const benchZ = 1;   // Moved forward from back wall
        createLeg(benchX - benchLength/2 + legWidth, benchZ - benchDepth/2 + legWidth);
        createLeg(benchX - benchLength/2 + legWidth, benchZ + benchDepth/2 - legWidth);
        createLeg(benchX + benchLength/2 - legWidth, benchZ - benchDepth/2 + legWidth);
        createLeg(benchX + benchLength/2 - legWidth, benchZ + benchDepth/2 - legWidth);
        createLeg(benchX, benchZ);  // Middle support

        // Main workbench top
        const benchGeometry = new THREE.BoxGeometry(benchLength, 0.05, benchDepth);  // Thinner top
        const benchMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,  // Pure white
            roughness: 0.7,   // More matte finish
            metalness: 0.1    // Less metallic for better light reflection
        });
        const bench = new THREE.Mesh(benchGeometry, benchMaterial);
        bench.position.set(benchX, benchHeight, benchZ);
        bench.castShadow = true;
        bench.receiveShadow = true;
        this.objects.add(bench);

        // Add equipment to the bench
        const createMonitor = (x, z, rotation) => {
            const stand = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8),
                new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.8 })
            );
            stand.position.set(x, benchHeight + 0.15, z);
            this.objects.add(stand);
            
            const screen = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.4, 0.02),
                new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    emissive: 0x1a1a1a,
                    roughness: 0.2,
                    metalness: 0.8
                })
            );
            screen.position.set(x, benchHeight + 0.4, z);
            screen.rotation.x = -0.2;
            screen.rotation.y = rotation;
            this.objects.add(screen);
            
            // Add screen glow
            const screenGlow = new THREE.Mesh(
                new THREE.PlaneGeometry(0.58, 0.38),
                new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                    transparent: true,
                    opacity: 0.1
                })
            );
            screenGlow.position.set(x, benchHeight + 0.4, z + 0.011);
            screenGlow.rotation.x = -0.2;
            screenGlow.rotation.y = rotation;
            this.objects.add(screenGlow);
        };
        
        // Add three monitors
        createMonitor(benchX - 1.5, benchZ - 0.3, 0.2);
        createMonitor(benchX, benchZ - 0.3, 0);
        createMonitor(benchX + 1.5, benchZ - 0.3, -0.2);
        
        // Add main overhead light for workbench
        const workbenchLight = new THREE.SpotLight(0xffffff, 15);
        workbenchLight.position.set(benchX, 4.2, benchZ);
        workbenchLight.target.position.set(benchX, 0, benchZ);
        workbenchLight.angle = Math.PI / 3;  // Wider angle
        workbenchLight.penumbra = 0.5;  // Soft edges
        workbenchLight.decay = 1.5;
        workbenchLight.distance = 10;
        workbenchLight.castShadow = true;

        // Configure shadow properties
        workbenchLight.shadow.mapSize.width = 2048;
        workbenchLight.shadow.mapSize.height = 2048;
        workbenchLight.shadow.camera.near = 0.1;
        workbenchLight.shadow.camera.far = 15;
        workbenchLight.shadow.bias = -0.001;
        workbenchLight.shadow.radius = 4;

        this.objects.add(workbenchLight);
        this.objects.add(workbenchLight.target);

        // Add stronger ambient light
        const fillLight = new THREE.AmbientLight(0xffffff, 0.6);  // Increased ambient intensity
        this.objects.add(fillLight);
    }
    
    createServerRack() {
        // Server rack cabinet
        const rackGeometry = new THREE.BoxGeometry(2, 4, 1);  // Wider and deeper
        const rackMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5
        });
        const rack = new THREE.Mesh(rackGeometry, rackMaterial);
        rack.position.set(-5.5, 2, -3);  // Moved further left
        this.objects.add(rack);
        
        // Add blinking server lights
        this.serverLights = [];
        for (let y = 0.5; y < 3.5; y += 0.2) {
            const lightGeometry = new THREE.PlaneGeometry(0.05, 0.05);
            const lightMaterial = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0x00ff00 : 0xff0000,
                emissive: 0x444444
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(-4.6, y, -2.5);  // Adjusted for new rack position
            this.serverLights.push(light);
            this.objects.add(light);
        }
    }
    
    createDecorations() {
        // Move plant further into corner
        const potGeometry = new THREE.CylinderGeometry(0.3, 0.25, 0.4, 16);
        const potMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            roughness: 0.9,
            metalness: 0.1
        });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        pot.position.set(6.5, 0.2, -3.8);
        pot.castShadow = true;
        pot.receiveShadow = true;
        this.objects.add(pot);
        
        const createLeafCluster = (x, y, z, scale) => {
            const leafGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const leafMaterial = new THREE.MeshStandardMaterial({
                color: 0x228B22,
                roughness: 0.8,
                metalness: 0.1,
                emissive: 0x003300,
                emissiveIntensity: 0.1
            });
            const cluster = new THREE.Mesh(leafGeometry, leafMaterial);
            cluster.position.set(x, y, z);
            cluster.scale.set(scale.x, scale.y, scale.z);
            cluster.castShadow = true;
            cluster.receiveShadow = true;  // Enable receiving shadows
            this.objects.add(cluster);
            return cluster;  // Return for reference
        };
        
        // Create leaf clusters and store references
        const clusters = [
            createLeafCluster(6.3, 0.6, -3.6, {x: 0.8, y: 1, z: 0.8}),
            createLeafCluster(6.7, 0.7, -3.9, {x: 0.9, y: 1.2, z: 0.9}),
            createLeafCluster(6.5, 0.9, -3.7, {x: 1, y: 1.4, z: 1}),
            createLeafCluster(6.4, 0.8, -3.8, {x: 0.7, y: 0.9, z: 0.7})
        ];
        
        // Add spotlight in front of plant
        const plantLight = new THREE.SpotLight(0xffffff, 5);  // Keep high intensity
        plantLight.position.set(6.5, 4.2, 0);  // Move light forward (z coordinate changed to 0)
        plantLight.target.position.set(6.5, 0.8, -3.8);  // Target the middle of the plant
        plantLight.angle = Math.PI / 6;  // Keep wider angle
        plantLight.penumbra = 0.2;  // Slightly softer edges
        plantLight.decay = 1.0;
        plantLight.distance = 12;  // Increased distance since light is further away
        plantLight.castShadow = true;
        
        // Configure shadow properties
        plantLight.shadow.mapSize.width = 2048;
        plantLight.shadow.mapSize.height = 2048;
        plantLight.shadow.camera.near = 0.1;
        plantLight.shadow.camera.far = 15;
        plantLight.shadow.bias = -0.0001;
        plantLight.shadow.radius = 1;
        
        this.objects.add(plantLight);
        this.objects.add(plantLight.target);
    }
    
    createPerson() {
        // Create a group for the person
        const person = new THREE.Group();
        
        // Material for skin tone
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xffdbac,
            roughness: 0.5,
            metalness: 0.1
        });
        
        // Material for clothing
        const shirtMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,  // Dark blue
            roughness: 0.8,
            metalness: 0.1
        });
        
        const pantsMaterial = new THREE.MeshStandardMaterial({
            color: 0x34495e,  // Darker blue
            roughness: 0.8,
            metalness: 0.1
        });

        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 32, 32),
            skinMaterial
        );
        head.position.y = 1.6;
        person.add(head);

        // Neck
        const neck = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.07, 0.1, 32),
            skinMaterial
        );
        neck.position.y = 1.45;
        person.add(neck);

        // Torso
        const torso = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.15, 0.6, 8),
            shirtMaterial
        );
        torso.position.y = 1.15;
        person.add(torso);

        // Right arm
        const rightArm = new THREE.Group();
        
        const upperRightArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.04, 0.3, 8),
            shirtMaterial
        );
        upperRightArm.position.y = -0.15;
        rightArm.add(upperRightArm);
        
        const lowerRightArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.03, 0.3, 8),
            skinMaterial
        );
        lowerRightArm.position.y = -0.45;
        rightArm.add(lowerRightArm);
        
        rightArm.position.set(0.25, 1.3, 0);
        rightArm.rotation.z = -0.2;
        person.add(rightArm);

        // Left arm
        const leftArm = new THREE.Group();
        
        const upperLeftArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.04, 0.3, 8),
            shirtMaterial
        );
        upperLeftArm.position.y = -0.15;
        leftArm.add(upperLeftArm);
        
        const lowerLeftArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.03, 0.3, 8),
            skinMaterial
        );
        lowerLeftArm.position.y = -0.45;
        leftArm.add(lowerLeftArm);
        
        leftArm.position.set(-0.25, 1.3, 0);
        leftArm.rotation.z = 0.2;
        person.add(leftArm);

        // Legs
        const rightLeg = new THREE.Group();
        
        const upperRightLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.06, 0.4, 8),
            pantsMaterial
        );
        upperRightLeg.position.y = -0.2;
        rightLeg.add(upperRightLeg);
        
        const lowerRightLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.05, 0.4, 8),
            pantsMaterial
        );
        lowerRightLeg.position.y = -0.6;
        rightLeg.add(lowerRightLeg);
        
        rightLeg.position.set(0.1, 0.85, 0);
        person.add(rightLeg);

        const leftLeg = new THREE.Group();
        
        const upperLeftLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.06, 0.4, 8),
            pantsMaterial
        );
        upperLeftLeg.position.y = -0.2;
        leftLeg.add(upperLeftLeg);
        
        const lowerLeftLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.05, 0.4, 8),
            pantsMaterial
        );
        lowerLeftLeg.position.y = -0.6;
        leftLeg.add(lowerLeftLeg);
        
        leftLeg.position.set(-0.1, 0.85, 0);
        person.add(leftLeg);

        // Position the person in the room
        person.position.set(1.5, 0, -1);  // Near the desks
        person.rotation.y = -Math.PI / 4;  // Slightly turned

        // Enable shadows for all parts
        person.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        this.objects.add(person);
        this.person = person;  // Store reference for potential animations
    }
    
    update(deltaTime) {
        // Blink server lights randomly
        if (Math.random() > 0.95) {
            this.serverLights.forEach(light => {
                if (Math.random() > 0.7) {
                    light.material.color.setHex(Math.random() > 0.5 ? 0x00ff00 : 0xff0000);
                }
            });
        }
    }
} 