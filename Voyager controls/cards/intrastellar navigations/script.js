setDatabaseValue("physics.movingObjects",undefined);
var scene, camera, renderer;

var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;

var movingObjects = [];
var canvasElements = [];

function init() {
    scene = new THREE.Scene();

    initLights();
    initCamera();
    initRenderer();
    var screenWidth = $(document).width();
    var screenHeight = $(document).height();

    renderer.domElement.style.width = screenWidth;
    renderer.domElement.style.height = screenHeight;
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.left = "0px";

    camera.aspect = screenWidth / screenHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( screenWidth, screenHeight );

    document.body.appendChild(renderer.domElement);
    onDatabaseValueChange("physics.movingObjects",function(newData){
        if(newData == null || newData == undefined){
            initMesh(0,0,0,.1,0,0,0,0,0);
            initMesh(0,0,0,0,.1,0,0,0,0);
            initMesh(0,0,0,.4,.2,0,0,0,0);
            return;
        }
        movingObjects = newData;
        for(var i = 0; i < movingObjects.length; i++){
            if(i == canvasElements.length){
                var geometry = new THREE.SphereGeometry( 5, 32, 32 );
                var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
                var sphere = new THREE.Mesh( geometry, material );
                scene.add( sphere );
                canvasElements.splice(i,0,sphere);
                setInterval(runPhysicsForObject,100,movingObjects[i],canvasElements[i]);
            }
        }
    });
}

function runPhysicsForObject(object,canvasElement){
    var indexOfObjectInArray;
    for(var i = 0; i < movingObjects.length;i++){
        if(movingObjects[i] == object){
            indexOfObjectInArray = i;
        }
    }
    object.xVelocity += object.xAcceleration;
    object.yVelocity += object.yAcceleration;
    object.zVelocity += object.zAcceleration;
    object.xPos = object.xPos + object.xVelocity;
    object.yPos = object.yPos + object.yVelocity;
    object.zPos = object.zPos + object.zVelocity;
    canvasElement.translateX(object.xVelocity);
    canvasElement.translateY(object.yVelocity);
    canvasElement.translateZ(object.zVelocity);
    movingObjects.splice(indexOfObjectInArray,1,object);

    if((object.xAcceleration != 0 || object.yAcceleration != 0 || object.zAcceleration != 0) && (object.xVelocity != 0 || object.yVelocity != 0 || object.zVelocity != 0)){
        console.log(movingObjects[0]);
        setDatabaseValue("physics.movingObjects",movingObjects);
    }
}



function initLights() {
    var light = new THREE.AmbientLight(0xffffff);
    scene.add(light);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 1, 1010);
    camera.position.set(0, 1000, 0);
    camera.lookAt(scene.position);
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
}

var mesh = null;
function initMesh(xPos,yPos,zPos,xAcceleration,yAcceleration,zAcceleration,xVelocity,yVelocity,zVelocity) {
    var genericObject = {
        "xPos" : xPos,
        "yPos" : yPos,
        "zPos" : zPos,
        "xAcceleration" : xAcceleration,
        "yAcceleration" : yAcceleration,
        "zAcceleration" : zAcceleration,
        "xVelocity" : xVelocity,
        "yVelocity" : yVelocity,
        "zVelocity" : zVelocity
    }
    movingObjects.splice(movingObjects.length,0,genericObject)
    setDatabaseValue("physics.movingObjects",genericObject);
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

init();
render();