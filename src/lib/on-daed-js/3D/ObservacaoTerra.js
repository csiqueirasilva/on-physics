ON_DAED["3D"].ObservacaoTerra = function (scene, camera, raioPlaneta, control, obj) {

    // cores
    var corPontoVernal = 0xFFFFFF;
    var corEcliptica = 0xFFFF00;
    var corJ2000 = 0xFF00FF;
    var corEquadorData = 0xFF0000;
    var corPolosCelestes = 0x0067C4;

    var eixoTerrestre;
    var eixoTerrestreOriginal = eixoTerrestre = 23.4 * Math.PI / 180;

    var geometriaEsfera = new THREE.SphereGeometry(raioPlaneta, 64, 32);
    camera.position.z = raioPlaneta + 500;

    control.maxDistance = 3000;
    control.noPan = true;

    var materialAtmosfera = new THREE.MeshPhongMaterial({
        color: 0x0038F4,
        transparent: true,
        side: THREE.FrontSide,
        opacity: 0.15,
        shininess: 20,
        blending: THREE.AdditiveBlending
    });

    var atmosfera = new THREE.Mesh(
            geometriaEsfera.clone(),
            materialAtmosfera);

    atmosfera.scale.multiplyScalar(1.05);

    var texturaTerra = THREE.ImageUtils.loadTexture('imgs/texturas/terra/map.jpg');
    var bumpTerra = THREE.ImageUtils.loadTexture('imgs/texturas/terra/bump.jpg');
    var specularTerra = THREE.ImageUtils.loadTexture('imgs/texturas/terra/specular.jpg');
    var texturaEsferaCeleste = THREE.ImageUtils.loadTexture('imgs/texturas/esfera-celeste/panorama.jpg');

    texturaEsferaCeleste.minFilter = texturaTerra.minFilter = specularTerra.minFilter = bumpTerra.minFilter = THREE.LinearFilter;

    var terra = new THREE.Mesh(
            geometriaEsfera.clone(),
            new THREE.MeshLambertMaterial({
                map: texturaTerra,
                bumpMap: bumpTerra,
                bumpScale: 1,
                shininess: 0.5,
                specularMap: specularTerra
            }));

    var wrapperTerra = new THREE.Object3D();
    var objetoTerra = new THREE.Object3D();

    objetoTerra.add(atmosfera);
    objetoTerra.rotation.x = eixoTerrestre;
    objetoTerra.add(terra);

    var linhasImaginarias = new THREE.Object3D();
    objetoTerra.add(linhasImaginarias);

    var equador = MathHelper.buildSphereLines(raioPlaneta + 0.5, 0xFF0000, true, 0.1);
    var greenwich = MathHelper.buildSphereLines(raioPlaneta + 0.5, 0x00FF00, true, 0.1);
    greenwich.rotation.x = Math.PI / 2;

    var escalaFirmamento = 10;

    var firmamento = new THREE.Object3D();

    var margemEsferaCeleste = 10;

    var esferaCelesteObj = new THREE.Mesh(
            new THREE.SphereGeometry(raioPlaneta + margemEsferaCeleste, 64, 32),
            new THREE.MeshBasicMaterial({
                depthWrite: false,
                side: THREE.BackSide,
                map: texturaEsferaCeleste
            })
            );

    var escalaEsferaCeleste = 50;

    var esferaCelesteGiro = (Math.PI / 2) * 0.81;

    esferaCelesteObj.rotation.z = esferaCelesteGiro;
    esferaCelesteObj.scale.multiplyScalar(escalaEsferaCeleste * escalaFirmamento);

    ON_DAED["3D"].register(scene, esferaCelesteObj, function () {
        esferaCelesteObj.position.copy(camera.position);
    }, true);

    var esferaCeleste = new THREE.Object3D();

    esferaCeleste.scale.multiplyScalar(escalaFirmamento);

    var wrapperEsferaCeleste = new THREE.Object3D();
    wrapperEsferaCeleste.add(esferaCeleste);

    var raioPoloCeleste = raioPlaneta * escalaFirmamento;

    var polosCelestesGeo = new THREE.Geometry();
    polosCelestesGeo.vertices.push(new THREE.Vector3(0, -raioPoloCeleste, 0));
    polosCelestesGeo.vertices.push(new THREE.Vector3(0, raioPoloCeleste, 0));
    polosCelestesGeo.computeLineDistances();

    var polosCelestes = new THREE.Line(polosCelestesGeo, new THREE.LineDashedMaterial({
        linewidth: 1, color: corPolosCelestes, dashSize: 3, gapSize: 3
    }), THREE.LineStrip);

    objetoTerra.add(polosCelestes);

    var equadorCelesteJ2000 = MathHelper.buildSphereLines(raioPlaneta, corJ2000, true, 0.1);

    var verticeMeio = equadorCelesteJ2000.geometry.vertices[parseInt(equadorCelesteJ2000.geometry.vertices.length / 2)];
    var x = verticeMeio.x;
    var z = verticeMeio.z;
    var equadorCelesteJ2000Rot = new THREE.Object3D();
    equadorCelesteJ2000Rot.add(equadorCelesteJ2000);
    equadorCelesteJ2000Rot.position.x = x;
    equadorCelesteJ2000Rot.position.z -= z;

    equadorCelesteJ2000.position.x -= x;
    equadorCelesteJ2000.position.z = z;

    var objectLabelEquadorCelesteJ2000 = new THREE.Object3D();
    objectLabelEquadorCelesteJ2000.position.z = raioPlaneta;
    equadorCelesteJ2000.add(objectLabelEquadorCelesteJ2000);

//        ThreeHelper.createLabel("J2000", objectLabelEquadorCelesteJ2000, camera);

    esferaCeleste.add(equadorCelesteJ2000Rot);

    var ecliptica = MathHelper.buildSphereLines(raioPlaneta, corEcliptica, true, 0.1);
    ecliptica.rotation.x = -eixoTerrestre;

    function updateLight(pos) {
        solRot.rotation.y = firmamento.rotation.y = -pos;

        sol.rotation.y = pos;

        wrapperTerra.rotation.y = wrapperEsferaCeleste.rotation.y = pos * 2;
    }

    ON_DAED["3D"].ativarFlaresSol();

    var sol = ON_DAED["3D"].criarSol(scene);

    sol.scale.multiplyScalar(0.75);

    var solRot = new THREE.Object3D();
    solRot.add(sol);

    var luz = new THREE.DirectionalLight(0xF0F0F0, 1);

    // debug
//        luz.castShadow = true;
//        luz.shadowCameraLeft = -1000;
//        luz.shadowCameraRight = 1000;
//        luz.shadowCameraTop = 1000;
//        luz.shadowCameraBottom = -1000;
//        luz.shadowCameraVisible = true;

    luz.target = objetoTerra;

    scene.add(luz);
    scene.add(solRot);

    var lightIcr = 0;
    var raioLuz = raioPlaneta * escalaFirmamento;

    firmamento.position.z = raioLuz;

    updateLight(lightIcr);

    esferaCeleste.add(ecliptica);

    esferaCeleste.rotation.copy(objetoTerra.rotation);

    firmamento.add(wrapperEsferaCeleste);

    solRot.add(firmamento);

    var longitudes = [];

    for (var i = 0; i < 180; i = i + 15) {
        var longitude = MathHelper.buildSphereLines(raioPlaneta + 0.1, 0x000000, false);
        longitude.rotation.x = Math.PI / 2;
        longitude.rotation.z = i * Math.PI / 180;
        longitudes.push(longitude);
        linhasImaginarias.add(longitude);
    }

    var latitudes = [];

    for (var i = -75; i <= 75; i = i + 15) {
        var raioLatitude = (raioPlaneta + 0.1) * Math.cos(i * Math.PI / 180);
        var alturaLatitude = (raioPlaneta + 0.1) * Math.sin(i * Math.PI / 180);
        var longitude = MathHelper.buildSphereLines(raioLatitude, 0x000000, false);
        longitude.position.y = alturaLatitude;
        latitudes.push(longitude);
        linhasImaginarias.add(longitude);
    }

    linhasImaginarias.add(equador);
    linhasImaginarias.add(greenwich);

    var timescale = 1;

    var lastTimestamp = new Date().getTime();

    firmamento.add(wrapperTerra);

    var rastroMaterial = new THREE.LineBasicMaterial({
        color: 0xFF0000,
        linewidth: 3
    });

    var rastroGeo = new THREE.Geometry();

    function iniciarVertices() {
        window.setTimeout(function () {
            for (var i = 0; i < rastroGeo.vertices.length; i++) {
                var v = new THREE.Vector3(0, raioPoloCeleste, 0);
                v.applyMatrix4(objetoTerra.matrixWorld);
                rastroGeo.vertices[i].copy(v);
            }

            rastroGeo.computeLineDistances();
            rastroGeo.verticesNeedUpdate = true;
        }, 50);
    }

    for (var i = 0; i < 900; i++) {
        rastroGeo.vertices.push(new THREE.Vector3());
    }

    var rastro = new THREE.Line(rastroGeo, rastroMaterial);
    rastro.frustumCulled = false;
    scene.add(rastro);

    var countRastro = 0;

    function atualizarRastro() {
        if (++countRastro === 1) {
            for (var i = 0; i < rastroGeo.vertices.length - 1; i++) {
                rastroGeo.vertices[i].copy(rastroGeo.vertices[i + 1]);
            }

            var v = new THREE.Vector3(0, raioPoloCeleste, 0);
            v.applyMatrix4(objetoTerra.matrixWorld);

            rastroGeo.vertices[rastroGeo.vertices.length - 1].copy(v);

            rastroGeo.computeLineDistances();
            rastroGeo.verticesNeedUpdate = true;
            countRastro = 0;
        }
    }

    var acc = 0;

    var precessao = false;
    var translacao = false;
    var rotacao = false;
    var nutacao = false;
    var anguloNutacao = 1.75;
    var oldEixo = null;
    var incrementoRotacao = 1E-3;
    var incrementoTranslacao = 1E-4;
    var incrementoPrecessao = 1E-5;
    var sempreMostrarObliquidade = false;

    var precessaoTerra = new THREE.Object3D();
    precessaoTerra.add(objetoTerra);

    function rotacaoTerra(rotTerra) {
        objetoTerra.rotation.y += rotTerra;
        equadorCeleste.rotation.y -= rotTerra;
    }

    ON_DAED["3D"].register(wrapperTerra, precessaoTerra, function () {
        var timestamp = new Date().getTime();
        var diff = timestamp - lastTimestamp;

        if (diff > 0) {
            acc += diff * Math.pow(4, (timescale / maxTimescale) * 5);

            if (nutacao) {
                o.obliquidadeEcliptica(Math.round((oldEixo - (anguloNutacao * Math.PI / 180) * Math.cos(acc / 100000)) * 1000) / 1000, true);
            } else if (!sempreMostrarObliquidade) {
                if (lastObliq !== null && lastObliq.parent) {
                    lastObliq.parent.remove(lastObliq);
                }
            }

            if (rotacao) {
                var rotTerra = diff * incrementoRotacao * timescale;

                rotacaoTerra(rotTerra);
            }

            if (translacao) {
                lightIcr -= diff * incrementoTranslacao * timescale;
                updateLight(lightIcr);
                control.target.set(0, 0, 0);
            } else {
                var v = new THREE.Vector3().copy(firmamento.position);
                v.applyMatrix4(solRot.matrixWorld);
                control.target.copy(v);
            }

            if (precessao) {
                precessaoTerra.rotation.y -= diff * incrementoPrecessao * timescale;
            }

            camera.lookAt(control.target);

            atualizarRastro();

            lastTimestamp = timestamp;
        }

    }, true);

    var parent = obj || $('#campo-de-observacao');

    parent.append('<div id="terra-timescale-btn-group" class="btn-group" role="group">\
            <button disabled="disabled" id="terra-remove-timescale" type="button" class="btn btn-default"><span class="glyphicon glyphicon-minus" aria-hidden="true"></span></button>\
            <button class="btn btn-success" type="button"><i class="glyphicon glyphicon-repeat"></i> <span id="terra-timescale-label">1</span></button>\
            <button id="terra-add-timescale" type="button" class="btn btn-default"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>\
        </div>');

    parent.append('<div id="terra-props-btn-group">\
            <div class="btn-group" role="group"><button class="btn btn-info" type="button" id="terra-prop-nutacao">Nutação</button>\
            <button class="btn btn-info" type="button" id="terra-prop-precessao">Precessão</button>\
            <button class="btn btn-info" type="button" id="terra-prop-rot">Rotação</button></div>\
            <button class="btn btn-info" type="button" id="terra-prop-traj-sol">Translação</button>\
        </div>');

    parent.append(
            '<div id="terra-obs-label-wrapper">\
                    <div id="terra-obs-label-ponto-vernal">Ponto Vernal (ɤ)</div>\
                    <div id="terra-obs-label-ecliptica">Trajetória Aparente do Sol (Eclíptica)</div>\
                    <div id="terra-obs-label-j2000">Equador de Referência</div>\
                    <div id="terra-obs-label-equador-data">Equador da Data</div>\
                    <div id="terra-obs-label-polos-celestes">Pólos Celestes</div>\
                </div>'
            );

    function toHexString(n) {
        var s = n.toString(16).substring(0, 6);
        for (var i = s.length; i < 6; i++) {
            s = '0' + s;
        }
        return '#' + s;
    }

    $('#terra-obs-label-ponto-vernal').css({'color': toHexString(corPontoVernal)});
    $('#terra-obs-label-ecliptica').css({'color': toHexString(corEcliptica)});
    $('#terra-obs-label-j2000').css({'color': toHexString(corJ2000)});
    $('#terra-obs-label-equador-data').css({'color': toHexString(corEquadorData)});
    $('#terra-obs-label-polos-celestes').css({'color': toHexString(corPolosCelestes)});

    var maxTimescale = 5;

    $('#terra-prop-traj-sol').click(function () {
        translacao = !translacao;

        if (translacao) {
            camera.position.y = 2500;
        } else {
            control.target = new THREE.Vector3().copy(objetoTerra.position);
            camera.position.set(1000, 1000, 1000);
        }

        $(this).toggleClass('active');
    });

    $('#terra-prop-rot').click(function () {
        rotacao = !rotacao;

        $(this).toggleClass('active');
    });

    $('#terra-prop-nutacao').click(function () {

        if (nutacao) {
            objetoTerra.rotation.x = eixoTerrestre = oldEixo;
            oldEixo = null;
        } else {
            oldEixo = eixoTerrestre;
        }

        nutacao = !nutacao;

        iniciarVertices();

        $(this).toggleClass('active');
    });

    $('#terra-prop-precessao').click(function () {
        precessao = !precessao;
        if (!precessao) {
            precessaoTerra.rotation.y = 0;
        }
        $(this).toggleClass('active');
    });

    $('#terra-add-timescale').click(function () {
        timescale++;

        if (timescale === maxTimescale) {
            $(this).prop("disabled", true);
        }

        $('#terra-remove-timescale').prop("disabled", false);

        $("#terra-timescale-label").html(timescale);
    });

    $('#terra-remove-timescale').click(function () {
        timescale--;

        if (timescale === 1) {
            $(this).prop("disabled", true);
        }

        $('#terra-add-timescale').prop("disabled", false);
        $("#terra-timescale-label").html(timescale);
    });

    $('#terra-props-btn-group button').on('click', function () {
        iniciarVertices();
        $(this).toggleClass('btn-info');
        $(this).toggleClass('btn-primary');
    });

    $('#terra-timescale-btn-group button').on('click', iniciarVertices);

    var o = {};

    var coords = [];

    function removeCoords() {
        atmosfera.visible = true;

        ThreeHelper.removeAllTexts();

        criarPontoVernal();

        while (coords.length > 0) {
            coords[0].parent.remove(coords[0]);
            var removed = coords.splice(0, 1)[0];
            if (removed.traverse instanceof Function) {
                removed.traverse(function (child) {
                    if (child.material) {
                        child.material.dispose();
                    }

                    if (child.geometry) {
                        child.geometry.dispose();
                    }

                    delete child;
                });
            }
        }
    }

    function cadCoords(parent, obj) {
        parent.add(obj);
        coords.push(obj);
    }

    var ultCoords = null;

    o.removeCoords = removeCoords;

    function criarPontoVernal() {
        var pontoVernal = new THREE.Object3D();

        pontoVernal.position.x = -raioPlaneta * escalaFirmamento;

        ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.PONTO_VERNAL, pontoVernal);

        equadorCeleste.add(pontoVernal);
    }

    var equadorCeleste = MathHelper.buildSphereLines(raioPlaneta * escalaFirmamento, corEquadorData, true, 0.1);
    objetoTerra.add(equadorCeleste);

    criarPontoVernal();

    var lastObliq = null;
    var obliqCache = {};

    var labelObliquidadeEcliptica = ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.ECLIPTICA);

    o.limparCacheObliquidade = function () {
        var nutacaoOriginal = nutacao;
        nutacao = false;

        if (lastObliq !== null) {
            if (lastObliq.parent) {
                lastObliq.parent.remove(lastObliq);
            } else {
                delete obliqCache[lastObliq.name];
            }
        }

        var c = 0;

        for (var i  in obliqCache) {
            c++;
            delete obliqCache[i];
        }

        console.log("Eliminados " + c + " elementos do cache de obliquidade.");

        nutacao = nutacaoOriginal;
    };

    function criarObliquidadeEcliptica(obliquidade) {
        if (lastObliq !== null && lastObliq.name !== obliquidade) {
            if (lastObliq.parent) {
                lastObliq.parent.remove(lastObliq);
            } else {
                delete obliqCache[lastObliq.name];
            }
        }

        if (obliqCache[obliquidade] === undefined) {
            var anguloObliquidade = MathHelper.buildLimitedSphereLines(-obliquidade, -raioPlaneta * escalaFirmamento, 0xF0F0F0, false, 0.001, 1);
            anguloObliquidade.rotation.x = -Math.PI / 2;

            var verticeMeio = anguloObliquidade.children[0].geometry.vertices[parseInt(anguloObliquidade.children[0].geometry.vertices.length / 2)];
            var x = verticeMeio.x;
            var z = verticeMeio.z;
            var anguloObliquidadeR = new THREE.Object3D();
            anguloObliquidadeR.add(anguloObliquidade);
            anguloObliquidadeR.position.x = x;
            anguloObliquidadeR.position.y = z;

            var anguloObliquidadeFinal = new THREE.Object3D();
            anguloObliquidadeFinal.add(anguloObliquidadeR);
            anguloObliquidadeFinal.rotation.y = Math.PI / 2;

            anguloObliquidadeFinal.name = obliquidade;

            obliqCache[obliquidade] = anguloObliquidadeFinal;
        }

        lastObliq = obliqCache[obliquidade];

        if (labelObliquidadeEcliptica.parent) {
            labelObliquidadeEcliptica.parent.remove(labelObliquidadeEcliptica);
        }

        lastObliq.children[0].children[0].add(labelObliquidadeEcliptica);
        equadorCeleste.add(lastObliq);

        return lastObliq;
    }

    o.valorObliquidadeEcliptica = function () {
        return eixoTerrestre;
    };

    o.setIncrementoRotacao = function (incr) {
        incrementoRotacao = incr;
    };

    o.setIncrementoPrecessao = function (incr) {
        incrementoPrecessao = incr;
    };

    o.setIncrementoTranslacao = function (incr) {
        incrementoTranslacao = incr;
    };

    o.setMaxTimescale = function (t) {
        maxTimescale = t;
    };

    o.obliquidadeEcliptica = function (obliquidade, noInit) {
        if (!noInit) {
            removeCoords();
        }

        objetoTerra.rotation.x = obliquidade;

        eixoTerrestre = obliquidade;

        return criarObliquidadeEcliptica(obliquidade);
    };

    o.coordenadasEclipticas = function (longitudeAngulo, latitudeAngulo, obliquidade) {
        function setC() {

            removeCoords();

            var obliquidadeObjeto = o.obliquidadeEcliptica(obliquidade);

            var cEclipticas = new THREE.Object3D();
            cEclipticas.scale.multiplyScalar(escalaFirmamento);

            var longitude = MathHelper.buildLimitedSphereLines(longitudeAngulo, -raioPlaneta, 0xF0F0F0, false, 0.001, 1);
            longitude.rotation.x = Math.PI;

            var verticeMeio = longitude.children[0].geometry.vertices[parseInt(longitude.children[0].geometry.vertices.length / 2)];
            var x = verticeMeio.x;
            var z = verticeMeio.z;
            var longitudeR = new THREE.Object3D();
            longitudeR.add(longitude);
            longitudeR.position.x = x;
            longitudeR.position.z -= z;

            cEclipticas.add(longitudeR);

            var label = ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.LONGITUDE_ECLIPTICA, longitude);
            label.scale.multiplyScalar(1 / 10);

            var latitude = MathHelper.buildLimitedSphereLines(-latitudeAngulo, -raioPlaneta, 0xF0F0F0, false, 0.001);
            latitude.rotation.x = -Math.PI / 2;

            var verticeMeio = latitude.children[0].geometry.vertices[parseInt(latitude.children[0].geometry.vertices.length / 2)];
            var x = verticeMeio.x;
            var z = verticeMeio.z;
            var latitudeR = new THREE.Object3D();
            latitudeR.add(latitude);
            latitudeR.position.x = x;
            latitudeR.position.y = z;

            var latitudeFinal = new THREE.Object3D();
            latitudeFinal.add(latitudeR);
            latitudeFinal.rotation.y = longitudeAngulo;
            cEclipticas.add(latitudeFinal);

            label = ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.LATITUDE_ECLIPTICA, latitude);
            label.scale.multiplyScalar(1 / 10);

            var dir = new THREE.Vector3(Math.PI / 2, 0, 0);
            var origem = new THREE.Vector3(0, 0, 0);
            var tamanho = raioPlaneta;
            var corMarcador = 0x777700;

            var marcadorCoordenada = new THREE.ArrowHelper(dir, origem, tamanho, corMarcador);
            var mCoordFinal = new THREE.Object3D();
            mCoordFinal.add(marcadorCoordenada);

            mCoordFinal.rotation.y = Math.PI + longitudeAngulo;
            mCoordFinal.rotation.z = latitudeAngulo;

            cEclipticas.add(mCoordFinal);

            cadCoords(precessaoTerra, cEclipticas);

            ultCoords = {t: 'ECLIPTICA', c: cEclipticas, o: -obliquidade, obliquidadeObjeto: obliquidadeObjeto};

            $('.hover-label-text').show();
        }

        setC();
    };

    o.coordenadasEquatoriais = function (anguloAscensaoReta, anguloDeclinacao, noInit) {

        if (!noInit) {
            removeCoords();
        }

        var ascensaoReta = MathHelper.buildLimitedSphereLines(anguloAscensaoReta, -raioPlaneta * escalaFirmamento, 0xF0F0F0, false, 0.001, 1);
        ascensaoReta.rotation.x = Math.PI;

        var verticeMeio = ascensaoReta.children[0].geometry.vertices[parseInt(ascensaoReta.children[0].geometry.vertices.length / 2)];
        var x = verticeMeio.x;
        var z = verticeMeio.z;
        var aR = new THREE.Object3D();
        aR.add(ascensaoReta);
        aR.position.x = x;
        aR.position.z -= z;

        cadCoords(equadorCeleste, aR);

        ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.ASCENSAO_RETA, ascensaoReta);

        var declinacao = MathHelper.buildLimitedSphereLines(-anguloDeclinacao, -raioPlaneta * escalaFirmamento, 0xF0F0F0, false, 0.001);
        declinacao.rotation.x = -Math.PI / 2;

        var verticeMeio = declinacao.children[0].geometry.vertices[parseInt(declinacao.children[0].geometry.vertices.length / 2)];
        var x = verticeMeio.x;
        var z = verticeMeio.z;
        var declinacaoR = new THREE.Object3D();
        declinacaoR.add(declinacao);
        declinacaoR.position.x = x;
        declinacaoR.position.y = z;

        var declinacaoFinal = new THREE.Object3D();
        declinacaoFinal.add(declinacaoR);
        declinacaoFinal.rotation.y = anguloAscensaoReta;
        cadCoords(equadorCeleste, declinacaoFinal);

        ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.DECLINACAO, declinacao);

        var dir = new THREE.Vector3(Math.PI / 2, 0, 0);
        var origem = new THREE.Vector3(0, 0, 0);
        var tamanho = raioPlaneta * escalaFirmamento;
        var corMarcador = 0x777700;

        var marcadorCoordenada = new THREE.ArrowHelper(dir, origem, tamanho, corMarcador);
        var mCoordFinal = new THREE.Object3D();
        mCoordFinal.add(marcadorCoordenada);

        mCoordFinal.rotation.y = Math.PI + anguloAscensaoReta;
        mCoordFinal.rotation.z = anguloDeclinacao;

        cadCoords(equadorCeleste, mCoordFinal);

        ultCoords = null;

        $('.hover-label-text').show();

        return mCoordFinal;
    };

    o.tempoSideral = function (ts) {
        removeCoords();

        var tempoSideralObjeto = MathHelper.buildLimitedSphereLines(-ts, -raioPlaneta * escalaFirmamento, 0xF0F0F0, false, 0.001, 1);
        tempoSideralObjeto.rotation.x = Math.PI;

        var verticeMeio = tempoSideralObjeto.children[0].geometry.vertices[parseInt(tempoSideralObjeto.children[0].geometry.vertices.length / 2)];
        var x = verticeMeio.x;
        var z = verticeMeio.z;
        var aR = new THREE.Object3D();
        aR.add(tempoSideralObjeto);
        aR.position.x = x;
        aR.position.z -= z;

        cadCoords(equadorCeleste, aR);

        ThreeHelper.createLabel("TS = " + ON_DAED.tempoSideral(ts), tempoSideralObjeto, camera);

        ultCoords = null;
    };

    o.getRotacaoAtualTerra = function () {
        return objetoTerra.rotation.y % (Math.PI * 2);
    };

    function criarHaste(rot, cor) {
        var corHaste = cor || 0xFFFFFF;

        var anguloHorarioPonteiroGeo = new THREE.Geometry();

        anguloHorarioPonteiroGeo.vertices.push(new THREE.Vector3(-(raioPlaneta * escalaFirmamento), 0, 0));
        anguloHorarioPonteiroGeo.vertices.push(new THREE.Vector3(0, 0, 0));
        anguloHorarioPonteiroGeo.computeLineDistances();

        var matAnguloHorarioPonteiro = new THREE.LineBasicMaterial({linewidth: 1, color: corHaste});

        var anguloHorarioPonteiro = new THREE.Line(anguloHorarioPonteiroGeo, matAnguloHorarioPonteiro, THREE.LineStrip);
        var anguloHorarioPonteiroR = new THREE.Object3D();
        anguloHorarioPonteiroR.add(anguloHorarioPonteiro);

        anguloHorarioPonteiroR.position.x = raioPlaneta * escalaFirmamento;

        var anguloHorarioPonteiroFinal = new THREE.Object3D();
        anguloHorarioPonteiroFinal.add(anguloHorarioPonteiroR);

        anguloHorarioPonteiroFinal.rotation.y = rot;

        return anguloHorarioPonteiroFinal;
    }

    o.anguloHorario = function (longitudeObservador, ascensaoReta) {
        removeCoords();

        rotacaoTerra(-objetoTerra.rotation.y + Math.PI); // RESET

        var tempoSideral = new THREE.Object3D();
        var anguloHorario = new THREE.Object3D();

        for (var i = 0; i < 24; i++) {
            var label = ON_DAED["3D"].createTextLabel(i, tempoSideral);
            label.position.x = Math.cos(15 * (24 - i) * Math.PI / 180) * raioPlaneta * escalaFirmamento * 1.1;
            label.position.z = Math.sin(15 * (24 - i) * Math.PI / 180) * raioPlaneta * escalaFirmamento * 1.1;
        }

        tempoSideral.rotation.y = Math.PI;

        for (var i = 0; i < 24; i++) {
            var label = ON_DAED["3D"].createTextLabel(i, anguloHorario);
            label.position.x = Math.cos(15 * i * Math.PI / 180) * raioPlaneta * escalaFirmamento / 2;
            label.position.z = Math.sin(15 * i * Math.PI / 180) * raioPlaneta * escalaFirmamento / 2;
        }

        anguloHorario.rotation.y = longitudeObservador;

        var ascensaoRetaHaste = criarHaste(ascensaoReta, 0x427F30);
        tempoSideral.add(ascensaoRetaHaste);

        var tempoSideralLocal = criarHaste(0, 0x7F3042);
        anguloHorario.add(tempoSideralLocal);

        var tempoSideralGMT = criarHaste(-longitudeObservador, 0x113F82);
        anguloHorario.add(tempoSideralGMT);

        cadCoords(objetoTerra, anguloHorario);
        cadCoords(equadorCeleste, tempoSideral);
    };

    o.posicaoDataJuliana = function (dj) {
        var ts = Math.PI + ON_DAED.ASTRO.getSiderealTimeFromJulian(dj).apparentSiderealTime * 15 * (Math.PI / 180);
        if ($('#terra-prop-traj-sol').hasClass('active')) {
            $('#terra-prop-traj-sol').trigger('click');
        }

        if ($('#terra-prop-rot').hasClass('active')) {
            $('#terra-prop-rot').trigger('click');
        }

        var diaEquinocioVernal = 80; // 21 marco

        var diaAno = ON_DAED.diaDoAno(ON_DAED.ASTRO.getDateFromJulian(dj)) - diaEquinocioVernal;

        var qtdDia = 365.25;

        if (diaAno < 0) {
            diaAno += qtdDia;
        }

        // update rot
        rotacaoTerra(-objetoTerra.rotation.y + ts);

        var translacaoRot = (-Math.PI / 2 - (diaAno / qtdDia) * Math.PI * 2) + Math.PI * 2;

        // update translacao
        updateLight(translacaoRot);
    };

    o.coordenadasHorizontais = function (longitude, latitude, azimute, altura) {
        removeCoords();

        var escalaHorizonte = 2 / 3;

        var raioLatitudeFirmamento = raioPlaneta * escalaFirmamento;

        var circuloVisivelGeo = new THREE.CircleGeometry(raioLatitudeFirmamento * escalaHorizonte, 64, 32);

        var espacoVisivelMat = new THREE.MeshBasicMaterial(
                {
                    side: THREE.DoubleSide,
                    color: 0xFFFFFF,
                    transparent: true,
                    opacity: 0.5,
                    blending: THREE.AdditiveBlending
                });

        var circuloVisivel = new THREE.Mesh(circuloVisivelGeo, espacoVisivelMat);
        circuloVisivel.rotation.x = Math.PI / 2;

        var espacoVisivelR = new THREE.Object3D();
        espacoVisivelR.add(circuloVisivel);
        espacoVisivelR.position.y = raioPlaneta;

        var espacoVisivelFixAxis = new THREE.Object3D();
        espacoVisivelFixAxis.add(espacoVisivelR);
        espacoVisivelFixAxis.rotation.z = -Math.PI / 2;

        var espacoVisivelFinal = new THREE.Object3D();
        espacoVisivelFinal.add(espacoVisivelFixAxis);

        espacoVisivelFinal.rotation.z = latitude;
        espacoVisivelFinal.rotation.y = longitude;

        //ThreeHelper.createLabel("Horizonte", circuloVisivel, camera);

        cadCoords(objetoTerra, espacoVisivelFinal);

        var zeniteGeo = new THREE.Geometry();
        atmosfera.visible = false;

        zeniteGeo.vertices.push(new THREE.Vector3(-(raioPlaneta * escalaFirmamento), 0, 0));
        zeniteGeo.vertices.push(new THREE.Vector3(0, 0, 0));
        zeniteGeo.computeLineDistances();

        var zeniteMat = new THREE.LineBasicMaterial({linewidth: 1, color: 0xFFFFFF});

        var zenite = new THREE.Line(zeniteGeo, zeniteMat, THREE.LineStrip);
        var zeniteR = new THREE.Object3D();
        zeniteR.add(zenite);

        zeniteR.position.x = raioPlaneta * escalaFirmamento;

        zeniteR.rotation.y = longitude;
        zeniteR.rotation.z = latitude;

        var zeniteFinal = new THREE.Object3D();
        zeniteFinal.add(zenite);
        zeniteFinal.position.x = raioPlaneta * escalaFirmamento;

        espacoVisivelFinal.add(zeniteFinal);

        //ThreeHelper.createLabel("Zênite", zenite, camera);

        var meridianoLocal = MathHelper.buildLimitedSphereLines(Math.PI, raioPlaneta * escalaFirmamento * escalaHorizonte, 0xFF5F7F, false, 0.001);
        meridianoLocal.position.z = raioPlaneta * escalaFirmamento * escalaHorizonte + raioPlaneta;
        meridianoLocal.rotation.z = Math.PI / 2;

        var meridianoFinal = new THREE.Object3D();
        meridianoFinal.rotation.y = Math.PI / 2;
        meridianoFinal.add(meridianoLocal);

        espacoVisivelFinal.add(meridianoFinal);

        var rosaDosVentos = new THREE.Object3D();

        var norte = new THREE.Object3D();
        norte.position.x = raioLatitudeFirmamento;

        var norteR = new THREE.Object3D();
        norteR.rotation.y = Math.PI / 2;
        norteR.add(norte);

        rosaDosVentos.add(norteR);

        var spriteN = ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.NORTE, norte);

        var texturaN = spriteN.material.map;

        var sul = new THREE.Object3D();
        sul.position.x = raioLatitudeFirmamento;

        var sulR = new THREE.Object3D();
        sulR.rotation.y = -Math.PI / 2;
        sulR.add(sul);

        rosaDosVentos.add(sulR);

        var spriteS = ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.SUL, sul);

        var texturaS = spriteS.material.map;

        var oeste = new THREE.Object3D();
        oeste.position.x = raioLatitudeFirmamento;

        var oesteR = new THREE.Object3D();
        oesteR.rotation.y = Math.PI;
        oesteR.add(oeste);

        rosaDosVentos.add(oesteR);

        var spriteO = ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.OESTE, oeste);

        var texturaO = spriteO.material.map;

        var leste = new THREE.Object3D();
        leste.position.x = raioLatitudeFirmamento;

        var lesteR = new THREE.Object3D();
        lesteR.add(leste);

        rosaDosVentos.add(lesteR);

        var spriteL = ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.LESTE, leste);

        var texturaL = spriteL.material.map;

        rosaDosVentos.rotation.x = Math.PI / 2;
        rosaDosVentos.rotation.z = -Math.PI / 2;

        var rosaDosVentosFinal = new THREE.Object3D();

        rosaDosVentosFinal.position.x = raioPlaneta;

        rosaDosVentosFinal.add(rosaDosVentos);

        espacoVisivelFinal.add(rosaDosVentosFinal);

        function setRosaDosVentosPoloNorte() {
            spriteN.material.map = spriteO.material.map = spriteS.material.map = spriteL.material.map = texturaS;
        }

        function setRosaDosVentosPoloSul() {
            spriteN.material.map = spriteO.material.map = spriteS.material.map = spriteL.material.map = texturaN;
        }

        function setRosaDosVentosNormal() {
            spriteN.material.map = texturaN;
            spriteO.material.map = texturaO;
            spriteS.material.map = texturaS;
            spriteL.material.map = texturaL;
        }

        o.updateRosaDosVentos = function (latitudeUsuario) {
            if (latitudeUsuario === Math.PI / 2) {
                setRosaDosVentosPoloNorte();
            } else if (latitudeUsuario === -Math.PI / 2) {
                setRosaDosVentosPoloSul();
            } else {
                setRosaDosVentosNormal();
            }
        };

        var azimuteR = MathHelper.buildLimitedSphereLines(azimute, raioLatitudeFirmamento * escalaHorizonte, 0x00FFFF, false, 0.001);

        var verticeMeio = azimuteR.children[0].geometry.vertices[parseInt(azimuteR.children[0].geometry.vertices.length / 2)];
        var x = verticeMeio.x;
        var z = verticeMeio.z;

        azimuteR.position.x = x;
        azimuteR.position.z = z;

        var azimuteRot = new THREE.Object3D();
        azimuteRot.rotation.z = Math.PI / 2;
        azimuteRot.rotation.y = Math.PI;
        azimuteRot.add(azimuteR);

        var azimuteFinal = new THREE.Object3D();
        azimuteFinal.position.x = raioPlaneta;
        azimuteFinal.add(azimuteRot);

        ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.AZIMUTE, azimuteR);

        espacoVisivelFinal.add(azimuteFinal);

        var alturaR = MathHelper.buildLimitedSphereLines(altura, raioPlaneta * escalaFirmamento * escalaHorizonte, 0x57F2AF, false, 0.001);

        var verticeMeio = alturaR.children[0].geometry.vertices[parseInt(alturaR.children[0].geometry.vertices.length / 2)];
        var x = verticeMeio.x;
        var z = verticeMeio.z;

        alturaR.position.x = x;
        alturaR.position.z = z;

        var alturaRot = new THREE.Object3D();
//            alturaRot.rotation.z = 0 ;
        alturaRot.rotation.y = Math.PI / 2;
        alturaRot.add(alturaR);

        var alturaFinal = new THREE.Object3D();
        alturaFinal.position.x = raioPlaneta;
        alturaFinal.rotation.x = Math.PI / 2 - azimute;
        alturaFinal.add(alturaRot);

        ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.ALTURA, alturaR);

        espacoVisivelFinal.add(alturaFinal);

        var distanciaZenital = Math.PI / 2 - altura;

        var distanciaZenitalR = MathHelper.buildLimitedSphereLines(distanciaZenital, raioPlaneta * escalaFirmamento * escalaHorizonte, 0xAFF257, false, 0.001);

        var verticeMeio = distanciaZenitalR.children[0].geometry.vertices[parseInt(distanciaZenitalR.children[0].geometry.vertices.length / 2)];
        var x = verticeMeio.x;
        var z = verticeMeio.z;

        distanciaZenitalR.position.x = x;
        distanciaZenitalR.position.z = z;

        var distanciaZenitalRot = new THREE.Object3D();
        distanciaZenitalRot.rotation.x = Math.PI;
        distanciaZenitalRot.add(distanciaZenitalR);

        var distanciaZenitalFinal = new THREE.Object3D();
        distanciaZenitalFinal.position.x = raioPlaneta;
        distanciaZenitalFinal.rotation.x = Math.PI / 2 - azimute;
        distanciaZenitalFinal.add(distanciaZenitalRot);

        ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.ZENITE, distanciaZenitalR);

        espacoVisivelFinal.add(distanciaZenitalFinal);

        var dir = new THREE.Vector3(0, 0, 0);
        var origem = new THREE.Vector3(0, 0, 0);
        var tamanho = raioLatitudeFirmamento * escalaHorizonte;
        var corMarcador = 0x777700;

        var marcadorCoordenada = new THREE.ArrowHelper(dir, origem, tamanho, corMarcador);

        marcadorCoordenada.rotation.x = -azimute;
        marcadorCoordenada.rotation.z = -altura;
        marcadorCoordenada.position.x = raioPlaneta;

        espacoVisivelFinal.add(marcadorCoordenada);

        ultCoords = null;

    };

    o.iniciarVerticesRastro = iniciarVertices;

    o.sempreMostrarObliquidade = function () {
        if (!sempreMostrarObliquidade) {
            oldEixo = eixoTerrestre;
            sempreMostrarObliquidade = true;
        }
    };

    camera.position.set(1000, 1000, 1000);

    $('.hover-label-text').show();

    $(document).ready(iniciarVertices);

    $(window).on('focus', iniciarVertices);

    rastro.visible = false;

    $('#load-modal').on('remove', function (e) {
        iniciarVertices();
        window.setTimeout(function () {
            rastro.visible = true;
        }, 500);
    });

    return o;
};