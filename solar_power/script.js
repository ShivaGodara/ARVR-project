// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Enhanced Lighting - Solar themed
const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffd700, 2.5);
sunLight.position.set(10, 10, 5);
scene.add(sunLight);

const pointLight = new THREE.PointLight(0xffd700, 1.5, 100);
pointLight.position.set(0, 0, 10);
scene.add(pointLight);

// Stars background
const starsGeometry = new THREE.BufferGeometry();
const starsVertices = [];
for (let i = 0; i < 500; i++) {
    starsVertices.push(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400
    );
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// GLB Loader
const loader = new THREE.GLTFLoader();


let sunModel = null;
let viewerScene, viewerCamera, viewerRenderer, viewerPanel;
let isViewerActive = false;



// Load Sun and Solar Flares model for background
loader.load('sun_and_solar_flares.glb', (gltf) => {
    sunModel = gltf.scene;
    sunModel.scale.set(0.01, 0.01, 0.01);
    sunModel.position.set(0, 0, -5);
    scene.add(sunModel);
}, undefined, (error) => {
    console.log('Sun model not found');
});







// Camera positioning
camera.position.set(0, 0, 0);

// Scroll animation
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = scrollY / maxScroll;
    
    // Scale sun model based on scroll
    if (sunModel) {
        const scale = 0.01 + (scrollProgress * 0.2);
        sunModel.scale.set(scale, scale, scale);
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Slowly rotate stars
    stars.rotation.y += 0.0002;
    stars.rotation.x += 0.0001;
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

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
    
    // Load solar panel for viewer
    loader.load('solar_panel.glb', (gltf) => {
        viewerPanel = gltf.scene;
        viewerPanel.scale.set(0.01, 0.01, 0.01);
        viewerPanel.position.set(0, 0, 0);
        viewerScene.add(viewerPanel);
    });
    
    viewerCamera.position.set(0, 0, 5);
    
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
        if (viewerPanel) {
            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };
            
            if (isDragging) {
                viewerPanel.rotation.y += deltaMove.x * 0.01;
                viewerPanel.rotation.x += deltaMove.y * 0.01;
            } else if (isRightDragging) {
                viewerPanel.position.x += deltaMove.x * 0.001;
                viewerPanel.position.y -= deltaMove.y * 0.001;
            }
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
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
        const zoom = e.deltaY * 0.001;
        viewerCamera.position.z += zoom;
        viewerCamera.position.z = Math.max(1, Math.min(10, viewerCamera.position.z));
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