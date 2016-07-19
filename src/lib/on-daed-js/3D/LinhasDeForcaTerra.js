ON_DAED["3D"].LinhasDeForcaTerra = function (scene, nGeraLinhas, nTamanhoExtensao, doNotAnimate) {

    var raioEsfera = 4;

    var usarAnimacaoPadrao = !doNotAnimate;

    nGeraLinhas = nGeraLinhas || 100;
    nTamanhoExtensao = nTamanhoExtensao || 20;

    // objeto 3d
    var wrapperLinhas = new THREE.Object3D();
    var wrapperGlobal = new THREE.Object3D();

    var texturaTerra = THREE.ImageUtils.loadTexture('imgs/texturas/terra/map.jpg');

    var esfera = new THREE.Mesh(new THREE.SphereGeometry(raioEsfera, 64, 32), new THREE.MeshBasicMaterial({map: texturaTerra}));

    var rotEixoEsfera = new THREE.Object3D();
    rotEixoEsfera.add(esfera);

    var objetoEsfera = new THREE.Object3D();
    objetoEsfera.add(rotEixoEsfera);

    wrapperGlobal.add(objetoEsfera);

    var eixoLinhas = new THREE.Object3D();
    eixoLinhas.add(wrapperLinhas);

    objetoEsfera.add(eixoLinhas);

    rotEixoEsfera.rotation.z = -Math.PI / 2;

    // pontos
    var pontos = [];

    // controle de animacao
    var velocidadeVento = 0.004;
    var tamanhoMaximoVento = 0.05;
    var velocidadeRotacao = 0.02;

    // caracteristicas do vento solar
    var ventoX = 0;
    var ventoY = 0;
    var ventoZ = 0;

    // limites esfera
    var xMax = raioEsfera;
    var xMin = -raioEsfera;

    var yMax = raioEsfera;
    var yMin = -raioEsfera;

    var zMax = raioEsfera;
    var zMin = -raioEsfera;

    var ventoRotacionado = new THREE.Vector3();

    function aplicaVentoSolar(modificado) {
        modificado.x += ventoRotacionado.x;
        modificado.y += ventoRotacionado.y;
        modificado.z += ventoRotacionado.z;
    }

    // geração de pontos
    function modificaPonto(ponto) {
        var modificado = dipole(ponto.x, ponto.y, ponto.z);

        aplicaVentoSolar(modificado);

        ponto.mX = modificado.x;
        ponto.mY = modificado.y;
        ponto.mZ = modificado.z;

        return ponto;
    }

    function geraPonto(xs, ys, zs, tipoCoordenada) {

        var arg1, arg2;

        if (tipoCoordenada === 'z') {
            arg1 = xs;
            arg2 = ys;
        } else if (tipoCoordenada === 'y') {
            arg1 = xs;
            arg2 = zs;
        } else if (tipoCoordenada === 'x') {
            arg1 = ys;
            arg2 = zs;
        }

        var azao = Math.pow(raioEsfera, 2) - Math.pow(arg1, 2) - Math.pow(arg2, 2);

        if (azao > 0) {
            var zs1 = Math.sqrt(azao);

            var sinal = Math.random() * 10 > 5 ? -1 : 1;
            if (sinal === 1) {
                zs1 = -zs1;
            }

            var x = xs,
                    y = ys,
                    z = zs;

            if (tipoCoordenada === 'z') {
                x = zs1;
            } else if (tipoCoordenada === 'y') {
                y = zs1;
            } else if (tipoCoordenada === 'x') {
                z = zs1;
            }

            var ponto = {
                x: x,
                y: y,
                z: z
            };

            pontos.push(ponto);
        }
    }

    /* Entrada em Radiano */
    function dircos(incl, decl, azim) {
        var o = {};

        var xincl = incl;
        var xdecl = decl;
        var xazim = azim;

        o.x = Math.cos(xincl) * Math.cos(xdecl - xazim);
        o.y = Math.cos(xincl) * Math.sin(xdecl - xazim);
        o.z = Math.sin(xincl);

        return o;
    }

    // características de magnetização

    var a = 0.5;
    var mi = 0;
    var md = 0;
    var m = 4.0;

    var xq = 0;
    var yq = 0;
    var zq = 0;

    // formatadores numéricos
    var cm = 1E-7;
    var t2nt = 1E9;

    function dipole(xRef, yRef, zRef) {
        var ret = {};

        var mDirCos = dircos(mi, md, 0);
        var rx = xRef - xq;
        var ry = yRef - yq;
        var rz = zRef - zq;

        var r2 = rx * rx + ry * ry + rz * rz;
        var raio = Math.sqrt(r2);

        var r5 = Math.pow(raio, 5);

        var dot = rx * mDirCos.x + ry * mDirCos.y + rz * mDirCos.z;
        var moment = 4 * Math.PI * (Math.pow(a, 3)) * (m / 3);

        ret.x = (cm * moment * (3 * dot * rx - r2 * mDirCos.x) / r5) * t2nt;
        ret.y = (cm * moment * (3 * dot * ry - r2 * mDirCos.y) / r5) * t2nt;
        ret.z = (cm * moment * (3 * dot * rz - r2 * mDirCos.z) / r5) * t2nt;

        return ret;
    }

    for (var i = 0; i < nGeraLinhas; i++) {
        var modX = Math.random();
        var modY = Math.random();
        var modZ = Math.random();
        
        var xs = modX * (xMax - xMin) + xMin;
        var ys = modY * (yMax - yMin) + yMin;
        var zs = modZ * (zMax - zMin) + zMin;

        geraPonto(xs, ys, zs, 'x');
        geraPonto(xs, ys, zs, 'y');
        geraPonto(xs, ys, zs, 'z');
    }

    // constrói pontos

    var materialLinha = new THREE.LineBasicMaterial({linewidth: 3, color: 0xFFFFFF, vertexColors: THREE.VertexColors});

    var razaoDeConstrucao = 5;

    function plotPontoDeLinha(xn, yn, zn) {
        var modificado = dipole(xn, yn, zn);

        aplicaVentoSolar(modificado);

        var mod = Math.sqrt(modificado.x * modificado.x + modificado.y * modificado.y + modificado.z * modificado.z);
        modificado.x = modificado.x / mod;
        modificado.y = modificado.y / mod;
        modificado.z = modificado.z / mod;

        xn = xn + modificado.x / razaoDeConstrucao;
        yn = yn + modificado.y / razaoDeConstrucao;
        zn = zn + modificado.z / razaoDeConstrucao;

        return {x: xn, y: yn, z: zn};
    }

    var linhas = [];

    function selecionaCor(xn, yn, zn) {
        return xn >= 0 ? 0xFF0000 : 0x0000FF;
    }

    function constroiLinhaDeForca(ponto, geoExt) {

        ponto = modificaPonto(ponto);

        var xmod = Math.sqrt(ponto.mX * ponto.mX + ponto.mY * ponto.mY + ponto.mZ * ponto.mZ);
        var xn = ponto.x + ponto.mX / xmod;
        var yn = ponto.y + ponto.mY / xmod;
        var zn = ponto.z + ponto.mZ / xmod;

        var rn = Math.sqrt(xn * xn + yn * yn + zn * zn);

        var ret = false;

        if (rn > raioEsfera) {

            var dx = ponto.mX / xmod;
            var dy = ponto.mY / xmod;
            var dz = ponto.mZ / xmod;

            var xn = ponto.x + dx / razaoDeConstrucao;
            var yn = ponto.y + dy / razaoDeConstrucao;
            var zn = ponto.z + dz / razaoDeConstrucao;

            var dif1 = 1;
            var dif2 = -1;

            var linhaGeo = geoExt || new THREE.Geometry();
            var idx = 0;

            while (dif1 > 0 && dif2 < 0) {
                var plotado = plotPontoDeLinha(xn, yn, zn);

                xn = plotado.x;
                yn = plotado.y;
                zn = plotado.z;

                if (!linhaGeo.vertices[idx]) {
                    linhaGeo.vertices.push(new THREE.Vector3(xn, yn, zn));
                    linhaGeo.colors.push(new THREE.Color(selecionaCor(xn, yn, zn)));
                } else {
                    linhaGeo.vertices[idx].set(xn, yn, zn);
                    linhaGeo.colors[idx].setHex(selecionaCor(xn, yn, zn));
                }

                var rn = Math.sqrt(xn * xn + yn * yn + zn * zn);
                dif1 = rn - raioEsfera;
                dif2 = rn - nTamanhoExtensao;

                idx++;
            }

            for (var i = idx; i < linhaGeo.vertices.length; i++) {
                linhaGeo.vertices[i].copy(linhaGeo.vertices[idx - 1]);
                linhaGeo.colors[i].setHex(selecionaCor(linhaGeo.vertices[i].x, linhaGeo.vertices[i].y, linhaGeo.vertices[i].z));
            }

            if (!geoExt) {
                linhas.push(linhaGeo);
                linhaGeo.computeLineDistances();
                var linha = new THREE.Line(linhaGeo, materialLinha, THREE.LineStrip);
                wrapperLinhas.add(linha);
            }

        } else {
            ret = true;
        }

        return ret;
    }

    for (var i = 0; i < pontos.length; i++) {
        var ponto = pontos[i];

        var remove = constroiLinhaDeForca(ponto);
        if (remove) {
            pontos.splice(i, 1);
            i--;
        }
    }

    var o = {};

    o.getEixoLinhas = function () {
        return eixoLinhas;
    };

    o.getWrapperLinhas = function () {
        return wrapperGlobal;
    };

    var icr = 0;

    o.setVelocidadeVento = function (arg) {
        velocidadeVento = arg;
    };

    o.setTamanhoMaximoVento = function (arg) {
        tamanhoMaximoVento = arg;
    };

    o.setVento = function (x, y, z) {
        ventoX = x;
        ventoY = y;
        ventoZ = z;
    };

    o.updateEixoTerrestre = function (n) {
        md = n;
        rotEixoEsfera.rotation.z = -Math.PI / 2 + n;
        eixoLinhas.rotation.z = n;
    };

    o.getRotacaoAtual = function () {
        return esfera.rotation.y;
    };

    o.setVelocidadeRotacao = function (n) {
        velocidadeRotacao = n;
    };

    ON_DAED['3D'].register(scene, wrapperGlobal, function () {
        if (wrapperGlobal.visible) {
            esfera.rotation.y += velocidadeRotacao;
            wrapperLinhas.rotation.x = esfera.rotation.y;

            ventoRotacionado.set(ventoX, ventoY, ventoZ);
            ventoRotacionado = MathHelper.rotateVector(ventoRotacionado, new THREE.Vector3(1, 0, 0), -wrapperLinhas.rotation.x);

            if (usarAnimacaoPadrao) {
                icr += velocidadeVento;
                ventoZ = tamanhoMaximoVento * Math.abs(Math.sin(icr / 2) + Math.sin(icr) + Math.cos(4 * icr));
            }

            for (var i = 0; i < linhas.length; i++) {
                var pontoBase = pontos[i];
                constroiLinhaDeForca(pontoBase, linhas[i]);
                linhas[i].verticesNeedUpdate = true;
                linhas[i].colorsNeedUpdate = true;
            }
        }
    });

    return o;
};