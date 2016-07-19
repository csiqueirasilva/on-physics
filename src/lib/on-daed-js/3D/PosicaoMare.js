ON_DAED['3D'].PosicaoMare = function (observacaoFirmamento, posicaoEclipse, posicaoSol, posicaoLua) {

    var escalaDistanciaSol = 1 / 200;
    var escalaDistanciaLua = 1.25;

    posicaoSol.setEscala(0.1);
    posicaoSol.setCorrecaoObjetoProximo(escalaDistanciaSol);

    posicaoLua.setEscala(0.425);
    posicaoLua.setCorrecaoObjetoProximo(escalaDistanciaLua);

    var raioTerra = posicaoEclipse.getRaioTerra();

    var cameraMareControle = false;

    var mar = new THREE.Mesh(
            new THREE.SphereGeometry(raioTerra * 1.333, 24, 12),
            new THREE.MeshPhongMaterial({
                color: 0x0000FF,
                transparent: true,
                opacity: 0.66
            })
        );

    var scene = observacaoFirmamento.getScene();

    var escalaExterna = parseInt($('input#mares-escala-mar').attr('data-slider-value'));

    var camera = observacaoFirmamento.getCamera();

    for (var i = 0; i < mar.geometry.vertices.length; i++) {
        var vertice = mar.geometry.vertices[i];
        vertice.originalPosition = mar.geometry.vertices[i].clone();
        vertice.arrow = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 15, 0xFFFFFF, 5, 2.5);
        scene.add(vertice.arrow);
    }

    $('.hover-label-text').show();

    function calcTide(obj, ref, fact) {
        var vFinal = new THREE.Vector3();

        var xmMenosX = ref.clone().add(obj.clone().multiplyScalar(-1));
        var xmMenosXe = ref.clone();

        xmMenosX.multiplyScalar(1 / Math.pow(xmMenosX.length(), 3));
        xmMenosXe.multiplyScalar(-1 / Math.pow(xmMenosXe.length(), 3));

        vFinal.add(xmMenosX);
        vFinal.add(xmMenosXe);

        return vFinal.normalize().multiplyScalar(fact);
    }

    var distanciaCamera = 1750;

    ON_DAED['3D'].register(scene, mar, function () {
        var posSol = posicaoSol.getWorldPosition();
        var posLua = posicaoLua.getWorldPosition();

        if (cameraMareControle) {
            var cam = observacaoFirmamento.getCamera();
            cam.lookAt(posicaoEclipse.getTerra().position);
            cam.position.set(0, distanciaCamera, 0);
        }

        var escala = escalaExterna;

        var posSolLocal = mar.worldToLocal(posSol);
        var posLuaLocal = mar.worldToLocal(posLua);

        for (var i = 0; i < mar.geometry.vertices.length; i++) {
            var vertice = mar.geometry.vertices[i];

            vertice.copy(vertice.originalPosition);

            // mantendo a razao de 1 para o sol, aonde a lua tem 2.2
            var mareLua = calcTide(vertice, posLuaLocal, 0.44);
            var mareSol = calcTide(vertice, posSolLocal, 0.2);

            var mareTotal = new THREE.Vector3();
            mareTotal.add(mareLua);
            mareTotal.add(mareSol);
            mareTotal.multiplyScalar(escala);

            vertice.add(mareTotal);

            if (vertice.arrow) {
                vertice.arrow.position.copy(vertice);
                vertice.arrow.setDirection(mareTotal.multiplyScalar(1.5 * 1 / escala));
            }

        }

        ThreeHelper.updateText(camera);

        mar.geometry.verticesNeedUpdate = true;
    });

    var o = {};

    o.addRequestUpdateWorker = function () {
        observacaoFirmamento.addUpdateRequest(function (date) {
            $('#mares-info-marinha').hide();

            ON_DAED["3D"].workerLogica.postMessage({'cmd': observacaoFirmamento.OBSERVACAO_EQUATORIAL, 'data': date});

            var UA = 149597871;

            $('#distancia-sol').html(ON_DAED.formatarNumero(new Number(posicaoSol.getDistancia() * UA)));
            $('#distancia-lua').html(ON_DAED.formatarNumero(new Number(posicaoLua.getDistancia() * UA)));
            $('#mares-fase-lua').html(ON_DAED.obterFaseLua(date));
        });
    };

    o.getCameraPlano = function () {
        return cameraMareControle;
    };

    o.cameraMare = function () {
        observacaoFirmamento.control().enabled = false;
        cameraMareControle = true;
    };

    o.cameraNormal = function () {
        observacaoFirmamento.control().enabled = true;
        cameraMareControle = false;

        observacaoFirmamento.getCamera().position.set(distanciaCamera, 0, 0);
    };

    o.setEscalaExterna = function (ee) {
        escalaExterna = ee;
    };

    o.toggleSetas = function (v) {
        for (var i = 0; i < mar.geometry.vertices.length; i++) {
            var vertice = mar.geometry.vertices[i];
            vertice.arrow.visible = v;
        }
    };

    return o;
};