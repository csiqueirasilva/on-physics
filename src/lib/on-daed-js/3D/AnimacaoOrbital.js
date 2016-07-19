ON_DAED["3D"].AnimacaoOrbital = function (scene, camera) {
    // 80 == 0.0046 AU

    var objetoSol = new THREE.Object3D();

    scene.add(objetoSol);

    var coords = [];

    function removeCoords() {
        while (coords.length > 0) {
            coords[0].parent.remove(coords[0]);
            coords.splice(0, 1);
        }
    }

    function cadCoords(parent, obj) {
        parent.add(obj);
        coords.push(obj);
    }

    function criarOrbita(nome, a, b) {
        var focus = -Math.pow(a * a - b * b, 0.5);
        var curve = new THREE.EllipseCurve(focus, 0, a, b, 0, 2 * Math.PI, false);
        var path = new THREE.Path(curve.getPoints(120));
        var geo = path.createPointsGeometry(120);

        geo.computeLineDistances();

        var material = new THREE.LineDashedMaterial({
            color: 0xFFFFFF,
            dashSize: 1000,
            gapSize: 1000
        });

        var mesh = new THREE.Line(geo, material);

        mesh.position.x -= a + focus;

        var objeto = new THREE.Object3D();
        objeto.position.x += a + focus;
        objeto.add(mesh);

        var extObjeto = new THREE.Object3D();
        extObjeto.add(objeto);

        var planetaBase = new THREE.Object3D();
        planetaBase.position.x -= a;

        var planeta = new THREE.Object3D();
        planeta.position.x += a;

        planetaBase.add(planeta);
        objeto.add(planetaBase);

        var label = ON_DAED["3D"].createTextLabel(nome, planeta);
        label.scale.multiplyScalar(40);

        return extObjeto;
    }

    function eixoMaiorOrbita(semiEixoMaior) {
        return (semiEixoMaior / 0.0046) * 50;
    }

    // semiEixoMaior = AU
    function eixoMenorOrbita(semiEixoMaior, excentricidade) {
        var semiEixoMenor = semiEixoMaior * Math.pow(1 - excentricidade * excentricidade, 0.5);
        return semiEixoMenor;
    }

    var label = ON_DAED["3D"].createTextLabel('☉', objetoSol);
    label.scale.multiplyScalar(40);

    var excentricidade = null;
    var orbitaTerra = null;
    var semiEixoMaior = null;
    var semiEixoMenor = null;
    var focoSol = null;
    var terra = null;
    var lineMaterial = null;
    var geo = null;

    var o = {};

    o.exibirPosicaoNova = function (anomaliaExcentrica) {
        removeCoords();

        anomaliaExcentrica *= Math.PI / 180;

        var anomaliaMedia = anomaliaExcentrica - excentricidade * Math.sin(anomaliaExcentrica);

        var x = semiEixoMaior * Math.cos(anomaliaExcentrica);
        var y = Math.pow(semiEixoMenor * semiEixoMenor - (x * x * semiEixoMenor * semiEixoMenor) / (semiEixoMaior * semiEixoMaior), 0.5);

        terra.position.x = x;

        if (anomaliaMedia > Math.PI) {
            y = -y;
        }

        terra.position.y = y;

        var baseX = new THREE.Vector3(x, semiEixoMaior * Math.sin(anomaliaExcentrica), 0);

        geo = new THREE.Geometry();
        geo.vertices.push(new THREE.Vector3());
        geo.vertices.push(baseX.clone());
        geo.computeLineDistances();

        lineMaterial = lineMaterial.clone();
        lineMaterial.color.setRGB(0, 255, 0);

        var hipotenusaExcentricidade = new THREE.Line(geo, lineMaterial);
        cadCoords(terra.parent, hipotenusaExcentricidade);

        geo = new THREE.Geometry();
        geo.vertices.push(baseX.clone());
        var c = baseX.clone();
        c.y = 0;
        geo.vertices.push(c);
        geo.computeLineDistances();

        lineMaterial = lineMaterial.clone();
        lineMaterial.color.setRGB(0, 0, 255);

        var traceReferencia = new THREE.Line(geo, lineMaterial);
        cadCoords(terra.parent, traceReferencia);

        geo = new THREE.Geometry();
        geo.vertices.push(new THREE.Vector3());
        var c = new THREE.Vector3(semiEixoMaior * Math.cos(anomaliaMedia),
                semiEixoMaior * Math.sin(anomaliaMedia),
                0);
        geo.vertices.push(c);
        geo.computeLineDistances();

        lineMaterial = lineMaterial.clone();
        lineMaterial.color.setRGB(255, 0, 255);

        var traceReferencia = new THREE.Line(geo, lineMaterial);
        cadCoords(terra.parent, traceReferencia);

        var anomaliaExcentricaObj = MathHelper.buildLimitedSphereLines(anomaliaExcentrica, -semiEixoMaior * 0.075, 0x77FF77, false, 0.001, 1);
        anomaliaExcentricaObj.rotation.x = Math.PI / 2;
        anomaliaExcentricaObj.rotation.y = Math.PI;
        anomaliaExcentricaObj.rotation.z = Math.PI;

        var verticeMeio = anomaliaExcentricaObj.children[0].geometry.vertices[parseInt(anomaliaExcentricaObj.children[0].geometry.vertices.length / 2)];
        var x = verticeMeio.x;
        var z = verticeMeio.z;
        var anomaliaExcentricaObjetoR = new THREE.Object3D();
        anomaliaExcentricaObjetoR.add(anomaliaExcentricaObj);
        anomaliaExcentricaObjetoR.position.x = x;
        anomaliaExcentricaObjetoR.position.y += z;

        var anomaliaExcentricaObjetoFinal = new THREE.Object3D();
        anomaliaExcentricaObjetoFinal.add(anomaliaExcentricaObjetoR);

        anomaliaExcentricaObjetoFinal.rotation.x = Math.PI;
        anomaliaExcentricaObjetoFinal.rotation.y = Math.PI;

        cadCoords(terra.parent, anomaliaExcentricaObjetoFinal);

        var anomaliaMediaObj = MathHelper.buildLimitedSphereLines(anomaliaMedia, -semiEixoMaior * 0.15, 0xFFAAFF, false, 0.001, 1);
        anomaliaMediaObj.rotation.x = Math.PI / 2;
        anomaliaMediaObj.rotation.y = Math.PI;
        anomaliaMediaObj.rotation.z = Math.PI;

        var verticeMeio = anomaliaMediaObj.children[0].geometry.vertices[parseInt(anomaliaMediaObj.children[0].geometry.vertices.length / 2)];
        var x = verticeMeio.x;
        var z = verticeMeio.z;
        var anomaliaMediaObjR = new THREE.Object3D();
        anomaliaMediaObjR.add(anomaliaMediaObj);
        anomaliaMediaObjR.position.x = x;
        anomaliaMediaObjR.position.y += z;

        var anomaliaMediaObjFinal = new THREE.Object3D();
        anomaliaMediaObjFinal.add(anomaliaMediaObjR);

        anomaliaMediaObjFinal.rotation.x = Math.PI;
        anomaliaMediaObjFinal.rotation.y = Math.PI;

        cadCoords(terra.parent, anomaliaMediaObjFinal);

        var anomaliaVerdadeira = Math.acos((Math.cos((anomaliaExcentrica)) -
                excentricidade) /
                (1 - excentricidade * Math.cos((anomaliaExcentrica))));

        if (anomaliaMedia > Math.PI) {
            anomaliaVerdadeira = 2 * Math.PI - anomaliaVerdadeira;
        }

        var anomaliaVerdadeiraObj = MathHelper.buildLimitedSphereLines(anomaliaVerdadeira, -semiEixoMaior * 0.075, 0xFFFFAA, false, 0.001, 1);
        anomaliaVerdadeiraObj.rotation.x = Math.PI / 2;
        anomaliaVerdadeiraObj.rotation.y = Math.PI;
        anomaliaVerdadeiraObj.rotation.z = Math.PI;

        var verticeMeio = anomaliaVerdadeiraObj.children[0].geometry.vertices[parseInt(anomaliaVerdadeiraObj.children[0].geometry.vertices.length / 2)];
        var x = verticeMeio.x;
        var z = verticeMeio.z;
        var anomaliaVerdadeiraObjR = new THREE.Object3D();
        anomaliaVerdadeiraObjR.add(anomaliaVerdadeiraObj);
        anomaliaVerdadeiraObjR.position.x = x;
        anomaliaVerdadeiraObjR.position.y += z;

        var anomaliaVerdadeiraObjFinal = new THREE.Object3D();
        anomaliaVerdadeiraObjFinal.add(anomaliaVerdadeiraObjR);

        anomaliaVerdadeiraObjFinal.rotation.x = Math.PI;
        anomaliaVerdadeiraObjFinal.rotation.y = Math.PI;

        anomaliaVerdadeiraObjFinal.position.x = focoSol;

        cadCoords(terra.parent, anomaliaVerdadeiraObjFinal);

        geo = new THREE.Geometry();
        geo.vertices.push(new THREE.Vector3(focoSol, 0, 0));
        var c = terra.position.clone();
        geo.vertices.push(c);
        geo.computeLineDistances();

        lineMaterial = lineMaterial.clone();
        lineMaterial.color.setRGB(255, 255, 0);

        var traceReferencia = new THREE.Line(geo, lineMaterial);
        cadCoords(terra.parent, traceReferencia);

        return {media: anomaliaMedia, verdadeira: anomaliaVerdadeira, excentrica: anomaliaExcentrica};
    };

    o.setExcentricidade = function (exc) {
        excentricidade = exc;

        if (orbitaTerra !== null) {
            orbitaTerra.parent.remove(orbitaTerra);
        }

        // adicionando terra
        semiEixoMaior = eixoMaiorOrbita(1);
        semiEixoMenor = eixoMenorOrbita(semiEixoMaior, excentricidade);
        orbitaTerra = criarOrbita("♁", semiEixoMaior, semiEixoMenor);
        objetoSol.add(orbitaTerra);

        focoSol = Math.pow(semiEixoMaior * semiEixoMaior - semiEixoMenor * semiEixoMenor, 0.5);

        terra = orbitaTerra.children[0].children[1].children[0];

        var perielio = terra.position.clone();

        camera.position.z = 50000;

        var geo = new THREE.Geometry();
        geo.vertices.push(perielio.clone());
        var c = perielio.clone();
        c.multiplyScalar(-1);
        geo.vertices.push(c);
        geo.computeLineDistances();

        var material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF
        });

        var plotSemiEixoMaior = new THREE.Line(geo, material);

        var psem = new THREE.Object3D();
        psem.add(plotSemiEixoMaior);

        var tPsem = new THREE.Object3D();
        tPsem.position.copy(perielio);
        tPsem.position.multiplyScalar(0.5);

        psem.add(tPsem);

        terra.parent.add(psem);
        var label = ON_DAED["3D"].createTextLabel('a', tPsem);
        label.scale.multiplyScalar(40);

        geo = new THREE.Geometry();
        geo.vertices.push(new THREE.Vector3(0, semiEixoMenor, 0));
        geo.vertices.push(new THREE.Vector3(0, -semiEixoMenor, 0));
        geo.computeLineDistances();

        var material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF
        });

        var plotSemiEixoMenor = new THREE.Line(geo, material);

        var psem = new THREE.Object3D();
        psem.add(plotSemiEixoMenor);

        var tPsem = new THREE.Object3D();
        tPsem.position.set(0, -semiEixoMenor, 0);
        tPsem.position.multiplyScalar(0.5);

        psem.add(tPsem);

        terra.parent.add(psem);
        var label = ON_DAED["3D"].createTextLabel('b', tPsem);
        label.scale.multiplyScalar(40);

        var curve = new THREE.EllipseCurve(0, 0, semiEixoMaior, semiEixoMaior, 0, 2 * Math.PI, false);
        var path = new THREE.Path(curve.getPoints(120));
        var geo = path.createPointsGeometry(120);

        geo.computeLineDistances();

        lineMaterial = new THREE.LineBasicMaterial({
            color: 0xFF0000,
            dashSize: 1000,
            gapSize: 1000
        });

        var circuloReferencia = new THREE.Line(geo, lineMaterial);
        terra.parent.add(circuloReferencia);
    };

    o.setExcentricidade(0.67);

    o.getExcentricidade = function () {
        return excentricidade;
    };

    o.getSemiEixoMaior = function () {
        return Math.round(semiEixoMaior * 100) / 100;
    };

    o.getSemiEixoMenor = function () {
        return Math.round(semiEixoMenor * 100) / 100;
    };

    $('.hover-label-text').show();

    return o;
};
