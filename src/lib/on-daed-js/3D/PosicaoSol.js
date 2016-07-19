ON_DAED["3D"].PosicaoSol = function (observacaoFirmamento) {

    var o = {};

    var distanciaSol = 75;

    var raioDistanciaLuz = 10;

    var correcaoObjetoProximo = 1/30;

    var raioHorizonte = observacaoFirmamento.getRaioHorizonte();

    var ultimaDistancia = null;

    var luzTerra = new THREE.DirectionalLight(0xffffff, 1);

    luzTerra.castShadow = true;

    luzTerra.shadowCameraLeft = -raioHorizonte * raioDistanciaLuz / 4;
    luzTerra.shadowCameraRight = raioHorizonte * raioDistanciaLuz / 4;
    luzTerra.shadowCameraTop = raioHorizonte * raioDistanciaLuz / 4;
    luzTerra.shadowCameraBottom = -raioHorizonte * raioDistanciaLuz / 4;
    //luzTerra.shadowCameraVisible = true;

    luzTerra.shadowDarkness = 0.5;

    luzTerra.shadowCameraNear = raioDistanciaLuz * 500;
    luzTerra.shadowCameraFar = raioDistanciaLuz * 1000;

    luzTerra.shadowMapWidth = 2048;
    luzTerra.shadowMapHeight = 2048;

    observacaoFirmamento.getScene().add(luzTerra);

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

    observacaoFirmamento.getScene().add(skyBoxCompleto);

    ON_DAED["3D"].ativarFlaresSol();

    var objetoSol = ON_DAED["3D"].criarSol(observacaoFirmamento.getFirmamento());

    objetoSol.scale.multiplyScalar(0.8);

    o.posicaoSolar = function (ascensaoReta, declinacao, distancia) {
        var posicaoDoSol = MathHelper.sphericalToCartesian(raioHorizonte, Math.PI - ascensaoReta, -Math.PI / 2 + declinacao);
        posicaoDoSol.multiplyScalar(distancia * distanciaSol);
        objetoSol.position.copy(posicaoDoSol);
    };

    function updateSky() {
        observacaoFirmamento.getFirmamentoB().updateMatrixWorld();
        luzTerra.position.setFromMatrixPosition(objetoSol.matrixWorld);
        luzTerra.position.multiplyScalar(raioDistanciaLuz / 2.5);

        var modSet = luzTerra.position.y > 2000 ? 1 : luzTerra.position.y < 0 ? 0 : Math.abs(luzTerra.position.y / 2000);

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

        // roda skycube
        if (objetoSol.position.y < 0) {
            noite = true;

            if (skyBoxCompleto.rotation.z !== Math.PI) {
                skyBoxCompleto.rotation.z = Math.PI;
            }
        } else if (objetoSol.position.y > 0 && skyBoxCompleto.rotation.z !== 0) {
            noite = false;
            skyBoxCompleto.rotation.z = 0;
        }

        if (noite === true) {
            bBot = gBot = rBot = rMid = bMid = g = bTop = rTop = 0;
        }

        var modHorizonte = (modSet / limit);

        if (modHorizonte !== 1) {
            modHorizonte %= 1;
        }

        var maxRed = 0.18;
        var maxGreen = 0.05;

        var resultRed = maxRed * modHorizonte;
        var resultGreen = maxGreen * modHorizonte;
        rBot += resultRed;
        rTop += resultRed;
        rMid += resultRed;

        g += resultGreen;
        gBot += resultGreen;

        topLeftColor.setRGB(rTop, g, bTop);
        midLeftColor.setRGB(rMid, g, bMid);
        botLeftColor.setRGB(rBot, gBot, bBot);

//        skyBoxBot.material.color.setRGB(rBot, gBot, bBot);

//        skyBoxGeoBot.colorsNeedUpdate = true;
        skyBoxGeoMid.colorsNeedUpdate = true;
        skyBoxGeoTop.colorsNeedUpdate = true;
    }

    observacaoFirmamento.addObjectUpdate(updateSky);

    observacaoFirmamento.addUpdateCommand(observacaoFirmamento.OBSERVACAO_EQUATORIAL, function (e, fuso) {
        var position = e.data;
        ultimaDistancia = position.sun.R;
        
        o.posicaoSolar(position.sun.rightAscension, position.sun.declination, ultimaDistancia * correcaoObjetoProximo);
        
        var posHorizontal = ON_DAED.ASTRO.getTransformedCoordinates({
            localLatitude: observacaoFirmamento.getGeoCoords().lat,
            localLongitude: -observacaoFirmamento.getGeoCoords().long,
            from: "EQUATORIAL",
            to: "HORIZONTAL",
            rightAscension: position.sun.rightAscension,
            declination: position.sun.declination,
            julian: observacaoFirmamento.getDate()
        });
        
        $('#label-altura').html(ON_DAED.tempoSideral(posHorizontal.altitude, true));
    });

    observacaoFirmamento.addUpdateCommand('transitoSolar', function (e, fuso) {
        var transit = e.data;
        var correcaoMinutos = 0.00235;

        var semTransitoString = "--------";

        var horaNascer;
        var horaPassagem;
        var horaOcaso;
        var duracaoDia;

        if (transit.rising !== null && transit.setting !== null) {
            duracaoDia = (transit.setting - transit.rising);

            if (duracaoDia < 0) {
                duracaoDia %= 1;
                duracaoDia += 1;
            } else if (duracaoDia > 1) {
                duracaoDia %= 1;
            }

            duracaoDia = ON_DAED.tempoSideral(duracaoDia * 2 * Math.PI);
        } else {
            duracaoDia = semTransitoString;
        }

        if (transit.rising !== null) {
            horaNascer = (transit.rising + fuso / 24 + correcaoMinutos);

            if (horaNascer < 0) {
                horaNascer %= 1;
                horaNascer += 1;
            } else if (horaNascer > 1) {
                horaNascer %= 1;
            }

            horaNascer = ON_DAED.tempoSideral(horaNascer * 2 * Math.PI);
        } else {
            horaNascer = semTransitoString;
        }

        if (transit.transit !== null) {
            horaPassagem = (transit.transit + fuso / 24);

            if (horaPassagem < 0) {
                horaPassagem %= 1;
                horaPassagem += 1;
            } else if (horaPassagem > 1) {
                horaPassagem %= 1;
            }

            horaPassagem = ON_DAED.tempoSideral(horaPassagem * 2 * Math.PI);
        } else {
            horaPassagem = semTransitoString;
        }

        if (transit.setting !== null) {
            horaOcaso = (transit.setting + fuso / 24 - correcaoMinutos);

            if (horaOcaso < 0) {
                horaOcaso %= 1;
                horaOcaso += 1;
            } else if (horaOcaso > 1) {
                horaOcaso %= 1;
            }

            horaOcaso = ON_DAED.tempoSideral(horaOcaso * 2 * Math.PI);
        } else {
            horaOcaso = semTransitoString;
        }

        $('#nascer-sol').html(horaNascer);
        $('#passagem-meridiana-sol').html(horaPassagem);
        $('#ocaso-sol').html(horaOcaso);
        $('#duracao-do-dia').html(duracaoDia);
    });

    o.addRequestUpdateWorker = function () {
        observacaoFirmamento.addUpdateRequest(function (date, longitudeUsuario, latitudeUsuario) {
            ON_DAED["3D"].workerLogica.postMessage({'cmd': observacaoFirmamento.OBSERVACAO_EQUATORIAL, 'data': date});
            ON_DAED["3D"].workerLogica.postMessage({'cmd': 'transitoSolar', 'latitude': latitudeUsuario, 'longitude': longitudeUsuario, 'data': date});
        });
    };

    o.setUICallbacks = function () {

        var ui = $('.ui-observacao-horizontal');

        $(ui).mouseover(function (ev) {
            observacaoFirmamento.control().enabled = false;
        });

        $(ui).mouseout(function (ev) {
            observacaoFirmamento.control().enabled = true;
        });

    };

    o.setEscala = function(escala) {
        objetoSol.scale.x = objetoSol.scale.y = objetoSol.scale.z = escala;
    };
    
    o.setCorrecaoObjetoProximo = function(n) {
        correcaoObjetoProximo = n;
    };

    o.getWorldPosition = function () {
        var v = new THREE.Vector3();
        v.setFromMatrixPosition(objetoSol.matrixWorld);
        return v;
    };

    o.getDistancia = function () {
        return ultimaDistancia;
    };

    return o;
};
