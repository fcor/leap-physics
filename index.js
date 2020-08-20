var camera, scene, renderer, hands;

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
  // scene.background = new THREE.Color("skyblue");
  // scene.fog = new THREE.Fog(0xa0a0a0, 6, 1000);

  // Ground
  var floorMat = new THREE.MeshPhongMaterial({
    color: 0x156289,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    shading: THREE.FlatShading,
  });

  var floorGeometry = new THREE.PlaneGeometry(500, 500);
  var floorMesh = new THREE.Mesh(floorGeometry, floorMat);
  floorMesh.receiveShadow = true;
  floorMesh.rotation.x = -Math.PI / 2.0;
  floorMesh.position.set(0, 100, 0);
  scene.add(floorMesh);

  // Lights
  var light1 = new THREE.HemisphereLight(0xffffff, 0x424242, 1);
  var light2 = new THREE.PointLight(0xffffff, 0.3, 0);
  light2.position.set(0, 500, 500);
  // light2.castShadow = true;
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

  // Hands
  var sphereGeometry = new THREE.SphereGeometry(4, 32, 32);
  var material = new THREE.MeshPhongMaterial({
    color: 0x440381,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    shading: THREE.FlatShading,
  });
  hands = new THREE.Object3D();
  for (var i = 0; i < 10; i++) {
    var dip = new THREE.Mesh(sphereGeometry, material);
    dip.castShadow = true;
    hands.add(dip);
  }
  scene.add(hands);

  // Cubes
  var boxGeometry = new THREE.BoxGeometry(50, 100, 50);
  var boxMaterial =  new THREE.MeshPhongMaterial({
    color: 0x45F481,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    shading: THREE.FlatShading,
  });
  var cube = new THREE.Mesh(boxGeometry, boxMaterial);
  cube.position.set(0, 160, -30);
  cube.rotation.y =  45;
  cube.castShadow = true;
  cube.name = "Cube";
  scene.add(cube);

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
  render();
}

function render() {
  renderer.render(scene, camera);
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
