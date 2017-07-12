var scene, camera, renderer;

var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;

var SPEED = 0.001;

function init() {
    scene = new THREE.Scene();

    initMesh();
    initLights();
    initCamera();
    initRenderer();

    renderer.domElement.style.width = "1400px";
    renderer.domElement.style.height = "1100px";
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "10px";
    renderer.domElement.style.left = "20px";

    camera.aspect = 1400 / 1100;
    camera.updateProjectionMatrix();

    renderer.setSize( 1400, 1100 );

    document.body.appendChild(renderer.domElement);
}

function initLights() {
    var light = new THREE.AmbientLight(0xffffff);
    scene.add(light);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 1, 100);
    camera.position.set(0, 10, 0);
    camera.lookAt(scene.position);
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
}

var mesh = null;
function initMesh() {
    var loader = new THREE.JSONLoader();
	loader.load('./resource?path=public/3D_Sphere.json', function(geometry, materials) {
        mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
    	//mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.75;
    	//mesh.translation = THREE.GeometryUtils.center(geometry);
    	scene.add(mesh);
    });
}

function rotateCube() {
    if (!mesh) {
        return;
    }

    //cube.rotation.x -= SPEED * 2;
    mesh.rotation.y -= SPEED;
    mesh.rotation.x -= SPEED * 2;
    mesh.rotation.z -= SPEED / 2;

    //cube.rotation.z -= SPEED * 3;
}

function render() {
    renderer.setClearColor (0x000000, 1);
    renderer.clear();
    rotateCube();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

init();
render();

var theta;
var phi;
