ON_DAED["3D"].ObservacaoAnamorfica = function (scene, camera, cylinderHeight) {
    var cylinderRadius = 2;

    var mirrorCubeCamera = new THREE.CubeCamera(0.1, 5000, 512);

    mirrorCubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;

    var mirrorCubeMaterial = new THREE.MeshBasicMaterial(
            {envMap: mirrorCubeCamera.renderTarget});

    var planeHeight = 18.7 / 2;
    var planeWidth = 22.8 / 2;

    var geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    var planeMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('imgs/texturas/anamorfico/logo-polar.jpg'),
        side: THREE.DoubleSide
    }));

    planeMesh.rotation.x = -Math.PI / 2;
    planeMesh.rotation.z = Math.PI;

    planeMesh.position.z = planeHeight * 0.3;

    camera.position.z = 60;
    camera.position.y = 85;

    geometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, 256, 256);
    var cylinderMesh = new THREE.Mesh(geometry, mirrorCubeMaterial);
    scene.add(cylinderMesh);

    cylinderMesh.position.y = cylinderHeight / 2 + 0.1;
    cylinderMesh.position.z = -1;

    mirrorCubeCamera.position.z = -3;
    mirrorCubeCamera.position.y = 8;

    var fog = new THREE.FogExp2(0x000000, 0.0025);
    scene.fog = fog;

    scene.add(planeMesh);

    scene.add(mirrorCubeCamera);

    return {object: cylinderMesh, camera: mirrorCubeCamera, reflected: planeMesh};
};
