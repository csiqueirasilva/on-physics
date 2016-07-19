ON_DAED['3D'].PosicaoEclipse = function (observacaoFirmamento, observacaoLua) {

    var o = {};
    var camera = observacaoFirmamento.getCamera();

    var search = null;

    observacaoFirmamento.disableSprites();
    observacaoFirmamento.setObservacaoHorizontal(false);

    var eclipseLunarInferior = 178.5;
    var eclipseLunarSuperior = 181.5;
    var intervaloLunar = (eclipseLunarInferior + eclipseLunarSuperior) / 2;

    camera.fov = 15;
    camera.updateProjectionMatrix();

    var scene = observacaoFirmamento.getScene();
    
    var raioTerra = observacaoFirmamento.getRaioHorizonte() / 27;

    var terraRef = new THREE.Mesh(
            new THREE.SphereGeometry(raioTerra, 64, 32),
            new THREE.MeshLambertMaterial({
                map: new THREE.ImageUtils.loadTexture('imgs/texturas/terra/map.jpg')
            })
    );

    var terraBandeiras = new THREE.Mesh(
            new THREE.SphereGeometry(raioTerra, 64, 32),
            new THREE.MeshLambertMaterial({
                map: new THREE.ImageUtils.loadTexture('imgs/texturas/terra/bandeiras.png'),
                transparent: true
            })
    );

//    terraRef.add(terraBandeiras);

    var terra = new THREE.Object3D();
    terra.add(terraRef);

    ON_DAED['3D'].register(scene, terra, function() {
        var jd = parseFloat($('#input-data-juliana').val());
        //var hora = (jd - parseInt(jd)) + 0.5; 
        
        var ts = ON_DAED.ASTRO.getSiderealTimeFromJulian(jd).apparentSiderealTime * 15 * (Math.PI / 180);

//        terra.rotation.x = ON_DAED.ASTRO.getEclipticObliquity(jd).obliquityRadian;
        
        terraRef.rotation.y = ts;
    });

    observacaoLua.luaCastShadow(true);

    terraRef.receiveShadow = true;
    terraRef.castShadow = true;

    function updateCamera(julian) {
        var positionMoon = ON_DAED["ASTRO"].getMoonPosition(julian);
        var positionSun = ON_DAED["ASTRO"].getSolarCoordinates(julian);

        var itEncounter = Math.acos(
                Math.sin(positionSun.latitudeRadian) * Math.sin(positionMoon.latitudeRadian) +
                Math.cos(positionSun.latitudeRadian) * Math.cos(positionMoon.latitudeRadian) * Math.cos(Math.abs(positionSun.longitudeRadian - positionMoon.longitudeRadian))
                ) * 180 / Math.PI;

        if (itEncounter >= eclipseLunarInferior && itEncounter <= eclipseLunarSuperior) {
            var vermelho = (1 - Math.abs(itEncounter - intervaloLunar) / (eclipseLunarSuperior - intervaloLunar));
            observacaoLua.updateCorDifusaLua(1 - vermelho / 8, 1 - vermelho, 1 - vermelho);
        } else {
            observacaoLua.updateCorDifusaLua(1, 1, 1);
        }

        var base = 15;

        $('#label-distancia').html(new Number(Math.round(itEncounter * 100) / 100).toFixed(2));

//        camera.fov = (base + itEncounter) > 100 ? 100 : (base + itEncounter);
//        camera.updateProjectionMatrix();
    }

    function getFuso() {
//        return parseFloat($('#fuso').val()) + ($('#input-horario-verao').is(':checked') ? 1 : 0);
        return 0;
    }

    var tipoEclipse = {
        "PARCIAL": 1,
        "TOTAL": 2,
        "ANULAR-TOTAL": 3,
        "ANULAR": 4
    };

    function setSolarEclipseData(eclipseData) {
        $('#dados-eclipse-solar').show();
        var fuso = getFuso();
        var tipo;

        for (var k in tipoEclipse) {
            if (eclipseData.eclipseType === tipoEclipse[k]) {
                tipo = k;
            }
        }

        var raioTerra = 6371;

        $('#row-solar-horario-maximo .label-dado').html(ON_DAED.formatarDataJuliana(eclipseData.maximumTime, fuso));
        $('#row-solar-tipo-eclipse .label-dado').html(tipo + " " + (eclipseData.central ? "CENTRAL" : "NÃO CENTRAL"));
        $('#row-solar-raio-sombra .label-dado').html((eclipseData.penumbralConeRadius * raioTerra).toFixed(2));
    }

    function setLunarEclipseData(eclipseData) {
        $('#dados-eclipse-lunar').show();
        var fuso = getFuso();
        $('#row-lunar-horario-maximo .label-dado').html(ON_DAED.formatarDataJuliana(eclipseData.maximumTime, fuso));

        $('#row-lunar-contato-penumbra .label-dado').html(ON_DAED.formatarDataJuliana(eclipseData.maximumTime - eclipseData.penumbralPhaseDuration, fuso));

        $('#row-lunar-previsao-duracao .label-dado').html(ON_DAED.tempoSideral(eclipseData.penumbralPhaseDuration * 2 * 2 * Math.PI));


        if (eclipseData.umbralEclipse) {
            $('#row-lunar-contato-umbra').show();

            $('#row-lunar-contato-umbra .label-dado').html(ON_DAED.formatarDataJuliana(eclipseData.maximumTime - eclipseData.partialPhaseDuration, fuso));

            if (!isNaN(eclipseData.totalPhaseDuration)) {
                $('#row-lunar-fase-total').show();
                $('#row-lunar-fase-total .label-dado').html(ON_DAED.formatarDataJuliana(eclipseData.maximumTime - eclipseData.totalPhaseDuration, fuso));
                $('#row-lunar-tipo-eclipse .label-dado').html("TOTAL");
            } else {
                $('#row-lunar-tipo-eclipse .label-dado').html("PARCIAL");
            }
        } else {

            $('#row-lunar-contato-umbra').hide();
            $('#row-lunar-fase-total').hide();

            $('#row-lunar-tipo-eclipse .label-dado').html("PENUMBRAL");
        }

    }

    function updateCalc(e, fuso) {
        var data = e.data;
        var julian = data.acc;
        var workerCalculando = data.calculando;

        var solarEclipse = ON_DAED.ASTRO.getSolarEclipse(julian);
        var lunarEclipse = ON_DAED.ASTRO.getLunarEclipse(julian);

        if (!solarEclipse.noEclipse && search === SEARCH_TYPE.SOLAR) {
            julian = solarEclipse.maximumTime;
            o.setDate(julian);
            search = null;
            setSolarEclipseData(solarEclipse);
        } else if (!lunarEclipse.noEclipse && search === SEARCH_TYPE.LUNAR) {
            julian = lunarEclipse.maximumTime;
            o.setDate(julian);
            search = null;
            setLunarEclipseData(lunarEclipse);
        }

        if (workerCalculando) {
            o.setDate(julian);
        } else {
            $('#cancelar-busca-eclipse').hide();
            $('#buscar-eclipses').show();
            $('#btn-abrir-form').prop('disabled', false);
        }
    }

    observacaoFirmamento.addUpdateCommand('getAcc', updateCalc);

    window.setInterval(function () {
        ON_DAED["3D"].workerLogica.postMessage({'cmd': 'getAcc'});
    }, 100);

    o.setDate = function (julian) {
        var date = julian || observacaoFirmamento.getDate();
        observacaoFirmamento.setDate(date);
    };

    var SEARCH_TYPE = {LUNAR: 1, SOLAR: 2};

    o.requestEclipseSolar = function () {
        search = SEARCH_TYPE.SOLAR;
        ON_DAED["3D"].workerLogica.postMessage({'cmd': 'eclipseSolar', 'data': observacaoFirmamento.getDate()});
    };

    o.requestEclipseLunar = function () {
        search = SEARCH_TYPE.LUNAR;
        ON_DAED["3D"].workerLogica.postMessage({'cmd': 'eclipseLunar', 'data': observacaoFirmamento.getDate()});
    };

    o.cancelarRequestEclipse = function () {
        ON_DAED["3D"].workerLogica.postMessage({'cmd': 'cancelarCalculo'});
    };

    o.addRequestUpdateWorker = function () {
        observacaoFirmamento.addUpdateRequest(function (date) {
            ON_DAED["3D"].workerLogica.postMessage({'cmd': observacaoFirmamento.OBSERVACAO_EQUATORIAL, 'data': date});
            updateCamera(date);
        });
    };

    o.getTerra = function () {
        return terra;
    };

    o.getRaioTerra = function () {
        return raioTerra;
    };

    return o;
};