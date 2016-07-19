ON_DAED["3D"].PosicaoSistemaSolar = function (scene, camera, parent) {

    var o = {};

    // GRAPHICS
    if (ON_DAED["WEBGL_SUPPORT"])
    {
        var raioHorizonte = 750;
        var circuloVisivelGeo = new THREE.CircleGeometry(raioHorizonte, 64, 32);


        var espacoVisivelMat = new THREE.MeshPhongMaterial(
                {
                    side: THREE.DoubleSide,
                    color: 0xFFFFFF
                });

        var circuloVisivel = new THREE.Mesh(circuloVisivelGeo, espacoVisivelMat);

        scene.add(circuloVisivel);
        circuloVisivel.rotation.x = -Math.PI / 2;
        circuloVisivel.receiveShadow = true;

        var logoOn = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(raioHorizonte * 1.25, raioHorizonte * 1.25),
                new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture("imgs/logo-on.jpg"),
                    side: THREE.DoubleSide
                }));

//    logoOn.rotation.y = Math.PI;    
//    logoOn.rotation.y = Math.PI / 2;

        logoOn.position.z = 3;
        logoOn.rotation.z = Math.PI / 2;

        logoOn.receiveShadow = true;

        circuloVisivel.add(logoOn);

        var rosaDosVentosDisplay = true;

        var spriteN = makeTextSprite("     N     ",
                {fontsize: 64, fontface: "Verdana", borderColor: {r: 255, g: 0, b: 0, a: 1.0}, depthTest: false});

        spriteN.position.x = raioHorizonte;

        var spriteO = makeTextSprite("     O     ",
                {fontsize: 64, fontface: "Verdana", borderColor: {r: 0, g: 255, b: 0, a: 1.0}, depthTest: false});

        spriteO.position.z = -raioHorizonte;

        var spriteL = makeTextSprite("     L     ",
                {fontsize: 64, fontface: "Verdana", borderColor: {r: 0, g: 255, b: 0, a: 1.0}, depthTest: false});

        spriteL.position.z = raioHorizonte;

        var spriteS = makeTextSprite("     S     ",
                {fontsize: 64, fontface: "Verdana", borderColor: {r: 0, g: 0, b: 255, a: 1.0}, depthTest: false});

        spriteS.position.x = -raioHorizonte;

        spriteS.scale = spriteN.scale = spriteO.scale = spriteL.scale;

        scene.add(spriteN);
        scene.add(spriteO);
        scene.add(spriteL);
        scene.add(spriteS);

        function updateLabelRosaDosVentos() {
            if (rosaDosVentosDisplay) {
                spriteN.material.depthWrite = true;
                spriteO.material.depthWrite = true;
                spriteL.material.depthWrite = true;
                spriteS.material.depthWrite = true;
                spriteN.material.depthTest = false;
                spriteO.material.depthTest = false;
                spriteL.material.depthTest = false;
                spriteS.material.depthTest = false;
            } else {
                spriteN.material.depthWrite = false;
                spriteO.material.depthWrite = false;
                spriteL.material.depthWrite = false;
                spriteS.material.depthWrite = false;
                spriteN.material.depthTest = true;
                spriteO.material.depthTest = true;
                spriteL.material.depthTest = true;
                spriteS.material.depthTest = true;
            }
            spriteN.material.needsUpdate = true;
            spriteO.material.needsUpdate = true;
            spriteL.material.needsUpdate = true;
            spriteS.material.needsUpdate = true;
        }

        var ambient = new THREE.AmbientLight(0x010101);
        scene.add(ambient);

        function lensFlaresOpacityUpdate(opacityUpdate) {
//                for (var i = 0; i < lensFlare.lensFlares.length; i++) {
//                    lensFlare.lensFlares[i].opacity = opacityUpdate;
//                }
        }

        var lua = new THREE.Mesh(
                new THREE.SphereGeometry(raioHorizonte * 0.2724, 64, 32),
                new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture("imgs/texturas/lua/lua.jpg")
                })
                );

        lua.receiveShadow = true;

        var luaRot = new THREE.Object3D();
        luaRot.add(lua);

        var objetoLua = new THREE.Object3D();
        objetoLua.add(luaRot);

        scene.add(objetoLua);

        var mercurio = new THREE.Mesh(
                new THREE.SphereGeometry(raioHorizonte * 0.383, 64, 32),
                new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture("imgs/texturas/planetas/mercury.jpg"),
                })
                );

        mercurio.receiveShadow = true;

        var objetoMercurio = new THREE.Object3D();
        objetoMercurio.add(mercurio);

        scene.add(objetoMercurio);

        var venus = new THREE.Mesh(
                new THREE.SphereGeometry(raioHorizonte * 0.949, 64, 32),
                new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture("imgs/texturas/planetas/venus.jpg")
                })
                );

        venus.receiveShadow = true;

        var objetoVenus = new THREE.Object3D();
        objetoVenus.add(venus);

        scene.add(objetoVenus);

        var mars = new THREE.Mesh(
                new THREE.SphereGeometry(raioHorizonte * 0.532, 64, 32),
                new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture("imgs/texturas/planetas/mars.jpg")
                })
                );

        mars.receiveShadow = true;

        var objetoMars = new THREE.Object3D();
        objetoMars.add(mars);

        scene.add(objetoMars);

        var jupiter = new THREE.Mesh(
                new THREE.SphereGeometry(raioHorizonte * 11.21, 64, 32),
                new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture("imgs/texturas/planetas/jupiter.jpg")
                })
                );

        jupiter.receiveShadow = true;

        var objetoJupiter = new THREE.Object3D();
        objetoJupiter.add(jupiter);

        scene.add(objetoJupiter);

        var saturn = new THREE.Mesh(
                new THREE.SphereGeometry(raioHorizonte * 9.45, 64, 32),
                new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture("imgs/texturas/planetas/saturn.jpg")
                })
                );

        saturn.receiveShadow = true;

        var objetoSaturn = new THREE.Object3D();
        objetoSaturn.add(saturn);

        scene.add(objetoSaturn);

        var uranus = new THREE.Mesh(
                new THREE.SphereGeometry(raioHorizonte * 4.01, 64, 32),
                new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture("imgs/texturas/planetas/uranus.jpg")
                })
                );

        uranus.receiveShadow = true;

        var objetoUranus = new THREE.Object3D();
        objetoUranus.add(uranus);

        scene.add(objetoUranus);

        var neptune = new THREE.Mesh(
                new THREE.SphereGeometry(raioHorizonte * 3.88, 64, 32),
                new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture("imgs/texturas/planetas/neptune.jpg")
                })
                );

        neptune.receiveShadow = true;

        var objetoNeptune = new THREE.Object3D();
        objetoNeptune.add(neptune);

        scene.add(objetoNeptune);

        var terraSombra = new THREE.Mesh(new THREE.SphereGeometry(raioHorizonte, 64, 32),
                new THREE.MeshPhongMaterial({
                    transparent: true,
                    opacity: 0.0
                })
                );

        terraSombra.castShadow = true;

        scene.add(terraSombra);

        var distanciaSol = 7500;

        var raioDistanciaLuz = 10;

        var luzTerra = new THREE.DirectionalLight(0xffffff, 1);

        luzTerra.castShadow = true;

        luzTerra.shadowCameraLeft = -raioHorizonte * raioDistanciaLuz / 4;
        luzTerra.shadowCameraRight = raioHorizonte * raioDistanciaLuz / 4;
        luzTerra.shadowCameraTop = raioHorizonte * raioDistanciaLuz / 4;
        luzTerra.shadowCameraBottom = -raioHorizonte * raioDistanciaLuz / 4;
//    luzTerra.shadowCameraVisible = true;

        luzTerra.shadowDarkness = 0.5;

        luzTerra.shadowCameraNear = raioDistanciaLuz * 500;
        luzTerra.shadowCameraFar = raioDistanciaLuz * 1000;

        luzTerra.shadowMapWidth = 2048;
        luzTerra.shadowMapHeight = 2048;

        scene.add(luzTerra);

        var skyBoxCompleto = new THREE.Object3D();

        var sbSize = distanciaSol * 10000000;

        var topGeoHeight = sbSize / 2;
        var midGeoHeight = sbSize / 64;
        var botGeoHeight = sbSize / 2;

        var skyBoxGeoTop = new THREE.BoxGeometry(sbSize, topGeoHeight, sbSize);
        var skyBoxGeoMid = new THREE.BoxGeometry(sbSize, midGeoHeight, sbSize);
        var skyBoxGeoBot = new THREE.BoxGeometry(sbSize, botGeoHeight, sbSize);

        var topLeftColor = new THREE.Color(0x0080F0);
        var topRightColor = topLeftColor;
        var midLeftColor = new THREE.Color(0x998088);
        var midRightColor = midLeftColor;
        var botLeftColor = new THREE.Color(0x000000);
//    var botRightColor = botLeftColor;

        skyBoxGeoTop.colors.push(topLeftColor);
        skyBoxGeoTop.colors.push(topRightColor);
        skyBoxGeoTop.colors.push(midLeftColor);
        skyBoxGeoTop.colors.push(midRightColor);

        skyBoxGeoTop.colors.push(topLeftColor);
        skyBoxGeoTop.colors.push(topRightColor);
        skyBoxGeoTop.colors.push(midLeftColor);
        skyBoxGeoTop.colors.push(midRightColor);

        skyBoxGeoMid.colors.push(midLeftColor);
        skyBoxGeoMid.colors.push(midRightColor);
        skyBoxGeoMid.colors.push(topLeftColor);
        skyBoxGeoMid.colors.push(topRightColor);

        skyBoxGeoMid.colors.push(midLeftColor);
        skyBoxGeoMid.colors.push(midRightColor);
        skyBoxGeoMid.colors.push(topLeftColor);
        skyBoxGeoMid.colors.push(topRightColor);

        // http://stackoverflow.com/questions/10330342/threejs-assign-different-colors-to-each-vertex-in-a-geometry 
        // check Stemkoski's answer

        function skyBoxSetFaceColors(geometry) {
            var faceIndices = ['a', 'b', 'c', 'd'];
            var face, numberOfSides, vertexIndex;

            for (var i = 0; i < geometry.faces.length; i++)
            {
                face = geometry.faces[ i ];
                numberOfSides = (face instanceof THREE.Face3) ? 3 : 4;
                for (var j = 0; j < numberOfSides; j++)
                {
                    vertexIndex = face[ faceIndices[ j ] ];
                    face.vertexColors[ j ] = geometry.colors[ vertexIndex ];
                }
            }
        }

        skyBoxSetFaceColors(skyBoxGeoTop);
        skyBoxSetFaceColors(skyBoxGeoMid);

        var skyBoxMaterial = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors, side: THREE.BackSide});
        var skyBoxTop = new THREE.Mesh(skyBoxGeoTop, skyBoxMaterial);
        var skyBoxMid = new THREE.Mesh(skyBoxGeoMid, skyBoxMaterial);
        var skyBoxBot = new THREE.Mesh(skyBoxGeoBot, new THREE.MeshBasicMaterial({color: botLeftColor, side: THREE.BackSide}));

        // removing bottom face index 6 and 7
        // removing top face index 4 and 5

        function removeFace(geometry, idx) {
            geometry.dynamic = true;
            geometry.faces.splice(idx, 1);
            geometry.faces.splice(idx, 1);

            geometry.verticesNeedUpdate = true;
            geometry.elementsNeedUpdate = true;
            geometry.morphTargetsNeedUpdate = true;
            geometry.uvsNeedUpdate = true;
            geometry.normalsNeedUpdate = true;
            geometry.colorsNeedUpdate = true;
            geometry.tangentsNeedUpdate = true;
        }

        removeFace(skyBoxTop.geometry, 6);
        removeFace(skyBoxMid.geometry, 6);
        removeFace(skyBoxMid.geometry, 4);
        removeFace(skyBoxBot.geometry, 4);

        skyBoxTop.position.y += topGeoHeight / 2;//+ midGeoHeight / 2;
        skyBoxMid.position.y = 0;
        skyBoxBot.position.y = -midGeoHeight / 2 - botGeoHeight / 2;

        skyBoxCompleto.add(skyBoxTop);
//    skyBoxCompleto.add(skyBoxMid);

        var cloneTop = new THREE.Mesh(skyBoxGeoTop, skyBoxMaterial);
        var cloneMid = new THREE.Mesh(skyBoxGeoMid, skyBoxMaterial);

        cloneTop.position.y -= topGeoHeight / 2;
        cloneTop.rotation.z = Math.PI;
        cloneMid.position.y -= midGeoHeight;
        cloneMid.rotation.z = Math.PI;

        skyBoxCompleto.add(cloneTop);
//    skyBoxCompleto.add(cloneMid);

//    skyBoxCompleto.add(skyBoxBot);

        skyBoxCompleto.scale.multiplyScalar(100);

        scene.add(skyBoxCompleto);

        var sol = new THREE.Mesh(
                new THREE.SphereGeometry(raioHorizonte * 109.1, 64, 32),
                new THREE.MeshBasicMaterial({
                    color: 0xFFFF00
                })
                );

        var objetoSol = new THREE.Object3D();
        objetoSol.add(sol);

        scene.add(objetoSol);

        var loader = new THREE.OBJMTLLoader(ON_DAED["3D"].createManager("Sue"));

        loader.load('obj/Sue/Sue.obj', 'obj/Sue/Sue.mtl', function (object) {

            var material = new THREE.MeshPhongMaterial({
                color: 0x0000FF
            });

            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                    child.castShadow = true;
                }
            });

            object.scale.multiplyScalar(2);

            scene.add(object);
        });

        var coords = {};

        function removeCoords(id) {
            if (coords[id]) {
                var c = coords[id];
                while (c.length > 0) {
                    c[0].parent.remove(c[0]);
                    c.splice(0, 1);
                }
                delete coords[id];
            }
        }

        function cadCoords(id, parent, obj) {
            if (!coords[id]) {
                coords[id] = [];
                parent.add(obj);
                coords[id].push(obj);
            }
        }

        function coordenadasHorizontais(id, azimute, altura) {
            removeCoords(id);

            var espacoVisivelFinal = new THREE.Object3D();

            espacoVisivelFinal.rotation.x = Math.PI / 2;

            cadCoords(id, circuloVisivel, espacoVisivelFinal);

            var zeniteGeo = new THREE.Geometry();

            zeniteGeo.vertices.push(new THREE.Vector3(-(raioHorizonte), 0, 0));
            zeniteGeo.vertices.push(new THREE.Vector3(0, 0, 0));
            zeniteGeo.computeLineDistances();

            var zeniteMat = new THREE.LineBasicMaterial({linewidth: 1, color: 0xFFFF00});

            var zenite = new THREE.Line(zeniteGeo, zeniteMat, THREE.LineStrip);
            var zeniteR = new THREE.Object3D();
            zeniteR.add(zenite);

            var zeniteFinal = new THREE.Object3D();
            zeniteFinal.add(zenite);

            zeniteFinal.rotation.z = -Math.PI / 2;

            espacoVisivelFinal.add(zeniteFinal);

            var meridianoLocal = MathHelper.buildLimitedSphereLines(Math.PI, raioHorizonte, 0xFF5F7F, false, 0.001);
            meridianoLocal.position.z = raioHorizonte;

            var meridianoFinal = new THREE.Object3D();
            meridianoFinal.rotation.x = -Math.PI / 2;

            meridianoFinal.add(meridianoLocal);

            espacoVisivelFinal.add(meridianoFinal);

            var azimuteR = MathHelper.buildLimitedSphereLines(azimute, raioHorizonte, 0x00FFFF, false, 0.001);

            var verticeMeio = azimuteR.children[0].geometry.vertices[parseInt(azimuteR.children[0].geometry.vertices.length / 2)];
            var x = verticeMeio.x;
            var z = verticeMeio.z;

            azimuteR.position.x = x;
            azimuteR.position.z = z;

            var azimuteRot = new THREE.Object3D();
            azimuteRot.rotation.z = -Math.PI;
            azimuteRot.rotation.y = Math.PI;
            azimuteRot.add(azimuteR);

            var azimuteFinal = new THREE.Object3D();
            azimuteFinal.add(azimuteRot);

//            ThreeHelper.createLabel("A = " + ON_DAED.tempoSideral(azimute, true), azimuteR, camera);

            espacoVisivelFinal.add(azimuteFinal);

            var distanciaZenital = Math.PI / 2 - altura;

            var dzR = MathHelper.buildLimitedSphereLines(distanciaZenital, raioHorizonte, 0xAFF257, false, 0.001);

            var verticeMeio = dzR.children[0].geometry.vertices[parseInt(dzR.children[0].geometry.vertices.length / 2)];
            var x = verticeMeio.x;
            var z = verticeMeio.z;

            dzR.position.x = x;
            dzR.position.z = z;

            var dzRot = new THREE.Object3D();
            dzRot.rotation.y = Math.PI / 2;
            dzRot.add(dzR);

            var dzFinal = new THREE.Object3D();
            dzFinal.rotation.x = Math.PI / 2;
            dzFinal.rotation.z = -azimute;

            dzFinal.add(dzRot);

//            ThreeHelper.createLabel("h = " + ON_DAED.tempoSideral(altura, true), alturaR, camera);

            espacoVisivelFinal.add(dzFinal);

            var alturaR = MathHelper.buildLimitedSphereLines(altura, raioHorizonte, 0x57F2AF, false, 0.001);

            var verticeMeio = alturaR.children[0].geometry.vertices[parseInt(alturaR.children[0].geometry.vertices.length / 2)];
            var x = verticeMeio.x;
            var z = verticeMeio.z;

            alturaR.position.x = x;
            alturaR.position.z = z;

            var alturaRot = new THREE.Object3D();
            alturaRot.rotation.x = Math.PI;
            alturaRot.add(alturaR);

            var alturaFinal = new THREE.Object3D();
            alturaFinal.rotation.x = Math.PI / 2;
            alturaFinal.rotation.z = -azimute;
            alturaFinal.add(alturaRot);

//            ThreeHelper.createLabel("z = " + ON_DAED.tempoSideral(distanciaZenital, true), distanciaZenitalR, camera);

            espacoVisivelFinal.add(alturaFinal);

            var dir = new THREE.Vector3(raioHorizonte, 0, 0);
            var origem = new THREE.Vector3(0, 0, 0);
            var tamanho = raioHorizonte;
            var corMarcador = 0x777700;

            var marcadorCoordenada = new THREE.ArrowHelper(dir, origem, tamanho, corMarcador);

            marcadorCoordenada.rotation.z = -Math.PI / 2 + altura;
            marcadorCoordenada.rotation.y = azimute;

            espacoVisivelFinal.add(marcadorCoordenada);

            return marcadorCoordenada;
        }

        var setaCoordenadas = {};

        setaCoordenadas['Mercurio'] = false;

        o.posicaoMercurio = function (azimute, altura, distancia) {

            azimute = -azimute;

            if (setaCoordenadas['Mercurio']) {
                coordenadasHorizontais('mercurio', azimute, altura);
            } else {
                removeCoords('mercurio');
            }

            var vector = MathHelper.sphericalToCartesian(raioHorizonte, Math.PI - azimute, -Math.PI / 2 + altura);
            vector.multiplyScalar(distanciaSol * distancia);
            objetoMercurio.position.copy(vector);

            uiObjetos.mercurio.updateCoords(azimute, altura, distancia);
        };

        setaCoordenadas['Venus'] = false;

        o.posicaoVenus = function (azimute, altura, distancia) {

            azimute = -azimute;

            if (setaCoordenadas['Venus']) {
                coordenadasHorizontais('venus', azimute, altura);
            } else {
                removeCoords('venus');
            }

            var vector = MathHelper.sphericalToCartesian(raioHorizonte, Math.PI - azimute, -Math.PI / 2 + altura);
            vector.multiplyScalar(distanciaSol * distancia);
            objetoVenus.position.copy(vector);

            uiObjetos.venus.updateCoords(azimute, altura, distancia);
        };

        setaCoordenadas['Marte'] = false;

        o.posicaoMarte = function (azimute, altura, distancia) {

            azimute = -azimute;

            if (setaCoordenadas['Marte']) {
                coordenadasHorizontais('marte', azimute, altura);
            } else {
                removeCoords('marte');
            }

            var vector = MathHelper.sphericalToCartesian(raioHorizonte, Math.PI - azimute, -Math.PI / 2 + altura);
            vector.multiplyScalar(distanciaSol * distancia);
            objetoMars.position.copy(vector);

            uiObjetos.marte.updateCoords(azimute, altura, distancia);
        };

        setaCoordenadas['Jupiter'] = false;

        o.posicaoJupiter = function (azimute, altura, distancia) {

            azimute = -azimute;

            if (setaCoordenadas['Jupiter']) {
                coordenadasHorizontais('jupiter', azimute, altura);
            } else {
                removeCoords('jupiter');
            }

            var vector = MathHelper.sphericalToCartesian(raioHorizonte, Math.PI - azimute, -Math.PI / 2 + altura);
            vector.multiplyScalar(distanciaSol * distancia);
            objetoJupiter.position.copy(vector);

            uiObjetos.jupiter.updateCoords(azimute, altura, distancia);
        };

        setaCoordenadas['Saturno'] = false;

        o.posicaoSaturn = function (azimute, altura, distancia) {

            azimute = -azimute;

            if (setaCoordenadas['Saturno']) {
                coordenadasHorizontais('saturn', azimute, altura);
            } else {
                removeCoords('saturn');
            }

            var vector = MathHelper.sphericalToCartesian(raioHorizonte, Math.PI - azimute, -Math.PI / 2 + altura);
            vector.multiplyScalar(distanciaSol * distancia);
            objetoSaturn.position.copy(vector);

            uiObjetos.saturno.updateCoords(azimute, altura, distancia);
        };

        setaCoordenadas['Urano'] = false;

        o.posicaoUranus = function (azimute, altura, distancia) {

            azimute = -azimute;

            if (setaCoordenadas['Urano']) {
                coordenadasHorizontais('uranus', azimute, altura);
            } else {
                removeCoords('uranus');
            }

            var vector = MathHelper.sphericalToCartesian(raioHorizonte, Math.PI - azimute, -Math.PI / 2 + altura);
            vector.multiplyScalar(distanciaSol * distancia);
            objetoUranus.position.copy(vector);

            uiObjetos.urano.updateCoords(azimute, altura, distancia);
        };

        setaCoordenadas['Netuno'] = false;

        o.posicaoNeptune = function (azimute, altura, distancia) {

            azimute = -azimute;

            if (setaCoordenadas['Netuno']) {
                coordenadasHorizontais('neptune', azimute, altura);
            } else {
                removeCoords('neptune');
            }

            var vector = MathHelper.sphericalToCartesian(raioHorizonte, Math.PI - azimute, -Math.PI / 2 + altura);
            vector.multiplyScalar(distanciaSol * distancia);
            objetoNeptune.position.copy(vector);

            uiObjetos.netuno.updateCoords(azimute, altura, distancia);
        };

        setaCoordenadas['Lua'] = false;

        o.posicaoLunar = function (azimute, altura, distancia) {

            azimute = -azimute;

            if (setaCoordenadas['Lua']) {
                coordenadasHorizontais('lua', azimute, altura);
            } else {
                removeCoords('lua');
            }

            var vector = MathHelper.sphericalToCartesian(raioHorizonte, Math.PI - azimute, -Math.PI / 2 + altura);
            vector.multiplyScalar(distanciaSol * distancia);
            objetoLua.position.copy(vector);

            lua.rotation.z = altura;
            lua.rotation.y = Math.PI + azimute;

            uiObjetos.lua.updateCoords(azimute, altura, distancia);
        };

        setaCoordenadas['Sol'] = false;

        o.posicaoSolar = function (azimute, altura, distancia) {

            azimute = -azimute;

            if (setaCoordenadas['Sol']) {
                coordenadasHorizontais('sol', azimute, altura);
            } else {
                removeCoords('sol');
            }

            var vector = MathHelper.sphericalToCartesian(raioHorizonte, Math.PI - azimute, -Math.PI / 2 + altura);
            vector.multiplyScalar(raioDistanciaLuz);
            luzTerra.position.copy(vector);

            var lensFlarePosition = MathHelper.sphericalToCartesian(raioHorizonte, Math.PI - azimute, -Math.PI / 2 + altura);
            lensFlarePosition.multiplyScalar(distancia * distanciaSol);
            objetoSol.position.copy(lensFlarePosition);

//        skyBoxCompleto.rotation.x = altura - Math.PI / 2;

            if (altura < Math.PI / 2) {
                modSet = (Math.abs(altura % (Math.PI / 2)) / (Math.PI / 2));
            } else if (altura < Math.PI) {
                modSet = 1 - (Math.abs(altura % (Math.PI / 2)) / (Math.PI / 2));
            } else if (altura < Math.PI * 1.5) {
                modSet = (Math.abs(altura % (Math.PI / 2)) / (Math.PI / 2));
            } else {
                modSet = 1 - (Math.abs(altura % (Math.PI / 2)) / (Math.PI / 2));
            }

            var noite = null;

            var g = (128 * modSet / 255) % 1;
            var rMid = (123 * modSet / 255) % 1;
            var bMid = (200 * modSet / 255) % 1;
            var bTop = (240 * modSet / 255) % 1;
            var rTop = (127 / 255) * bTop;
            var gBot = 0;
            var rBot = 0;
            var bBot = 0;

            var limiteHorizonte = (35 * Math.PI / 180);
            var limit = parseInt(limiteHorizonte * 1000) / 1000;

            var testAzimute = Math.round(azimute * 1000) / 1000;
            var testAltura = Math.round(altura * 1000) / 1000;

            var sunsetCondition = testAzimute < Math.PI * 3 / 2 + limit && testAzimute > Math.PI * 3 / 2 - limit;
            var sunriseCondition = testAzimute < Math.PI * 1 / 2 + limit && testAzimute > Math.PI * 1 / 2 - limit;
            var alturaCondition = testAltura < limit && testAltura > -limit;

            // roda skycube
            if (objetoSol.position.y < 0) {
                if (!sunsetCondition) {
//                        if (lensFlare.lensFlares[0].opacity !== 0) {
//                            lensFlaresOpacityUpdate(0);
//                        }
                }

                noite = true;

                if (skyBoxCompleto.rotation.z !== Math.PI) {
                    skyBoxCompleto.rotation.z = Math.PI;
                }
            } else if (objetoSol.position.y > 0 && skyBoxCompleto.rotation.z !== 0) {
//                    if (lensFlare.lensFlares[0].opacity !== 1) {
//                        lensFlaresOpacityUpdate(1);
//                    }
                noite = false;
                skyBoxCompleto.rotation.z = 0;
            }

            if (noite === true) {
                bBot = gBot = rBot = rMid = bMid = g = bTop = rTop = 0;
            }

            if ((sunriseCondition || sunsetCondition) && alturaCondition) {

                var modTeste;

                if (sunriseCondition) {
                    modTeste = Math.PI * 1 / 2;
                } else {
                    modTeste = Math.PI * 3 / 2;
                }

                var sinal = Math.sign(objetoSol.position.y) * Math.sign(objetoSol.position.x);

                var modSet = (testAzimute % modTeste);
                var modHorizonte = (-sinal + sinal * modSet / limit);

                if (modHorizonte !== 1) {
                    modHorizonte %= 1;
                }

                if (objetoSol.position.y < 0) {
                    lensFlaresOpacityUpdate(1 - modHorizonte);
                }

                var maxRed = 0.18;
                var maxGreen = 0.05;

                var resultRed = maxRed * sinal * modHorizonte;
                var resultGreen = maxGreen * sinal * modHorizonte;
                rBot += resultRed;
                rTop += resultRed;
                rMid += resultRed;

                g += resultGreen;
                gBot += resultGreen;
            }

            topLeftColor.setRGB(rTop, g, bTop);
            midLeftColor.setRGB(rMid, g, bMid);
            botLeftColor.setRGB(rBot, gBot, bBot);

//        skyBoxBot.material.color.setRGB(rBot, gBot, bBot);

//        skyBoxGeoBot.colorsNeedUpdate = true;
            skyBoxGeoMid.colorsNeedUpdate = true;
            skyBoxGeoTop.colorsNeedUpdate = true;

            uiObjetos.sol.updateCoords(azimute, altura, distancia);
        };

        var latitudeUsuario = 0;
        var longitudeUsuario = 0;

        window.navigator.geolocation.getCurrentPosition(function (a) {
            latitudeUsuario = a.coords.latitude * Math.PI / 180;
            longitudeUsuario = a.coords.longitude * Math.PI / 180;

            $('#input-latitude').val(a.coords.latitude.toFixed(2));
            $('#input-longitude').val(a.coords.longitude.toFixed(2));

            requestUpdateWorker(parseFloat($('#input-data-juliana').val()));
        });

        function criarDataSplit(date) {
            var sendData = {};

            sendData.dia = date.getUTCDate();
            sendData.mes = date.getUTCMonth() + 1;
            sendData.ano = date.getUTCFullYear();

            sendData.hora = date.getHours();
            sendData.minuto = date.getMinutes();
            sendData.segundo = date.getSeconds();
            return sendData;
        }

        var animacao = null;

        o.pararAnimacao = function () {
            if (animacao !== null) {
                window.clearInterval(animacao);
                animacao = null;
            }
        };

        ON_DAED["3D"].workerLogica.addEventListener('message', function (e) {
            var cmd = e.data.cmd;
            var fuso = parseFloat($('#fuso').val());

            if (cmd === 'observacaoHorizontal') {
                var position = e.data;
                o.posicaoMercurio(position.mercury.azimute, position.mercury.altitude, position.mercury.R);
                o.posicaoVenus(position.venus.azimute, position.venus.altitude, position.venus.R);
                o.posicaoMarte(position.mars.azimute, position.mars.altitude, position.mars.R);
                o.posicaoJupiter(position.jupiter.azimute, position.jupiter.altitude, position.jupiter.R);
                o.posicaoSaturn(position.saturn.azimute, position.saturn.altitude, position.saturn.R);
                o.posicaoUranus(position.uranus.azimute, position.uranus.altitude, position.uranus.R);
                o.posicaoNeptune(position.neptune.azimute, position.neptune.altitude, position.neptune.R);
                o.posicaoLunar(position.moon.azimute, position.moon.altitude, position.moon.R);
                o.posicaoSolar(position.sun.azimute, position.sun.altitude, position.sun.R);
            } else if (cmd === 'transitoSolar') {
                var transit = e.data;
                $('#nascer-sol').html(ON_DAED.tempoSideral((transit.rising + fuso / 24) * 2 * Math.PI));
                $('#passagem-meridiana-sol').html(ON_DAED.tempoSideral((transit.transit + fuso / 24) * 2 * Math.PI));
                $('#ocaso-sol').html(ON_DAED.tempoSideral((transit.setting + fuso / 24) * 2 * Math.PI));
            } else if (cmd === 'fasesDaLua') {
                var fasesDaLua = e.data;

                var novaString = '<div class="col-md-12">\
                                <span>Nova:</span>\
                                <span id="fase-lua-nova">' + ON_DAED.formatarDataJuliana(fasesDaLua.nova, fuso) + '</span>\
                            </div>';
                var crescenteString = '<div class="col-md-12">\
                                <span>Crescente:</span>\
                                <span id="fase-lua-crescente">' + ON_DAED.formatarDataJuliana(fasesDaLua.crescente, fuso) + '</span>\
                            </div>';
                var cheiaString = '<div class="col-md-12">\
                                <span>Cheia:</span>\
                                <span id="fase-lua-cheia">' + ON_DAED.formatarDataJuliana(fasesDaLua.cheia, fuso) + '</span>\
                            </div>';
                var minguanteString = '<div class="col-md-12">\
                                <span>Minguante:</span>\
                                <span id="fase-lua-minguante">' + ON_DAED.formatarDataJuliana(fasesDaLua.minguante, fuso) + '</span>\
                            </div>';

                delete fasesDaLua.cmd;

                function getMenor() {
                    var menor = Infinity;
                    var idx = -1;
                    for (var i in fasesDaLua) {
                        if (menor > fasesDaLua[i]) {
                            idx = i;
                            menor = fasesDaLua[i];
                        }
                    }

                    var ret;

                    delete fasesDaLua[idx];

                    switch (idx) {
                        case 'nova':
                            ret = novaString;
                            break;
                        case 'cheia':
                            ret = cheiaString;
                            break;
                        case 'minguante':
                            ret = minguanteString;
                            break;
                        case 'crescente':
                            ret = crescenteString;
                    }

                    return ret;
                }


                $('#proximas-fases-lua')
                        .empty()
                        .append(getMenor())
                        .append(getMenor())
                        .append(getMenor())
                        .append(getMenor());

            } else if (cmd === 'faseAtualLua') {
                var faseAtual = e.data;
                $('#fase-lua-atual').html(faseAtual.fase);
            }

        });

        o.posicaoAnimacao = function (updt, scale) {
            if (animacao === null) {
                var intervalo = updt || 100;
                scale = scale || 1;
                var now = new Date();
                now.setTime(now.getTime() - 1000 * 3600 * 2);
                var date = ON_DAED.ASTRO.getJulianFromUnix(now.getTime());

                animacao = window.setInterval(function () {
                    requestUpdateWorker(date);
                    date += .000011574 * (intervalo / 1000) * scale;
                }, intervalo);
            }
        };

        camera.position.x = 6600;
        camera.position.y = 2500;

        o.updateRosaDosVentos = updateLabelRosaDosVentos;

        var uiObjetos = {};

        var controlFar = new THREE.OrbitControls(camera);

        o.control = function () {
            return controlFar;
        };

        function requestUpdateWorker(date) {
            ON_DAED["3D"].workerLogica.postMessage({'cmd': 'observacaoHorizontal', 'latitude': latitudeUsuario, 'longitude': longitudeUsuario, 'data': date});
            ON_DAED["3D"].workerLogica.postMessage({'cmd': 'transitoSolar', 'latitude': latitudeUsuario, 'longitude': longitudeUsuario, 'data': date});
            ON_DAED["3D"].workerLogica.postMessage({'cmd': 'fasesDaLua', 'data': date});
            ON_DAED["3D"].workerLogica.postMessage({'cmd': 'faseAtualLua', 'data': date});
        }

        function textLabelPlanetas(obj) {
            $('.hover-label-text').remove();

            if (obj !== objetoMercurio) {
                ThreeHelper.createLabel("Mercurio", objetoMercurio, camera);
            }

            if (obj !== objetoVenus) {
                ThreeHelper.createLabel("Venus", objetoVenus, camera);
            }

            if (obj !== objetoMars) {
                ThreeHelper.createLabel("Marte", objetoMars, camera);
            }

            if (obj !== objetoJupiter) {
                ThreeHelper.createLabel("Jupiter", objetoJupiter, camera);
            }

            if (obj !== objetoSaturn) {
                ThreeHelper.createLabel("Saturno", objetoSaturn, camera);
            }

            if (obj !== objetoUranus) {
                ThreeHelper.createLabel("Urano", objetoUranus, camera);
            }

            if (obj !== objetoNeptune) {
                ThreeHelper.createLabel("Netuno", objetoNeptune, camera);
            }

            if (obj !== circuloVisivel) {
                ThreeHelper.createLabel("Terra", circuloVisivel, camera);
            } else {
                ThreeHelper.createLabel("Lua", objetoLua, camera);
            }

            if (obj !== objetoSol) {
                ThreeHelper.createLabel("Sol", objetoSol, camera);
            }
        }

        $(document).ready(function () {
            //o.posicaoAnimacao(2, 10000);

            var activeLabelClass = 'active';

            $(parent).append($('#buffer-form-observacao-horizontal')[0].innerHTML);

            $('#buffer-form-observacao-horizontal').remove();

            var ui = $('.ui-observacao-horizontal');

            $(ui).mouseover(function (ev) {
                o.control().enabled = false;
            });

            $(ui).mouseout(function (ev) {
                o.control().enabled = true;
                $('input').blur();
            });

            var terraBtn = $('#terra-ui-coords a');

            function labelAtivo(elem) {
                $('.' + activeLabelClass).removeClass(activeLabelClass);
                $(elem).addClass(activeLabelClass);
            }

            terraBtn.click(function (ev) {
                labelAtivo(this);
                textLabelPlanetas(circuloVisivel);
                camera.position.set(1000, 1000, 0);
                rosaDosVentosDisplay = true;
                o.control().target.set(0, 0, 0);
            });

            var input = $('#input-data-juliana');

            function numericInput(obj) {
                if (isNaN($(obj).val()) || !$(obj).val()) {
                    $(obj).val('0');
                }
            }

            function updateFromJulian(obj) {
                var jd = parseFloat($(obj).val());

                var gregorian = ON_DAED.ASTRO.getDateFromJulian(jd);

                var dateInput = $('#dia-mes-ano-row').children('input');
                var horaInput = $('#hora-minuto-segundo-row').children('input');

                var fuso = parseFloat($('#fuso').val()) + getHorarioVerao();
                gregorian.setUTCHours(gregorian.getUTCHours() + fuso);

                $(dateInput[0]).val(gregorian.getUTCDate());
                $(dateInput[1]).val(gregorian.getUTCMonth() + 1);
                $(dateInput[2]).val(gregorian.getUTCFullYear());

                $(horaInput[0]).val(gregorian.getUTCHours());
                $(horaInput[1]).val(gregorian.getUTCMinutes());
                $(horaInput[2]).val(gregorian.getUTCSeconds());

                requestUpdateWorker(jd);
            }

            input.change(function () {
                var value = parseFloat($(this).val());

                if (isNaN(value) || value < 0) {
                    $(this).val('0');
                }

                updateFromJulian(this);
            });

            $('.geo-coords-input').change(function (ev) {
                numericInput(this);

                latitudeUsuario = parseFloat($('#input-latitude').val()) * Math.PI / 180;
                longitudeUsuario = parseFloat($('#input-longitude').val()) * Math.PI / 180;

                updateFromJulian(this);
            });

            var otherInputs = $('input').not(input).not('.geo-coords-input');

            otherInputs.change(function (ev) {
                numericInput(this);

                var data = $('#dia-mes-ano-row').children('input').map(function (k, v) {
                    return parseFloat($(v).val());
                });

                var horario = $('#hora-minuto-segundo-row').children('input').map(function (k, v) {
                    return parseFloat($(v).val());
                });

                var jd = Math.round(ON_DAED.ASTRO.getJulianFromGregorian(data[0], data[1], data[2], horario[0], horario[1], horario[2]) * 10000) / 10000;

                input.val(jd);

                requestUpdateWorker(jd);
            });

            function createRowCoordenadas(id, labelText, obj, distanciaFator) {
                var posicao = document.createElement('div');
                posicao.id = id;
                posicao.className = 'col-md-12 img-rounded';

                var label = document.createElement('div');
                label.className = 'col-md-12 label-row-coords';

                var coordsField = document.createElement('div');
                coordsField.className = 'col-md-12 label-row-coords';

                var azimuteField = document.createElement('div');
                azimuteField.className = 'col-md-6';

                var alturaField = document.createElement('div');
                alturaField.className = 'col-md-6';

                var distanciaField = document.createElement('div');
                distanciaField.className = 'col-md-12';

                coordsField.appendChild(azimuteField);
                coordsField.appendChild(alturaField);
                coordsField.appendChild(distanciaField);

                var nome = document.createElement('a');
                nome.className = "btn btn-info";
                nome.href = "#";

                var nomeInterno = document.createElement('i');
                nomeInterno.innerHTML = labelText;
                nomeInterno.className = "glyphicon glyphicon-star";

                nome.appendChild(nomeInterno);
                label.appendChild(nome);

                posicao.appendChild(label);
                posicao.appendChild(coordsField);

                var plotCoordenadas = document.createElement('div');
                var labelPlotCoordenadas = document.createElement('label');

                plotCoordenadas.className = "checkbox";

                labelPlotCoordenadas.innerHTML = '<input type="checkbox"> Seta Coordenadas Horizontais';

                $(labelPlotCoordenadas).children('input').click(function () {
                    setaCoordenadas[labelText] = !setaCoordenadas[labelText];
                    requestUpdateWorker(input.val());
                });

                plotCoordenadas.appendChild(labelPlotCoordenadas);
                label.appendChild(plotCoordenadas);

                if (obj) {
                    nome.className += ' jlink';

                    nome.onclick = function () {
                        labelAtivo(this);
                        textLabelPlanetas(obj);
                        rosaDosVentosDisplay = false;
                        camera.position.copy(obj.position.clone().multiplyScalar(distanciaFator));
                        o.control().target.copy(obj.position);
                    };
                }

                document.getElementById('coords-holder').appendChild(posicao);

                return {
                    elem: posicao,
                    updateCoords: function (azimute, altura, distancia) {
                        alturaField.innerHTML = "h = " + ON_DAED.tempoSideral(altura, true);
                        azimuteField.innerHTML = "A = " + ON_DAED.tempoSideral(azimute, true);
                        distanciaField.innerHTML = "Distancia = " + distancia.toFixed(10) + " UA";
                    }
                };
            }

            uiObjetos.sol = createRowCoordenadas('sol-ui-coords', 'Sol', objetoSol, 0.75);
            uiObjetos.lua = createRowCoordenadas('lua-ui-coords', 'Lua', objetoLua, 0.75);
            uiObjetos.mercurio = createRowCoordenadas('mercurio-ui-coords', 'Mercurio', objetoMercurio, 1.005);
            uiObjetos.venus = createRowCoordenadas('venus-ui-coords', 'Venus', objetoVenus, 1.005);
            uiObjetos.marte = createRowCoordenadas('marte-ui-coords', 'Marte', objetoMars, 1.005);
            uiObjetos.jupiter = createRowCoordenadas('jupiter-ui-coords', 'Jupiter', objetoJupiter, 1.001);
            uiObjetos.saturno = createRowCoordenadas('saturno-ui-coords', 'Saturno', objetoSaturn, 1.001);
            uiObjetos.urano = createRowCoordenadas('urano-ui-coords', 'Urano', objetoUranus, 1.001);
            uiObjetos.netuno = createRowCoordenadas('netuno-ui-coords', 'Netuno', objetoNeptune, 1.001);

            input.trigger('change');
            terraBtn.trigger('click');
        });

    }
    else {
        alert("Sem suporte a WEBGL!");
    }

    return o;
};
