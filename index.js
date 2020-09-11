var camera, scene, renderer, dips, pips, mcps, palms, world, cylinders, atoms;
var timestep = 1 / 60;
var dipBodies = [];
var pipBodies = [];
var mcpBodies = [];
var atomBodies = [];
var palmBodies = [];
var bodies = [];
var meshes = [];
var rawAtomCoords = [
  new THREE.Vector3(1.92, -0.137, 0.0),
  new THREE.Vector3(0.546, 0.536, 0.0),
  new THREE.Vector3(-0.546, -0.536, 0.0),
  new THREE.Vector3(-1.92, 0.137, 0.0),
  new THREE.Vector3(2.021, -0.759, 0.89),
  new THREE.Vector3(2.021, -0.759, -0.89),
  new THREE.Vector3(2.699, 0.626, 0.0),
  new THREE.Vector3(0.446, 1.157, 0.89),
  new THREE.Vector3(0.446, 1.157, -0.89),
  new THREE.Vector3(-0.446, -1.157, -0.89),
  new THREE.Vector3(-0.446, -1.157, 0.89),
  new THREE.Vector3(-2.021, 0.759, 0.89),
  new THREE.Vector3(-2.021, 0.759, -0.89),
  new THREE.Vector3(-2.699, -0.626, 0.0),
];

var constraints = [
  { a: 1, b: 2, stick: true },
  { a: 1, b: 5, stick: true },
  { a: 1, b: 6, stick: true },
  { a: 1, b: 7, stick: true },
  { a: 2, b: 1, stick: true },
  { a: 2, b: 3, stick: true },
  { a: 2, b: 8, stick: true },
  { a: 2, b: 9, stick: true },
  { a: 3, b: 2, stick: true },
  { a: 3, b: 4, stick: true },
  { a: 3, b: 10, stick: true },
  { a: 3, b: 11, stick: true },
  { a: 4, b: 3, stick: true },
  { a: 4, b: 12, stick: true },
  { a: 4, b: 13, stick: true },
  { a: 4, b: 14, stick: true },
  { a: 5, b: 1, stick: true },
  { a: 6, b: 1, stick: true },
  { a: 7, b: 1, stick: true },
  { a: 8, b: 2, stick: true },
  { a: 9, b: 2, stick: true },
  { a: 10, b: 3, stick: true },
  { a: 11, b: 3, stick: true },
  { a: 12, b: 4, stick: true },
  { a: 13, b: 4, stick: true },
  { a: 14, b: 4, stick: true },
  { a: 5, b: 6, stick: false },
  { a: 6, b: 7, stick: false },
  { a: 5, b: 7, stick: false },
  { a: 2, b: 5, stick: false },
  { a: 2, b: 6, stick: false },
  { a: 2, b: 7, stick: false },
  { a: 2, b: 4, stick: false },
  { a: 2, b: 10, stick: false },
  { a: 2, b: 11, stick: false },
  { a: 12, b: 13, stick: false },
  { a: 13, b: 14, stick: false },
  { a: 12, b: 14, stick: false },
  { a: 3, b: 12, stick: false },
  { a: 3, b: 13, stick: false },
  { a: 3, b: 14, stick: false },
  { a: 3, b: 9, stick: false },
  { a: 3, b: 8, stick: false },
  { a: 3, b: 1, stick: false },
  { a: 1, b: 8, stick: false },
  { a: 1, b: 9, stick: false },
  { a: 4, b: 10, stick: false },
  { a: 4, b: 11, stick: false },
];

// This constants will control render sizes!!!
var scale = 20;
var translation = new THREE.Vector3(0, 80, -30);
var dipSize = 2;
var pipSize = 3;
var mcpSize = 3;
var palmSize = 4;
var atomRadius = 5;
var stickRadius = 2;

var cannonDebugRenderer;

var atomCoords = rawAtomCoords.map(function (atomCoord, index) {
  var atom = atomCoord;
  atom.multiplyScalar(scale);
  atom.add(translation);
  return atom;
});

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 180, 180);
  camera.lookAt(translation);

  scene = new THREE.Scene();

  world = new CANNON.World();
  world.gravity.set(0, 0, 0);

  cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);

  // Lights
  var light1 = new THREE.HemisphereLight(0xffffff, 0x424242, 1);
  var light2 = new THREE.PointLight(0xffffff, 0.3, 0);
  light2.position.set(0, 300, 300);
  light2.shadow.mapSize = new THREE.Vector2(2048, 2048);
  var light3 = new THREE.PointLight(0xffffff, 0.2, 0);
  light3.position.y = 300;
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
  cannonDebugRenderer.update();
}

Leap.loop(function (frame) {
  if (frame.hands.length) {
    for (var i = frame.hands.length - 1; i >= 0; i--) {
      var palm = frame.hands[i].palmPosition;
      palms.children[i].position.fromArray(palm).multiplyScalar(0.3);
      for (var j = frame.hands[i].fingers.length - 1; j >= 0; j--) {
        var dip = frame.hands[i].fingers[j].dipPosition;
        var pip = frame.hands[i].fingers[j].pipPosition;
        var mcp = frame.hands[i].fingers[j].mcpPosition;
        dips.children[5 * i + j].position.fromArray(dip).multiplyScalar(0.3);
        pips.children[5 * i + j].position.fromArray(pip).multiplyScalar(0.3);
        mcps.children[5 * i + j].position.fromArray(mcp).multiplyScalar(0.3);
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
  var cylinderGeometry = new THREE.CylinderGeometry(stickRadius, stickRadius, h, 32);
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
  body.position.set(0, 0, 0);
  world.addBody(body);
  bodies.push(body);

  // Graphics
  var material = new THREE.MeshPhongMaterial({
    color: 0x156289,
    emissive: 0x072534,
    shading: THREE.FlatShading,
  });
  var geometry = new THREE.PlaneGeometry(400, 400);
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
  var dipShape = new CANNON.Sphere(dipSize);
  var pipShape = new CANNON.Sphere(pipSize);
  var mcpShape = new CANNON.Sphere(mcpSize);
  var palmShape = new CANNON.Sphere(palmSize);

  for (var i = 0; i < 10; i++) {
    dipBodies.push(new CANNON.Body({ mass: 0, shape: dipShape }));
    pipBodies.push(new CANNON.Body({ mass: 0, shape: pipShape }));
    mcpBodies.push(new CANNON.Body({ mass: 0, shape: mcpShape }));
  }

  palmBodies.push(new CANNON.Body({ mass: 0, shape: palmShape }));
  palmBodies.push(new CANNON.Body({ mass: 0, shape: palmShape }));

  world.addBody(palmBodies[0]);
  world.addBody(palmBodies[1]);

  for (var i = dipBodies.length - 1; i >= 0; i--) {
    world.addBody(dipBodies[i]);
    world.addBody(pipBodies[i]);
    world.addBody(mcpBodies[i]);
  }

  // Graphics
  dips = new THREE.Object3D();
  pips = new THREE.Object3D();
  mcps = new THREE.Object3D();
  palms = new THREE.Object3D();

  var sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  var material = new THREE.MeshPhongMaterial({
    color: 0x440381,
    emissive: 0x072534,
    shading: THREE.FlatShading,
  });

  for (var i = 0; i < 10; i++) {
    var dip = new THREE.Mesh(sphereGeometry, material);
    dip.castShadow = true;
    dip.scale.setScalar(dipSize);
    dips.add(dip);

    var pip = new THREE.Mesh(sphereGeometry, material);
    pip.castShadow = true;
    pip.scale.setScalar(pipSize);
    pips.add(pip);

    var mcp = new THREE.Mesh(sphereGeometry, material);
    mcp.castShadow = true;
    mcp.scale.setScalar(mcpSize);
    mcps.add(mcp);
  }

  for (var i = 0; i < 2; i++) {
    var palm = new THREE.Mesh(sphereGeometry, material);
    palm.castShadow = true;
    palm.scale.setScalar(palmSize);
    palms.add(palm);
  }

  scene.add(dips);
  scene.add(pips);
  scene.add(mcps);
  scene.add(palms);
}

function addMolecule() {
  atoms = new THREE.Object3D();
  cylinders = new THREE.Object3D();
  var carbonMaterial = new THREE.MeshPhongMaterial({
    color: 0x909090,
    shading: THREE.FlatShading,
  });

  var hydrogenMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shading: THREE.FlatShading,
  });

  var atomGeometry = new THREE.SphereGeometry(atomRadius, 32, 32);
  var sphereShape = new CANNON.Sphere(atomRadius);

  var mass = 1;

  for (var i = 0; i < atomCoords.length; i++) {
    if (i === 2) {
      mass = 0;
    } else {
      mass = 1;
    }
    var atomMaterial = i < 4 ? carbonMaterial : hydrogenMaterial;
    var atom = new THREE.Mesh(atomGeometry, atomMaterial);
    atom.castShadow = true;
    atom.position.set(atomCoords[i].x, atomCoords[i].y, atomCoords[i].z);
    atoms.add(atom);
    meshes.push(atom);

    var sphereBody = new CANNON.Body({
      mass: mass,
      shape: sphereShape,
    });
    sphereBody.position.copy(atom.position);
    bodies.push(sphereBody);
    atomBodies.push(sphereBody);
    world.addBody(sphereBody);
  }

  for (var j = 0; j < constraints.length; j++) {
    var firstAtom = constraints[j].a - 1;
    var secondAtom = constraints[j].b - 1;

    var c = new CANNON.DistanceConstraint(
      atomBodies[firstAtom],
      atomBodies[secondAtom]
    );

    if (constraints[j].stick) {
      var bond = cylindricalSegment(
        atomCoords[firstAtom],
        atomCoords[secondAtom]
      );
      bond.castShadow = true;
      cylinders.add(bond);
    }
    world.addConstraint(c);
  }

  scene.add(atoms);
  scene.add(cylinders);
}

function updateStick(cylinder, a1, a2) {
  var A = new THREE.Vector3(a1.position.x, a1.position.y, a1.position.z);

  var B = new THREE.Vector3(a2.position.x, a2.position.y, a2.position.z);

  var vec = B.clone();
  vec.sub(A);
  var h = vec.length();
  vec.normalize();
  var quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec);
  cylinder.position.set(0, 0, 0);
  cylinder.rotation.set(0, 0, 0);
  cylinder.translateOnAxis(0, h / 2, 0);
  cylinder.applyQuaternion(quaternion);
  cylinder.position.set(A.x, A.y, A.z);
}

// This function called during render will sync graphics & physics
function updateMeshPositions() {
  for (var i = 0; i !== meshes.length; i++) {
    meshes[i].position.copy(bodies[i].position);
    meshes[i].quaternion.copy(bodies[i].quaternion);
  }

  for (var i = dipBodies.length - 1; i >= 0; i--) {
    dipBodies[i].position.copy(dips.children[i].position);
    pipBodies[i].position.copy(pips.children[i].position);
    mcpBodies[i].position.copy(mcps.children[i].position);
  }

  palmBodies[0].position.copy(palms.children[0].position);
  palmBodies[1].position.copy(palms.children[1].position);

  for (var i = 0; i < cylinders.children.length; i++) {
    var firstAtom = constraints[i].a - 1;
    var secondAtom = constraints[i].b - 1;
    updateStick(
      cylinders.children[i],
      atoms.children[firstAtom],
      atoms.children[secondAtom]
    );
  }
}
