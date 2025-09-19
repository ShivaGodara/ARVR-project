// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.antialias = true;
renderer.alpha = true;
renderer.setClearColor(0x0a0a0a, 0.2);
document.body.appendChild(renderer.domElement);

// Enhanced canvas styling with patriotic theme
renderer.domElement.style.background = 'radial-gradient(ellipse at center, rgba(255,107,53,0.15) 0%, rgba(0,0,128,0.05) 50%, transparent 70%)';
renderer.domElement.style.margin = '10px';
renderer.domElement.style.borderRadius = '15px';

// Enhanced lighting setup
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(10, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.8);
scene.add(hemisphereLight);

// Add colored accent lights
const accentLight1 = new THREE.PointLight(0xff6b35, 0.5, 20);
accentLight1.position.set(-10, 5, 0);
scene.add(accentLight1);

const accentLight2 = new THREE.PointLight(0x75c043, 0.5, 20);
accentLight2.position.set(10, 5, 0);
scene.add(accentLight2);

// Animate accent lights
function animateLights(time) {
    accentLight1.intensity = 0.5 + Math.sin(time * 0.001) * 0.2;
    accentLight2.intensity = 0.5 + Math.cos(time * 0.001) * 0.2;
    
    accentLight1.position.y = 5 + Math.sin(time * 0.002) * 2;
    accentLight2.position.y = 5 + Math.cos(time * 0.002) * 2;
}

// Achievement Stream System
const achievements = [];
const hotspots = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const hotspotInfo = document.getElementById('hotspot-info');
let videoModal = null;

// Create flowing stream of achievements
function createAchievementStream() {
    const streamGeometry = new THREE.CylinderGeometry(0.1, 0.1, 20, 8);
    const streamMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x4CAF50,
        transparent: true,
        opacity: 0.6
    });
    const stream = new THREE.Mesh(streamGeometry, streamMaterial);
    stream.rotation.z = Math.PI / 2;
    scene.add(stream);
    
    // Flowing particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({ 
        color: 0xFFEB3B,
        size: 0.05
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    return { stream, particles };
}

function createVideoModal() {
    const modal = document.createElement('div');
    modal.id = 'video-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        backdrop-filter: blur(5px);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    // Add CSS for modal animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes modalSlideIn {
            from { transform: scale(0.8) translateY(20px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,249,250,0.95) 100%);
        padding: 30px;
        border-radius: 20px;
        max-width: 80%;
        max-height: 80%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.2);
        backdrop-filter: blur(10px);
        animation: modalSlideIn 0.4s ease-out;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        position: absolute;
        top: 15px;
        right: 20px;
        background: rgba(255,107,53,0.1);
        border: 2px solid #ff6b35;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 20px;
        cursor: pointer;
        color: #ff6b35;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = '#ff6b35';
        closeBtn.style.color = 'white';
        closeBtn.style.transform = 'scale(1.1)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255,107,53,0.1)';
        closeBtn.style.color = '#ff6b35';
        closeBtn.style.transform = 'scale(1)';
    });
    
    closeBtn.onclick = () => {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => modal.style.display = 'none', 300);
    };
    modal.onclick = (e) => { 
        if (e.target === modal) {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => modal.style.display = 'none', 300);
        }
    };
    
    // Add fadeOut animation
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(fadeOutStyle);
    
    modal.appendChild(content);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
    
    return { modal, content };
}

function createHotspot(position, title, description, videoPlaceholder) {
    // Main hotspot sphere - larger size
    const geometry = new THREE.SphereGeometry(0.6, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0xff6b35,
        transparent: true,
        opacity: 0.9,
        emissive: 0xff6b35,
        emissiveIntensity: 0.2
    });
    const hotspot = new THREE.Mesh(geometry, material);
    hotspot.position.copy(position);
    hotspot.userData = { title, description, videoPlaceholder, isHotspot: true };
    
    // Add multiple glowing rings for more impact
    const ring1Geometry = new THREE.RingGeometry(0.8, 1.0, 32);
    const ring1Material = new THREE.MeshBasicMaterial({ 
        color: 0xFFEB3B,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    const ring1 = new THREE.Mesh(ring1Geometry, ring1Material);
    
    const ring2Geometry = new THREE.RingGeometry(1.2, 1.4, 32);
    const ring2Material = new THREE.MeshBasicMaterial({ 
        color: 0x75c043,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    
    hotspot.add(ring1);
    hotspot.add(ring2);
    
    scene.add(hotspot);
    hotspots.push(hotspot);
    return hotspot;
}

// Mouse events
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(hotspots);
    
    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        const hotspot = intersects[0].object;
        hotspotInfo.innerHTML = `<div style="font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #FFD700;">${hotspot.userData.title}</div><div style="font-size: 14px; margin-bottom: 8px;">${hotspot.userData.description}</div><div style="font-size: 12px; font-style: italic; color: #FFD700;">🎬 Click to view video</div>`;
        hotspotInfo.style.display = 'block';
        hotspotInfo.style.left = event.clientX + 10 + 'px';
        hotspotInfo.style.top = event.clientY + 10 + 'px';
    } else {
        document.body.style.cursor = 'default';
        hotspotInfo.style.display = 'none';
    }
}

function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(hotspots);
    
    if (intersects.length > 0) {
        const hotspot = intersects[0].object;
        showVideoModal(hotspot.userData);
    }
}

let discoveredAchievements = 0;

function showVideoModal(data) {
    if (!videoModal) {
        videoModal = createVideoModal();
    }
    
    // Update achievement counter
    if (!data.discovered) {
        discoveredAchievements++;
        data.discovered = true;
        document.getElementById('achievement-count').textContent = `${discoveredAchievements}/5`;
        playDiscoverySound();
    }
    
    videoModal.content.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 60px; margin-bottom: 10px; animation: bounce 1s ease-out;">${getAchievementIcon(data.title)}</div>
            <h2 style="color: #000080; margin-bottom: 10px; animation: fadeInUp 0.5s ease-out; font-size: 28px;">${data.title}</h2>
            <div style="background: linear-gradient(135deg, #ff6b35, #138808); color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: bold;">ACHIEVEMENT UNLOCKED!</div>
        </div>
        <div style="width: 100%; height: 350px; background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%); border: 3px dashed #ff6b35; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; border-radius: 15px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shimmer 2s infinite;"></div>
            <div style="text-align: center; color: #666; z-index: 1;">
                <div style="font-size: 64px; margin-bottom: 15px; animation: bounce 2s infinite;">📹</div>
                <div style="font-size: 22px; font-weight: bold; margin-bottom: 10px;">Video Placeholder</div>
                <div style="font-size: 16px; color: #ff6b35; font-weight: 600;">${data.videoPlaceholder}</div>
            </div>
        </div>
        <p style="color: #555; line-height: 1.8; font-size: 16px; animation: fadeInUp 0.5s ease-out 0.2s both;">${data.description}</p>
        <style>
            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
        </style>
    `;
    
    videoModal.modal.style.display = 'flex';
    videoModal.modal.style.animation = 'fadeIn 0.3s ease-out';
}

function getAchievementIcon(title) {
    const icons = {
        'Mars Mission Success': '🚀',
        'Digital Payment Revolution': '💳',
        'World\'s Largest Vaccination Drive': '🏥',
        'Renewable Energy Leader': '🌱',
        'Startup Unicorn Hub': '🦄'
    };
    return icons[title] || '🎆';
}

function playDiscoverySound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Initialize ambient background noise
function initBackgroundNoise() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.005, audioContext.currentTime);
    
    whiteNoise.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    document.addEventListener('click', () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
            whiteNoise.start();
        }
    }, { once: true });
}

initBackgroundNoise();

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('click', onMouseClick);

// Initialize achievement stream
const streamSystem = createAchievementStream();

// Enhanced visual effects
function addVisualEnhancements() {
    // Create background stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 200;
    const starPositions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 100;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ 
        color: 0xFFFFFF,
        size: 0.1,
        transparent: true,
        opacity: 0.6
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    return stars;
}

// Audio system for 3D environment
function initAudio() {
    const listener = new THREE.AudioListener();
    camera.add(listener);
    
    // Ambient sound placeholder
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    
    // Note: Add actual audio file when available
    // audioLoader.load('ambient-sound.mp3', function(buffer) {
    //     sound.setBuffer(buffer);
    //     sound.setLoop(true);
    //     sound.setVolume(0.1);
    //     sound.play();
    // });
    
    return { listener, sound };
}

const stars = addVisualEnhancements();
const audioSystem = initAudio();

// Create achievement hotspots
createHotspot(
    new THREE.Vector3(-8, 2, 0), 
    'Mars Mission Success', 
    'Mangalyaan made India the first nation to reach Mars orbit in the first attempt, showcasing our space technology excellence.',
    'ISRO Mars Mission Documentary - 15 minutes'
);

createHotspot(
    new THREE.Vector3(-4, -1, 1), 
    'Digital Payment Revolution', 
    'UPI transformed India into a cashless economy leader with over 8 billion monthly transactions, inspiring global adoption.',
    'UPI Success Story Video - 12 minutes'
);

createHotspot(
    new THREE.Vector3(0, 1.5, -1), 
    'World\'s Largest Vaccination Drive', 
    'Administered over 2 billion COVID-19 vaccine doses, demonstrating unprecedented healthcare logistics and digital infrastructure.',
    'Vaccination Drive Documentary - 18 minutes'
);

createHotspot(
    new THREE.Vector3(4, -0.5, 0.5), 
    'Renewable Energy Leader', 
    '4th largest renewable energy capacity globally, with ambitious targets for solar and wind power expansion by 2030.',
    'Green Energy Revolution Video - 14 minutes'
);

createHotspot(
    new THREE.Vector3(8, 0.8, -0.5), 
    'Startup Unicorn Hub', 
    '3rd largest startup ecosystem worldwide with 100+ unicorns, driving innovation in fintech, edtech, and e-commerce.',
    'Indian Startup Success Stories - 16 minutes'
);

// Camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Camera position with smooth intro
camera.position.set(0, 8, 15);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.update();

// Smooth camera intro animation
function animateCameraIntro() {
    const targetPosition = { x: 0, y: 3, z: 12 };
    const startPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const duration = 3000;
    const startTime = Date.now();
    
    function updateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easeProgress;
        camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easeProgress;
        camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeProgress;
        
        if (progress < 1) {
            requestAnimationFrame(updateCamera);
        } else {
            controls.autoRotate = false; // Stop auto-rotation after intro
        }
    }
    
    updateCamera();
}

// Start camera animation after a short delay
setTimeout(animateCameraIntro, 1000);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = (window.innerWidth - 20) / (window.innerHeight - 20);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // Animate lights
    animateLights(Date.now());
    
    // Animate hotspots
    hotspots.forEach((hotspot, index) => {
        const scale = 1 + Math.sin(time * 2 + index) * 0.15;
        hotspot.scale.setScalar(scale);
        
        // Rotate rings
        if (hotspot.children[0]) {
            hotspot.children[0].rotation.z += 0.02;
        }
        
        // Floating motion
        hotspot.position.y += Math.sin(time + index) * 0.002;
    });
    
    // Animate stream particles
    if (streamSystem.particles) {
        const positions = streamSystem.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += 0.02; // Flow direction
            if (positions[i] > 10) positions[i] = -10; // Reset position
            
            // Add vertical wave motion
            positions[i + 1] += Math.sin(time + positions[i]) * 0.001;
        }
        streamSystem.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate background stars
    if (stars) {
        stars.rotation.x += 0.0005;
        stars.rotation.y += 0.0002;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Add loading screen fade out
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});