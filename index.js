var camera,
  scene,
  renderer,
  hands,
  world,
  cube,
  cubeBody,
  atom,
  atoms,
  cylinders;
var timestep = 1 / 60;
var handBodies = [];
var atomBodies = [];
var bodies = [];
var meshes = [];
var cylinderBodies = [];
var atomCoords = [
  new THREE.Vector3(57.6, 195.89, -40.0),
  new THREE.Vector3(16.38, 216.08, -40.0),
  new THREE.Vector3(-16.38, 183.92, -40.0),
  new THREE.Vector3(-57.6, 204.11, -40.0),
];

var cylinder, cylinderBody;
var cannonDebugRenderer;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 250, 300);
  camera.lookAt(new THREE.Vector3(0, 250, 0));

  scene = new THREE.Scene();

  world = new CANNON.World();
  world.gravity.set(0, -100, 0);

  // cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);

  // Lights
  var light1 = new THREE.HemisphereLight(0xffffff, 0x424242, 1);
  var light2 = new THREE.PointLight(0xffffff, 0.3, 0);
  light2.position.set(0, 500, 500);
  light2.shadow.mapSize = new THREE.Vector2(2048, 2048);
  var light3 = new THREE.PointLight(0xffffff, 0.2, 0);
  light3.position.y = 500;
  light3.castShadow = true;
  light3.shadow.mapSize = new THREE.Vector2(2048, 2048);
  scene.add(light1);
  scene.add(light2);
  scene.add(light3);

  // Sky
  var sky = new THREE.Mesh(
    new THREE.SphereGeometry(500, 32, 32),
    new THREE.MeshLambertMaterial({
      color: "skyblue",
      side: THREE.BackSide,
    })
  );
  sky.position.y = 400;
  scene.add(sky);

  addHands();
  addPlane();
  // addCylinder();
  // addCube();
  addMolecule();

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  document.getElementById("three-output").appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  world.step(timestep);
  updateMeshPositions();
  // cannonDebugRenderer.update();
}

Leap.loop(function (frame) {
  if (frame.hands.length) {
    for (var i = frame.hands.length - 1; i >= 0; i--) {
      for (var j = frame.hands[i].fingers.length - 1; j >= 0; j--) {
        var dip = frame.hands[i].fingers[j].dipPosition;
        hands.children[5 * i + j].position.fromArray(dip);
      }
    }
  }
});

function cylindricalSegment(A, B) {
  var vec = B.clone();
  vec.sub(A);
  var h = vec.length();
  vec.normalize();
  var quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec);
  var cylinderGeometry = new THREE.CylinderGeometry(3.5, 3.5, h, 32);
  var cylinderMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    shading: THREE.FlatShading,
  });
  cylinderGeometry.translate(0, h / 2, 0);
  var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.applyQuaternion(quaternion);
  cylinder.position.set(A.x, A.y, A.z);

  return cylinder;
}

function addPlane() {
  // Physics
  var shape = new CANNON.Plane();
  var body = new CANNON.Body({ mass: 0 });
  body.addShape(shape);

  body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  body.position.set(0, 100, 0);
  world.addBody(body);
  bodies.push(body);

  // Graphics
  var material = new THREE.MeshPhongMaterial({
    color: 0x156289,
    emissive: 0x072534,
    shading: THREE.FlatShading,
  });
  var geometry = new THREE.PlaneGeometry(500, 500);
  var mesh = new THREE.Mesh(geometry, material);
  mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  mesh.receiveShadow = true;
  scene.add(mesh);
  meshes.push(mesh);
}

function addCylinder() {
  // Physics
  var shape = new CANNON.Cylinder(10, 10, 50, 10);
  var body = new CANNON.Body({
    mass: 10,
  });

  var quat = new CANNON.Quaternion(0.5, 0, 0, 0.5);
  quat.normalize();
  body.addShape(shape, new CANNON.Vec3(), quat);
  body.position.set(0, 190, -40);
  world.addBody(body);
  bodies.push(body);

  // Graphics
  var geometry = new THREE.CylinderGeometry(10, 10, 50, 20);
  var material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x072534,
    shading: THREE.FlatShading,
  });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.name = "Cylinder";
  scene.add(mesh);
  meshes.push(mesh);
}

function addCube() {
  // Physics
  var shape = new CANNON.Box(new CANNON.Vec3(25, 50, 25));
  var body = new CANNON.Body({ mass: 50 });
  body.addShape(shape);
  body.position.set(0, 190, -40);
  world.addBody(body);
  bodies.push(body);

  // Graphics
  var geometry = new THREE.BoxGeometry(50, 100, 50);
  var material = new THREE.MeshPhongMaterial({
    color: 0x45f481,
    emissive: 0x072534,
    shading: THREE.FlatShading,
  });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.name = "Cube";
  scene.add(mesh);
  meshes.push(mesh);
}

function addHands() {
  // Physics
  var sphereShape = new CANNON.Sphere(4);
  for (var i = 0; i < 10; i++) {
    handBodies.push(new CANNON.Body({ mass: 0, shape: sphereShape }));
  }

  for (var i = handBodies.length - 1; i >= 0; i--) {
    world.add(handBodies[i]);
  }

  // Graphics
  hands = new THREE.Object3D();
  var sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  var material = new THREE.MeshPhongMaterial({
    color: 0x440381,
    emissive: 0x072534,
    shading: THREE.FlatShading,
  });

  for (var i = 0; i < 10; i++) {
    var dip = new THREE.Mesh(sphereGeometry, material);
    dip.castShadow = true;
    dip.scale.setScalar(4);
    hands.add(dip);
  }
  scene.add(hands);
}

function addMolecule() {
  atoms = new THREE.Object3D();
  cylinders = new THREE.Object3D();
  var atomMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    shading: THREE.FlatShading,
  });
  var atomGeometry = new THREE.SphereGeometry(10, 32, 32);

  var sphereShape = new CANNON.Sphere(10);
  for (var i = 0; i < atomCoords.length; i++) {
    var atom = new THREE.Mesh(atomGeometry, atomMaterial);
    atom.castShadow = true;
    atom.position.set(atomCoords[i].x, atomCoords[i].y, atomCoords[i].z);
    atoms.add(atom);
    meshes.push(atom);

    var sphereBody = new CANNON.Body({
      mass: 10,
      shape: sphereShape,
    });
    sphereBody.position.copy(atom.position);
    bodies.push(sphereBody);
    world.addBody(sphereBody);
  }

  var bond1 = cylindricalSegment(atomCoords[0], atomCoords[1]);
  var bond2 = cylindricalSegment(atomCoords[1], atomCoords[2]);
  var bond3 = cylindricalSegment(atomCoords[1], atomCoords[3]);

  bond1.castShadow = true;
  bond2.castShadow = true;
  bond3.castShadow = true;

  cylinders.add(bond1);
  cylinders.add(bond2);
  cylinders.add(bond3);

  scene.add(atoms);
  scene.add(cylinders);
}

// This function called during render will sync graphics & physics
function updateMeshPositions() {
  for (var i = 0; i !== meshes.length; i++) {
    meshes[i].position.copy(bodies[i].position);
    meshes[i].quaternion.copy(bodies[i].quaternion);
  }

  for (var i = handBodies.length - 1; i >= 0; i--) {
    handBodies[i].position.copy(hands.children[i].position);
  }
}
