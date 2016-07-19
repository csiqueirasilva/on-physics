ON_DAED["3D"].PasseioVirtual = function (scene, camera) {

    var pan = new THREE.SphereGeometry(1000, 64, 32);
    var mesh = new THREE.Mesh(pan, new THREE.MeshBasicMaterial({side: THREE.BackSide}));

    var panoramas = [];

    for (var i = 5; i < 8; i++) {
        panoramas.push(
                THREE.ImageUtils.loadTexture("imgs/texturas/panorama/panorama000" + i + ".jpg")
                );
    }

    function changePanorama() {
        if (camera.position.x >= 1000 && panoramas[2] !== mesh.material.map) {
            mesh.material.map = panoramas[2];
            mesh.material.needsUpdate = true;
            mesh.rotation.set(0, Math.PI * 3 / 4, 0);
            mesh.position.copy(camera.position);
        } else if (camera.position.x > 500 &&
                camera.position.x < 1000 &&
                panoramas[1] !== mesh.material.map) {
            mesh.material.map = panoramas[1];
            mesh.material.needsUpdate = true;
            mesh.rotation.set(0, Math.PI * 3 / 4, 0);
            mesh.position.copy(camera.position);
        } else if (camera.position.x < 500
                && camera.position.x >= 0 &&
                panoramas[0] !== mesh.material.map) {
            mesh.material.map = panoramas[0];
            mesh.material.needsUpdate = true;
            mesh.rotation.set(0, 0, 0);
            mesh.position.copy(camera.position);
        } else {
            console.log('volte para x positivo');
        }
    }

    scene.add(MathHelper.buildAxes(100000));

    window.setInterval(function () {
        changePanorama();
    }, 200);

    changePanorama();

    scene.add(mesh);
};
