// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Enhanced Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(10, 10, 5);
scene.add(directionalLight);

// Background particles (representing vaccine doses)
const particlesGeometry = new THREE.BufferGeometry();
const particlesVertices = [];
const particlesColors = [];

for (let i = 0; i < 3000; i++) {
    particlesVertices.push(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
    );
    
    // Green colors for vaccine particles
    particlesColors.push(0, 0.8, 0.3);
}

particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlesVertices, 3));
particlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(particlesColors, 3));

const particlesMaterial = new THREE.PointsMaterial({ 
    size: 2, 
    vertexColors: true,
    transparent: true,
    opacity: 0.8
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Load COVID vaccine model for background
const loader = new THREE.GLTFLoader();
let vaccineModel = null;

loader.load('covid_vaccine.glb', (gltf) => {
    vaccineModel = gltf.scene;
    vaccineModel.scale.set(0.5, 0.5, 0.5);
    vaccineModel.position.set(0, -2, -5);
    scene.add(vaccineModel);
}, undefined, (error) => {
    console.log('Vaccine model not found');
});

// Vaccination centers (glowing dots)
const centers = [];
for (let i = 0; i < 50; i++) {
    const centerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const centerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.8
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    
    center.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        -8 + Math.random() * 4
    );
    
    centers.push(center);
    scene.add(center);
}

// Camera positioning
camera.position.set(0, 0, 0);



// Scroll animation
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = scrollY / maxScroll;
    
    // Scale vaccine model based on scroll
    if (vaccineModel) {
        const scale = 0.5 + (scrollProgress * 1);
        vaccineModel.scale.set(scale, scale, scale);
    }
    
    // Animate vaccination centers
    centers.forEach((center, index) => {
        const phase = (index / centers.length) * Math.PI * 2;
        center.material.opacity = 0.5 + 0.5 * Math.sin(scrollProgress * 10 + phase);
    });
});

// Interactive viewer setup
let viewerScene, viewerCamera, viewerRenderer;
let isViewerActive = false;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate particles slowly
    particles.rotation.y += 0.001;
    particles.rotation.x += 0.0005;
    
    // Pulse vaccination centers
    const time = Date.now() * 0.001;
    centers.forEach((center, index) => {
        const phase = (index / centers.length) * Math.PI * 2;
        center.scale.setScalar(1 + 0.3 * Math.sin(time * 2 + phase));
    });
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Interactive viewer initialization
function initViewer() {
    viewerScene = new THREE.Scene();
    viewerCamera = new THREE.PerspectiveCamera(75, 800/600, 0.1, 1000);
    viewerRenderer = new THREE.WebGLRenderer({ antialias: true });
    
    viewerRenderer.setSize(800, 600);
    viewerRenderer.setClearColor(0x111111);
    document.getElementById('interactive-viewer').appendChild(viewerRenderer.domElement);
    
    // Lighting for viewer
    const viewerAmbient = new THREE.AmbientLight(0x404040, 1);
    viewerScene.add(viewerAmbient);
    const viewerDirectional = new THREE.DirectionalLight(0xffffff, 1.5);
    viewerDirectional.position.set(5, 5, 5);
    viewerScene.add(viewerDirectional);
    
    // Load COVID-19 model
    const loader = new THREE.GLTFLoader();
    let covidModel = null;
    
    loader.load('covid_-_19.glb', (gltf) => {
        covidModel = gltf.scene;
        covidModel.scale.set(0.1, 0.1, 0.1);
        covidModel.position.set(0, 0, 0);
        viewerScene.add(covidModel);
        window.covidModel = covidModel; // Make globally accessible
    }, undefined, (error) => {
        console.log('COVID model not found, using fallback');
        // Fallback sphere if model fails to load
        const fallbackGeometry = new THREE.SphereGeometry(2, 32, 32);
        const fallbackMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 });
        covidModel = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        viewerScene.add(covidModel);
        window.covidModel = covidModel; // Make globally accessible
    });
    
    viewerCamera.position.set(0, 5, 8);
    viewerCamera.lookAt(0, 0, 0);
    
    // Mouse controls
    let isDragging = false;
    let isRightDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    viewerRenderer.domElement.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            isDragging = true;
        } else if (e.button === 2) {
            isRightDragging = true;
        }
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    viewerRenderer.domElement.addEventListener('mousemove', (e) => {
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };
        
        if (isDragging && window.covidModel) {
            window.covidModel.rotation.y += deltaMove.x * 0.01;
            window.covidModel.rotation.x += deltaMove.y * 0.01;
        } else if (isRightDragging && window.covidModel) {
            window.covidModel.position.x += deltaMove.x * 0.001;
            window.covidModel.position.y -= deltaMove.y * 0.001;
        }
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    viewerRenderer.domElement.addEventListener('mouseup', () => {
        isDragging = false;
        isRightDragging = false;
    });
    
    viewerRenderer.domElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    viewerRenderer.domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoom = e.deltaY * 0.01;
        viewerCamera.position.z += zoom;
        viewerCamera.position.z = Math.max(3, Math.min(15, viewerCamera.position.z));
    });
    
    isViewerActive = true;
    animateViewer();
}

function animateViewer() {
    if (!isViewerActive) return;
    requestAnimationFrame(animateViewer);
    viewerRenderer.render(viewerScene, viewerCamera);
}

// Check if viewer is in viewport
function checkViewerVisibility() {
    const viewer = document.getElementById('interactive-viewer');
    const rect = viewer.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible && !isViewerActive) {
        initViewer();
    }
}

window.addEventListener('scroll', checkViewerVisibility);

// Hotspot interactions
document.getElementById('hotspot1').addEventListener('mouseenter', () => {
    document.getElementById('tooltip1').style.display = 'block';
});

document.getElementById('hotspot1').addEventListener('mouseleave', () => {
    document.getElementById('tooltip1').style.display = 'none';
});

// Start animation
animate();