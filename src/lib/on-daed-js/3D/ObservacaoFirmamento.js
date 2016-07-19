ON_DAED["3D"].ObservacaoFirmamento = function (scene, camera, parent) {

    var o = {
        OBSERVACAO_EQUATORIAL: 'observacaoEquatorial'
    };

    var firmamento = new THREE.Object3D();
    var firmamentoL = new THREE.Object3D();
    var firmamentoB = new THREE.Object3D();

    firmamentoL.add(firmamento);
    firmamentoB.add(firmamentoL);

    var correcaoObjetoProximo = 8;

    var raioTerraCorrigido = 4.26E-8 * correcaoObjetoProximo;

    var objectUpdates = [];

    o.addObjectUpdate = function (fn) {
        if (fn instanceof Function) {
            objectUpdates.push(fn);
        }
    };

    var observacaoHorizontal = true;

    ON_DAED['3D'].register(scene, firmamentoB, function () {
        var jd = parseFloat($('#input-data-juliana').val());

        if (observacaoHorizontal) {
            var ts = ON_DAED.ASTRO.getSiderealTimeFromJulian(jd);
            firmamentoL.rotation.y = -Math.PI - ts.apparentSiderealTime * 15 * (Math.PI / 180) - longitudeUsuario;
            firmamentoB.rotation.z = latitudeUsuario - Math.PI / 2;
        } else {
            firmamentoB.rotation.y = firmamento.rotation.z = firmamentoL.rotation.y = firmamentoB.rotation.z = 0;
        }

        firmamentoB.updateMatrixWorld();

        var posVernal = new THREE.Vector3();
        posVernal.setFromMatrixPosition(pontoVernal.matrixWorld);

        var posMeridiano = MathHelper.rotateVector(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), latitudeUsuario);

        var angulo = Math.acos(posVernal.dot(posMeridiano) / (posVernal.length()));

        // TODO; translacao com angulo e raioTerraCorrigido

        scene.updateMatrixWorld();

        for (var i = 0; i < objectUpdates.length; i++) {
            objectUpdates[i]();
        }
    });

    var escalaPonto = 2;

    var posPontosReferencia = 2500;

    var pontoVernal = new THREE.Object3D();
    pontoVernal.position.x = posPontosReferencia;
    var pvSprite = ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.PONTO_VERNAL, pontoVernal);
    pvSprite.scale.multiplyScalar(escalaPonto);

    firmamento.add(pontoVernal);

    var pontoLibra = new THREE.Object3D();
    pontoLibra.position.x = -posPontosReferencia;
    var plSprite = ON_DAED["3D"].createTextLabel(ON_DAED["3D"].TEXT_LABEL.PONTO_LIBRA, pontoLibra);
    plSprite.scale.multiplyScalar(escalaPonto);

    firmamento.add(pontoLibra);

    var raioHorizonte = 750;

    var circuloVisivel = null;
    var gorduraCirculoMesh = null;

    o.addPlataformaObservacao = function () {

        var circuloVisivelGeo = new THREE.CircleGeometry(raioHorizonte, 64, 32);

        var espacoVisivelMat = new THREE.MeshLambertMaterial(
                {
                    side: THREE.DoubleSide,
                    color: 0xFFFFFF
                });

        circuloVisivel = new THREE.Mesh(circuloVisivelGeo, espacoVisivelMat);
        scene.add(circuloVisivel);
        circuloVisivel.rotation.x = -Math.PI / 2;
        circuloVisivel.receiveShadow = true;

        var alturaPlataforma = 10;
        var gorduraCirculo = new THREE.CylinderGeometry(raioHorizonte, raioHorizonte, alturaPlataforma, 64, 32);
        gorduraCirculoMesh = new THREE.Mesh(gorduraCirculo, espacoVisivelMat);
        gorduraCirculoMesh.position.y -= alturaPlataforma / 2;
        scene.add(gorduraCirculoMesh);

        var escalaLogo = 1.4;

        var logoOn = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(raioHorizonte * escalaLogo, raioHorizonte * escalaLogo),
                new THREE.MeshLambertMaterial({
                    map: THREE.ImageUtils.loadTexture("imgs/logo-on-nome.jpg"),
                    side: THREE.DoubleSide
                }));

//    logoOn.rotation.y = Math.PI;    
//    logoOn.rotation.y = Math.PI / 2;

        logoOn.position.z = 3;
        logoOn.rotation.z = -Math.PI / 2;

        logoOn.receiveShadow = true;

        circuloVisivel.add(logoOn);
    };

    var rosaDosVentosDisplay = true;

    var spriteN = ON_DAED["3D"].createTextLabel("N", scene);

    spriteN.position.x = raioHorizonte;

    var texturaN = spriteN.material.map;

    var spriteO = ON_DAED["3D"].createTextLabel("O", scene);

    spriteO.position.z = -raioHorizonte;

    var texturaO = spriteO.material.map;

    var spriteL = ON_DAED["3D"].createTextLabel("L", scene);

    spriteL.position.z = raioHorizonte;

    var texturaL = spriteL.material.map;

    var spriteS = ON_DAED["3D"].createTextLabel("S", scene);

    spriteS.position.x = -raioHorizonte;

    var texturaS = spriteS.material.map;

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

    spriteN.scale.multiplyScalar(2);
    spriteO.scale.multiplyScalar(2);
    spriteS.scale.multiplyScalar(2);
    spriteL.scale.multiplyScalar(2);

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

    var ambient = new THREE.AmbientLight(0x111111);
    scene.add(ambient);

    var bonecao = null;

    function setSombraBonecao(v) {
        if (bonecao !== null) {
            bonecao.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = v;
                }
            });
        }
    }

    $('#load-modal').data('loadOBJMTL')('Sue', 'obj/Sue/Sue.obj', 'obj/Sue/Sue.mtl', function (object) {

        var material = new THREE.MeshLambertMaterial({
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

        bonecao = object;
    });


    var animacao = null;

    o.pararAnimacao = function () {
        if (animacao !== null) {
            window.clearInterval(animacao);
            animacao = null;
        }
    };

    o.posicaoAnimacao = function (updt, scale) {
        if (animacao === null) {
            var intervalo = updt || 100;
            scale = scale || 1;

            var date = parseFloat($('#input-data-juliana').val());

            animacao = window.setInterval(function () {
                $('#input-data-juliana').val(date).trigger('change');
                date += .000011574 * (intervalo / 1000) * scale;
            }, intervalo);
        }
    };

    o.updateRosaDosVentos = updateLabelRosaDosVentos;

    camera.position.x = -2250;
    camera.position.y = 1750;

    var controlFar = new THREE.OrbitControls(camera);

    o.control = function () {
        return controlFar;
    };

    var longitudeUsuario = 0;
    var latitudeUsuario = 0;

    function updateLatitude(latitude, updateAP) {
        latitudeUsuario = latitude * Math.PI / 180;

        if (updateAP) {
            $('#coordenada-latitude-local').anglepicker("value", 2 * latitudeUsuario * 180 / Math.PI);
        } else {
            $('#row-label-resultado-longitude').show();
            $('#row-label-resultado-latitude').show();
            $('#row-label-resultado-cidade').hide();
            $('#label-cidade-form').hide();
        }

        $('#label-latitude').html(ON_DAED.tempoSideral(latitudeUsuario, true));

        if (latitudeUsuario === Math.PI / 2) {
            setRosaDosVentosPoloNorte();
        } else if (latitudeUsuario === -Math.PI / 2) {
            setRosaDosVentosPoloSul();
        } else {
            setRosaDosVentosNormal();
        }
    }

    function updateLongitude(longitude, updateAP) {
        longitudeUsuario = longitude * Math.PI / 180;

        if (updateAP) {
            $('#coordenada-longitude-local').anglepicker("value", longitudeUsuario * 180 / Math.PI);
        } else {
            $('#row-label-resultado-longitude').show();
            $('#row-label-resultado-latitude').show();
            $('#row-label-resultado-cidade').hide();
            $('#label-cidade-form').hide();
        }

        $('#label-longitude').html(ON_DAED.tempoSideral(longitudeUsuario, true));
    }

    function updateGeoCoords(longitude, latitude) {
        updateLongitude(longitude, true);
        updateLatitude(latitude, true);
    }

    function getHorarioVerao() {
        return $('#input-horario-verao').is(':checked') ? 1 : 0;
    }

    var updateCommands = {};
    var updateObservacao = [];

    ON_DAED["3D"].workerLogica.addEventListener('message', function (e) {
        var cmd = e.data.cmd;
        var fuso = parseFloat($('#fuso').val()) + getHorarioVerao();

        if (cmd === o.OBSERVACAO_EQUATORIAL) {
            for (var i = 0; i < updateObservacao.length; i++) {
                updateObservacao[i](e, fuso);
            }
        } else if (updateCommands[cmd] instanceof Function) {
            updateCommands[cmd](e, fuso);
        }
    });

    o.addUpdateCommand = function (cmd, fn) {
        if (fn instanceof Function) {
            if (cmd === o.OBSERVACAO_EQUATORIAL) {
                updateObservacao.push(fn);
            } else {
                updateCommands[cmd] = fn;
            }
        }
    };

    var updateRequests = [];

    o.addUpdateRequest = function (fn) {
        if (fn instanceof Function) {
            updateRequests.push(fn);
        }
    };

    o.requestUpdateWorker = function (date) {
        var data = $('#dia-mes-ano-row').children('input').map(function (k, v) {
            return parseFloat($(v).val());
        });

        var horario = $('#hora-minuto-segundo-row').children('input').map(function (k, v) {
            return parseFloat($(v).val());
        });

        $('#label-hora').html(ON_DAED.formatarHora(horario[0], horario[1], horario[2]));
        $('#label-data').html(ON_DAED.formatarData(data[0], data[1], data[2]));

        for (var i = 0; i < updateRequests.length; i++) {
            updateRequests[i](date, longitudeUsuario, latitudeUsuario);
        }
    };

    o.updateGeoCoords = updateGeoCoords;

    $(document).ready(function () {

        $('#row-label-resultado-longitude').hide();
        $('#row-label-resultado-latitude').hide();

        window.navigator.geolocation.getCurrentPosition(function (a) {
            updateGeoCoords(a.coords.longitude, a.coords.latitude);
            o.requestUpdateWorker(parseFloat($('#input-data-juliana').val()));
        });

        var atualizacaoInterval = null;

        var btnAtualizacao = $('#atualizacao-automatica');

        function pegarHorario() {
            var gregorian = new Date();

            var fusoInput = ON_DAED.fusoOriginal(gregorian);
            $('#fuso').val(fusoInput);

            if (ON_DAED.horarioVerao(gregorian)) {
                $('#input-horario-verao').prop('checked', 'checked');
            } else {
                $('#input-horario-verao').prop('checked', false);
            }

            var fuso = parseFloat(fusoInput) + getHorarioVerao();
            var dateInput = $('#dia-mes-ano-row').children('input');
            var horaInput = $('#hora-minuto-segundo-row').children('input');

            $(dateInput[0]).val(gregorian.getDate());
            $(dateInput[1]).val(gregorian.getMonth() + 1);
            $(dateInput[2]).val(gregorian.getFullYear());

            var hora = gregorian.getUTCHours() + fuso;

            if (hora < 0) {
                hora += 24;
            }

            $(horaInput[0]).val(hora);
            $(horaInput[1]).val(gregorian.getUTCMinutes());
            $(horaInput[2]).val(gregorian.getUTCSeconds());

            updateFromGregorian();
        }

        function atualizacaoAutomatica() {
            var inputs = $('nav input').not('input[type="checkbox"]');
            if (atualizacaoInterval === null) {
                inputs.prop('disabled', true);

                atualizacaoInterval = window.setInterval(pegarHorario, 1000);

            } else {
                window.clearInterval(atualizacaoInterval);
                inputs.prop('disabled', false);
                atualizacaoInterval = null;
            }
        }

        btnAtualizacao.click(atualizacaoAutomatica);

        var input = $('#input-data-juliana');

        function numericInput(obj) {
            if (isNaN($(obj).val()) || !$(obj).val()) {
                $(obj).val('0');
            }
        }

        var formData = $('#data-form');

        formData.on('show.bs.modal', function () {
            if (btnAtualizacao.is(':checked')) {
                btnAtualizacao.trigger('click');
            }
        });

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

            o.requestUpdateWorker(jd);
        }

        input.change(function () {
            var value = parseFloat($(this).val());

            if (isNaN(value) || value < 0) {
                $(this).val('0');
            }

            updateFromJulian(this);
        });

        $('#input-entrada-longitude-local-hidden').change(function (ev) {
            numericInput(this);
            updateLongitude($(this).val());
            updateFromGregorian();
        });

        $('#input-entrada-latitude-local-hidden').change(function (ev) {
            numericInput(this);
            updateLatitude($(this).val());
            updateFromGregorian();
        });

        var otherInputs = $('input').not(input).not('.geo-coords-input').not('[type="checkbox"]').not('[type="hidden"]').not('[type="text"]');

        function updateFromGregorian() {
            var data = $('#dia-mes-ano-row').children('input').map(function (k, v) {
                return parseFloat($(v).val());
            });

            var horario = $('#hora-minuto-segundo-row').children('input').map(function (k, v) {
                return parseFloat($(v).val());
            });

            if (parseFloat($('#fuso').val()) > 12) {
                $('#fuso').val(12);
            } else if (parseFloat($('#fuso').val()) < -12) {
                $('#fuso').val(-12);
            }

            var fuso = parseFloat($('#fuso').val()) + getHorarioVerao();

            var jd = Math.round(ON_DAED.ASTRO.getJulianFromGregorian(data[0], data[1], data[2], horario[0], horario[1], horario[2], -fuso) * 10000) / 10000;

            input.val(jd);

            o.requestUpdateWorker(jd);
        }

        otherInputs.change(function (ev) {
            numericInput(this);
            updateFromGregorian();
        });

        $('#input-horario-verao').change(function (ev) {
            updateFromGregorian();
        });

        // OBSERVATORIO NACIONAL
        updateGeoCoords(
                ON_DAED.parseTempoSideral(-43, -13, -22),
                ON_DAED.parseTempoSideral(-22, -53, -42.15)
                );

        $('#label-cidade').html("OBSERVATORIO NACIONAL");
        $('#label-cidade-form').html("OBSERVATORIO NACIONAL");
        $('#label-cidade-form').show();
        $('#row-label-resultado-cidade').show();
        $('#row-label-resultado-latitude').hide();
        $('#row-label-resultado-longitude').hide();

        btnAtualizacao.trigger('click');

        o.pegarHorario = pegarHorario;
    });

    o.getScene = function () {
        return scene;
    };

    o.getFirmamento = function () {
        return firmamento;
    };

    o.getFirmamentoL = function () {
        return firmamentoL;
    };

    o.getFirmamentoB = function () {
        return firmamentoB;
    };

    o.getRaioHorizonte = function () {
        return raioHorizonte;
    };

    o.getCamera = function () {
        return camera;
    };

    o.setSombraBonecao = setSombraBonecao;

    o.esconderElementosEstaticos = function () {
        scene.remove(bonecao);
        scene.remove(circuloVisivel);
        scene.remove(gorduraCirculoMesh);
    };

    o.mostrarElementosEstaticos = function () {
        scene.add(bonecao);
        scene.add(circuloVisivel);
        scene.add(gorduraCirculoMesh);
    };

    o.getGeoCoords = function () {
        return {lat: latitudeUsuario, long: longitudeUsuario};
    };

    o.getDate = function () {
        return parseFloat($('#input-data-juliana').val());
    };

    o.setDate = function (julian) {
        $('#input-data-juliana').val(julian).trigger('change');
    };

    o.setObservacaoHorizontal = function (obs) {
        observacaoHorizontal = obs;
    };

    o.disableSprites = function () {
        spriteN.visible = false;
        spriteS.visible = false;
        spriteL.visible = false;
        spriteO.visible = false;
        pontoVernal.visible = false;
        pontoLibra.visible = false;
    };

    return o;
}; 