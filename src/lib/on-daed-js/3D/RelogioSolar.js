ON_DAED["3D"].RelogioSolar = function (scene, camera) {

    var sunDial = new THREE.Object3D();

    var texturaSunDial = THREE.ImageUtils.loadTexture('imgs/texturas/texturas/marble.jpg');

    var alturaGnomon = 100;
    var baseGnomon = 10;
    var topoGnomon = 10;

    var geometry = new THREE.CylinderGeometry(topoGnomon, baseGnomon, alturaGnomon, 32);
    var material = new THREE.MeshPhongMaterial({map: texturaSunDial});
    var cone = new THREE.Mesh(geometry, material);
    cone.position.y += alturaGnomon / 2;
    sunDial.add(cone);
    cone.castShadow = true;
    cone.receiveShadow = true;

    var alturaDisco = 5;
    var baseDisco = 200;
    var topoDisco = 200;

    var geometry = new THREE.CylinderGeometry(topoDisco, baseDisco, alturaDisco, 64);
    var material = new THREE.MeshPhongMaterial({map: texturaSunDial});
    var cone = new THREE.Mesh(geometry, material);
    cone.position.y -= alturaDisco / 2;
    cone.receiveShadow = true;

    sunDial.add(cone);

    var material = new THREE.MeshPhongMaterial({map: texturaSunDial});
    var circleGeometry = new THREE.CircleGeometry(baseDisco, 64);
    var circle = new THREE.Mesh(circleGeometry, material);
    circle.receiveShadow = true;

    circle.position.y = 1;
    circle.rotation.x = -Math.PI / 2;

    sunDial.add(circle);

    var raioTerra = 600;

    var geometriaEsfera = new THREE.SphereGeometry(raioTerra, 64, 32);

    var terra = new THREE.Mesh(
            geometriaEsfera.clone(),
            new THREE.MeshPhongMaterial({
                map: THREE.ImageUtils.loadTexture('imgs/texturas/terra/map.jpg'),
                bumpMap: THREE.ImageUtils.loadTexture('imgs/texturas/terra/bump.jpg'),
                bumpScale: 1,
                shininess: 0.5,
                specularMap: THREE.ImageUtils.loadTexture('imgs/texturas/terra/specular.jpg')
            }));

    sunDial.position.x = raioTerra + baseDisco + 1;

    var sunDialRef = new THREE.Object3D();
    sunDialRef.add(sunDial);

    terra.add(sunDialRef);

    scene.add(terra);

    var luz = new THREE.DirectionalLight(0xffffff, 1);

    function declinacaoSolar() {

        // src: http://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
        var now = new Date();
        var start = new Date(now.getUTCFullYear(), 0, 0);
        var diff = now - start;
        var oneDay = 1000 * 60 * 60 * 24;
        var N = Math.floor(diff / oneDay);

        var declinacao = -23.43 * Math.sin(360 / 365 * (284 + N));

        return declinacao;
    }

    luz.position.set(9000, 1000 * Math.sin(declinacaoSolar()), 0);
    luz.castShadow = true;

    luz.shadowCameraLeft = -1000;
    luz.shadowCameraRight = 1000;
    luz.shadowCameraTop = 1000;
    luz.shadowCameraBottom = -1000;

//        luz.shadowCameraVisible = true;

    luz.shadowDarkness = 1;

    luz.shadowCameraNear = 1;
    luz.shadowCameraFar = 10000;

    luz.shadowMapWidth = 2048;
    luz.shadowMapHeight = 2048;

    scene.add(luz);

    camera.position.z = -2000;
    camera.position.y = 5;

    sunDial.scale.multiplyScalar(0.85);

    terra.castShadow = true;

    var tempoAtual = (Date.now() % 86400000);

    terra.rotation.y = Math.PI + (tempoAtual) * 7.272205216643039e-8;

    var timestamp = new Date().getTime();

    ON_DAED["3D"].register(scene, terra, function () {
        var t = new Date().getTime();
        var diff = t - timestamp;
        if (diff > 0) {
            var rotTerra = diff * 7.272205216643039e-8 * 10000;
            terra.rotation.y += rotTerra;
            timestamp = t;

            var d = declinacaoSolar();
            luz.position.y = 1000 * Math.sin(d);

            if (d < 0) {
                sunDial.rotation.z = 0;
            } else {
                sunDial.rotation.z = 0;
            }

        }
    });

    window.navigator.geolocation.getCurrentPosition(function (a) {
        var latitude = a.coords.latitude;
        var raioLatitude = (raioTerra) * Math.cos(latitude * Math.PI / 180);
        var alturaLatitude = (raioTerra) * Math.sin(latitude * Math.PI / 180);
        sunDial.position.x = raioLatitude + baseDisco + 1;
        sunDial.position.y = alturaLatitude;

        var longitude = a.coords.longitude;

        sunDialRef.rotation.y = longitude * Math.PI / 180;
    });
};
