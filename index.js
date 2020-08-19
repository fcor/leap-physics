var camera, scene, renderer;

var material = new THREE.MeshPhongMaterial({
  color: 0x156289,
  emissive: 0x072534,
  side: THREE.DoubleSide,
  shading: THREE.FlatShading,
});

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(-2, 2, 2.3);

  scene = new THREE.Scene();
  scene.background = new THREE.Color("skyblue");
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
  scene.add(floorMesh);

  var light1 = new THREE.HemisphereLight(0xffffff, 0x424242, 1);
	var light2 = new THREE.PointLight(0xffffff, 0.3, 0);
	light2.position.set(0,500,500);
	// light2.castShadow = true;
	light2.shadow.mapSize = new THREE.Vector2(2048, 2048);
	var light3 =  new THREE.PointLight(0xffffff, 0.2, 0);
	light3.position.y = 500;
	light3.castShadow = true;
	light3.shadow.mapSize = new THREE.Vector2(2048, 2048);
	scene.add(light1);
	scene.add(light2);
	scene.add(light3);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.toneMapping = THREE.ReinhardToneMapping;
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
