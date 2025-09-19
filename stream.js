// Check if user has collected all badges
const collectedBadges = JSON.parse(localStorage.getItem('collectedBadges') || '[]');

if (collectedBadges.length < 5) {
    document.getElementById('accessDenied').style.display = 'block';
} else {
    initializeStream();
}

function initializeStream() {
    // Display collected badges
    const badgeInventory = document.getElementById('badgeInventory');
    badgeInventory.innerHTML = collectedBadges.map(badge => `${badge.icon} ${badge.name}`).join('<br>');

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, (window.innerWidth - 20) / (window.innerHeight - 20), 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x0a0a0a, 0.2);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(15, 15, 8);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Achievement stream
    const streamGeometry = new THREE.CylinderGeometry(0.3, 0.3, 25, 16);
    const streamMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x4CAF50,
        transparent: true,
        opacity: 0.8
    });
    const stream = new THREE.Mesh(streamGeometry, streamMaterial);
    stream.rotation.z = Math.PI / 2;
    scene.add(stream);

    // Hotspots for badge placement
    const hotspots = [];
    const achievements = [
        { name: 'Mars Mission 2014', icon: '🚀', event: 'Mangalyaan reached Mars orbit - First country to succeed on first attempt!', position: new THREE.Vector3(-8, 2, 0) },
        { name: 'Digital Payments 2016', icon: '💳', event: 'UPI revolutionized digital payments in India!', position: new THREE.Vector3(-4, -1, 1) },
        { name: 'Vaccination Drive 2021', icon: '💉', event: 'World\'s largest vaccination drive - 2+ billion doses!', position: new THREE.Vector3(0, 1.5, -1) },
        { name: 'Solar Power 2022', icon: '☀️', event: '4th largest renewable energy capacity globally!', position: new THREE.Vector3(4, -0.5, 0.5) },
        { name: 'Startup Hub 2023', icon: '🦄', event: '100+ unicorn startups - 3rd largest ecosystem!', position: new THREE.Vector3(8, 0.8, -0.5) }
    ];

    achievements.forEach((achievement, index) => {
        const geometry = new THREE.SphereGeometry(0.6, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xff6b35,
            transparent: true,
            opacity: 0.9,
            emissive: 0xff6b35,
            emissiveIntensity: 0.2
        });
        const hotspot = new THREE.Mesh(geometry, material);
        hotspot.position.copy(achievement.position);
        hotspot.userData = { achievement, placed: false };
        
        scene.add(hotspot);
        hotspots.push(hotspot);
    });

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hotspots);
        
        if (intersects.length > 0) {
            const hotspot = intersects[0].object;
            if (!hotspot.userData.placed) {
                hotspot.userData.placed = true;
                hotspot.material.color.setHex(0x00ff00);
                showAchievementModal(hotspot.userData.achievement);
            }
        }
    }

    window.addEventListener('click', onMouseClick);

    // Camera controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    camera.position.set(0, 3, 12);
    controls.update();

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        const time = Date.now() * 0.001;
        hotspots.forEach((hotspot, index) => {
            const scale = 1 + Math.sin(time * 2 + index) * 0.1;
            hotspot.scale.setScalar(scale);
            hotspot.position.y += Math.sin(time * 1.5 + index) * 0.002;
        });
        
        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = (window.innerWidth - 20) / (window.innerHeight - 20);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
    });
}

function showAchievementModal(achievement) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 60px; margin-bottom: 10px;">${achievement.icon}</div>
            <h2 style="color: #000080; margin-bottom: 10px; font-size: 28px;">${achievement.name}</h2>
            <div style="background: linear-gradient(135deg, #ff6b35, #138808); color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: bold;">BADGE PLACED!</div>
        </div>
        <div style="width: 100%; height: 300px; background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%); border: 3px dashed #ff6b35; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; border-radius: 15px;">
            <div style="text-align: center; color: #666;">
                <div style="font-size: 48px; margin-bottom: 10px;">📹</div>
                <div style="font-size: 18px; font-weight: bold;">Video Placeholder</div>
                <div style="font-size: 14px; margin-top: 5px; color: #ff6b35;">Documentary about ${achievement.name}</div>
            </div>
        </div>
        <p style="color: #555; line-height: 1.6; font-size: 16px;">${achievement.event}</p>
    `;
    
    document.getElementById('achievementModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('achievementModal').style.display = 'none';
}