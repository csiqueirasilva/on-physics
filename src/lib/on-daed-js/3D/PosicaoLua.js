ON_DAED["3D"].PosicaoLua = function (observacaoFirmamento) {

    var o = {};

    var raioHorizonte = observacaoFirmamento.getRaioHorizonte();
    var distanciaSol = 75;

    var firmamento = observacaoFirmamento.getFirmamento();
    var firmamentoB = observacaoFirmamento.getFirmamentoB();

    var correcaoObjetoProximo = 8;

    var camera = observacaoFirmamento.getCamera();

    var ultimaDistancia = null;

    var lua = new THREE.Mesh(
            new THREE.SphereGeometry(raioHorizonte / (14.9 * 2), 64, 32),
            new THREE.MeshPhongMaterial({
                map: THREE.ImageUtils.loadTexture("imgs/texturas/lua/lua-new.jpg")
            })
            );

    lua.receiveShadow = true;

    var luaRot = new THREE.Object3D();
    luaRot.add(lua);

    var luaRot2 = new THREE.Object3D();
    luaRot2.add(luaRot);

    var luaRot3 = new THREE.Object3D();
    luaRot3.add(luaRot2);

    var objetoLua = new THREE.Object3D();
    objetoLua.add(luaRot3);

    firmamento.add(objetoLua);

    o.posicaoLunar = function (ascensaoReta, declinacao, distancia) {
        var vector = MathHelper.sphericalToCartesian(raioHorizonte, Math.PI - ascensaoReta, -Math.PI / 2 + declinacao);
        vector.multiplyScalar(distanciaSol * distancia);
        objetoLua.position.copy(vector);

        luaRot2.rotation.z = -declinacao;
        luaRot.rotation.x = 0;
        luaRot3.rotation.y = Math.PI + ascensaoReta;
    };

    observacaoFirmamento.addUpdateCommand('fasesDaLua', function (e, fuso) {
        var fasesDaLua = e.data;

        var novaString = '<div style="clear: both;">\
                                <div class="label-resultado">Nova</div>\
                                <span id="fase-lua-nova">' + ON_DAED.formatarDataJuliana(fasesDaLua.nova, fuso) + '</span>\
                            </div>';
        var crescenteString = '<div style="clear: both;">\
                                <div class="label-resultado">Crescente</div>\
                                <span id="fase-lua-crescente">' + ON_DAED.formatarDataJuliana(fasesDaLua.crescente, fuso) + '</span>\
                            </div>';
        var cheiaString = '<div style="clear: both;">\
                                <div class="label-resultado">Cheia</div>\
                                <span id="fase-lua-cheia">' + ON_DAED.formatarDataJuliana(fasesDaLua.cheia, fuso) + '</span>\
                            </div>';
        var minguanteString = '<div style="clear: both;">\
                                <div class="label-resultado">Minguante</div>\
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
    });

    observacaoFirmamento.addUpdateCommand(observacaoFirmamento.OBSERVACAO_EQUATORIAL, function (e, fuso) {
        var position = e.data;

        ultimaDistancia = position.moon.R;

        o.posicaoLunar(position.moon.rightAscension, position.moon.declination, ultimaDistancia * correcaoObjetoProximo);
    });

    observacaoFirmamento.addObjectUpdate(function () {
        if (cameraLua) {
            positionCameraLua();
        }
    });

    observacaoFirmamento.addUpdateCommand('faseAtualLua', function (e, fuso) {
        var faseAtual = e.data;
        $('#fase-lua-atual').html(faseAtual.fase);
    });

    var lastCameraPosition = new THREE.Vector3(0, 0, 0);

    var cameraLua = false;

    function positionCameraLua() {
        var s = 0.85;

        firmamentoB.updateMatrixWorld();

        var pos = new THREE.Vector3();
        pos.setFromMatrixPosition(objetoLua.matrixWorld);

        camera.position.set(
                pos.x * s,
                pos.y * s,
                pos.z * s
                );

        camera.lookAt(pos);
    }

    o.cameraLua = function () {
        observacaoFirmamento.setSombraBonecao(false);
        lastCameraPosition.copy(camera.position);

        positionCameraLua();

        cameraLua = true;
        observacaoFirmamento.control().enabled = false;
    };

    o.cameraNormal = function () {
        observacaoFirmamento.setSombraBonecao(true);
        camera.position.copy(lastCameraPosition);
        observacaoFirmamento.control().target.set(0, 0, 0);
        cameraLua = false;
        observacaoFirmamento.control().enabled = true;
    };

    o.addRequestUpdateWorker = function () {
        observacaoFirmamento.addUpdateRequest(function (date) {
            ON_DAED["3D"].workerLogica.postMessage({'cmd': observacaoFirmamento.OBSERVACAO_EQUATORIAL, 'data': date});
            ON_DAED["3D"].workerLogica.postMessage({'cmd': 'fasesDaLua', 'data': date});
            ON_DAED["3D"].workerLogica.postMessage({'cmd': 'faseAtualLua', 'data': date});
        });
    };

    o.setUICallbacks = function () {

        var ui = $('.ui-observacao-horizontal');

        $(ui).mouseover(function (ev) {
            if (!cameraLua) {
                observacaoFirmamento.control().enabled = false;
            }
        });

        $(ui).mouseout(function (ev) {
            if (!cameraLua) {
                observacaoFirmamento.control().enabled = true;
            }
        });

    };

    o.setEscala = function (escala) {
        objetoLua.scale.x = objetoLua.scale.y = objetoLua.scale.z = escala;
    };

    o.updateCorEmissaoLua = function (r, g, b) {
        lua.material.emissive = new THREE.Color(r, g, b);
        lua.material.needsUpdate = true;
    };

    o.updateCorDifusaLua = function (r, g, b) {
        lua.material.color = new THREE.Color(r / 2, g / 2, b / 2);
        lua.material.needsUpdate = true;
    };

    o.luaCastShadow = function (cs) {
        lua.castShadow = cs;
    };

    o.getCameraLua = function () {
        return cameraLua;
    };

    o.setCorrecaoObjetoProximo = function (n) {
        correcaoObjetoProximo = n;
    };

    o.getWorldPosition = function () {
        var v = new THREE.Vector3();
        v.setFromMatrixPosition(lua.matrixWorld);
        return v;
    };

    o.getDistancia = function() {
        return ultimaDistancia;
    };

    return o;
};