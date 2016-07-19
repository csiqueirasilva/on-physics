ON_DAED["3D"].SistemaSolar = function (scene, camera, options) {
    if (!options) {
        // default
        options = {
            mercurio: false,
            venus: false,
            terra: false,
            marte: false,
            jupiter: false,
            saturno: false,
            urano: false,
            netuno: false,
            plutao: false,
            planoGalatico: true
        };
    }

    function criarOrbita(nome, a, b, anguloInclinacao) {
        var focus = Math.pow(a * a - b * b, 0.5);
        var curve = new THREE.EllipseCurve(focus, 0, a, b, 0, 2 * Math.PI, false);
        var path = new THREE.Path(curve.getPoints(120));
        var geo = path.createPointsGeometry(120);

        var material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF
        });

        var mesh = new THREE.Line(geo, material);
        mesh.rotation.x = anguloInclinacao;

        mesh.position.x -= a + focus;

        var objeto = new THREE.Object3D();
        objeto.position.x += a + focus;
        objeto.add(mesh);

        ThreeHelper.createLabel(nome, objeto, camera);

        return objeto;
    }

    var materialSol = new THREE.MeshBasicMaterial({
        color: 0xFFFF00,
        side: THREE.FrontSide
    });

    var inclinacaoPlanoGalatico = 60 * Math.PI / 180;

    function eixoMaiorOrbita(semiEixoMaior) {
        return (semiEixoMaior / 0.0046) * 50;
    }

    // semiEixoMaior = AU
    function eixoMenorOrbita(semiEixoMaior, excentricidade) {
        semiEixoMaior = eixoMaiorOrbita(semiEixoMaior);
        var semiEixoMenor = Math.pow(semiEixoMaior * semiEixoMaior - excentricidade * excentricidade, 0.5);
        return semiEixoMenor;
    }

    var raioSol = 0.005; // 0.0046 AU

    var geometriaEsfera = new THREE.SphereGeometry(raioSol, 64, 32);

    var objetoSol = new THREE.Mesh(geometriaEsfera, materialSol);

    if (options.mercurio) {
        var semiEixoMaior = 0.387;
        var excentricidade = 0.2056;
        objetoSol.add(criarOrbita("☿", eixoMaiorOrbita(semiEixoMaior), eixoMenorOrbita(semiEixoMaior, excentricidade), 3.38 * Math.PI / 180));
    }

    if (options.venus) {
        var semiEixoMaior = 0.723;
        var excentricidade = 0.0068;
        objetoSol.add(criarOrbita("♀", eixoMaiorOrbita(semiEixoMaior), eixoMenorOrbita(semiEixoMaior, excentricidade), 3.86 * Math.PI / 180));
    }

    if (options.terra) {
        var semiEixoMaior = 1;
        var excentricidade = 0.0167;
        objetoSol.add(criarOrbita("♁", eixoMaiorOrbita(semiEixoMaior), eixoMenorOrbita(semiEixoMaior, excentricidade), 7.155 * Math.PI / 180));
    }

    if (options.marte) {
        var semiEixoMaior = 1.524;
        var excentricidade = 0.0934;
        objetoSol.add(criarOrbita("♂", eixoMaiorOrbita(semiEixoMaior), eixoMenorOrbita(semiEixoMaior, excentricidade), 5.65 * Math.PI / 180));
    }

    if (options.jupiter) {
        var semiEixoMaior = 5.203;
        var excentricidade = 0.0484;
        objetoSol.add(criarOrbita("♃", eixoMaiorOrbita(semiEixoMaior), eixoMenorOrbita(semiEixoMaior, excentricidade), 6.09 * Math.PI / 180));
    }

    if (options.saturno) {
        var semiEixoMaior = 9.537;
        var excentricidade = 0.0542;
        objetoSol.add(criarOrbita("♄", eixoMaiorOrbita(semiEixoMaior), eixoMenorOrbita(semiEixoMaior, excentricidade), 5.51 * Math.PI / 180));
    }

    if (options.urano) {
        var semiEixoMaior = 19.191;
        var excentricidade = 0.0472;
        objetoSol.add(criarOrbita("♅", eixoMaiorOrbita(semiEixoMaior), eixoMenorOrbita(semiEixoMaior, excentricidade), 6.48 * Math.PI / 180));
    }

    if (options.netuno) {
        var semiEixoMaior = 30.069;
        var excentricidade = 0.0086;
        objetoSol.add(criarOrbita("♆", eixoMaiorOrbita(semiEixoMaior), eixoMenorOrbita(semiEixoMaior, excentricidade), 6.43 * Math.PI / 180));
    }

    if (options.plutao) {
        var semiEixoMaior = 39.482;
        var excentricidade = 0.2488;
        objetoSol.add(criarOrbita("♇", eixoMaiorOrbita(semiEixoMaior), eixoMenorOrbita(semiEixoMaior, excentricidade), 11.88 * Math.PI / 180));
    }

    var coords = [];
    var text = [];

    function removeCoords() {
        while (text.length > 0) {
            text[0].parent.remove(text[0]);
            var t = text.splice(0, 1)[0];
            t.material.dispose();
            delete t;
        }

        while (coords.length > 0) {
            coords[0].parent.remove(coords[0]);
            coords.splice(0, 1);
        }
    }

    function cadCoords(parent, obj) {
        parent.add(obj);
        coords.push(obj);
    }

    function cadText(t, parent) {
        var obj = ON_DAED["3D"].createTextLabel(t, parent);
        obj.scale.multiplyScalar(1 / 3);
        text.push(obj);
    }

    var o = {};

    o.cenaInformacao = new THREE.Scene();

    if (options.planoGalactico || options.planoSupergalactico) {

        var planoGalaticoTamanho = 200;

        var texturaViaLactea = THREE.ImageUtils.loadTexture('imgs/texturas/galaxias/vialactea.jpg');

        texturaViaLactea.minFilter = THREE.LinearFilter;

        var planoGalaticoGeo = new THREE.PlaneBufferGeometry(planoGalaticoTamanho, planoGalaticoTamanho);
        var planoGalaticoMat = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: texturaViaLactea,
            depthTest: false
        });

        var planoGalatico = new THREE.Mesh(planoGalaticoGeo, planoGalaticoMat);
        planoGalatico.position.x -= (planoGalaticoTamanho / 2);
        planoGalatico.position.y -= (planoGalaticoTamanho / 2);

        planoGalatico.data = {};

        planoGalatico.data.conteudo = "http://pt.wikipedia.org/w/api.php?action=parse&page=Via_Láctea&format=json&prop=text";

        planoGalatico.mover = function (event) {
            if (window.innerWidth >= 1024 && window.innerHeight >= 768) {
                if ($('.qtip:visible').length === 0) {
                    if (!this.data.loadedConteudo) {
                        ON_DAED.criarQtip("Carregando!", "mouse", true);
                        var data = this.data;
                        $.getJSON(this.data.conteudo + "&callback=?", function (c) {
                            var div = document.createElement('div');
                            div.className = "galaxia-qtip";
                            ON_DAED.wikipediaSnippet(c, div, true, true);
                            data.loadedConteudo = div.outerHTML;
                            window.setTimeout(function () {
                                $('.qtip').qtip('option', 'content.text', data.loadedConteudo);
                            }, 1000);
                        });
                    } else {
                        ON_DAED.criarQtip(this.data.loadedConteudo, "mouse", true);
                    }
                }
            }
        };

        planoGalatico.mout = function (event) {
            $('.qtip').qtip('hide');
        };

        var planoGalaticoT1 = new THREE.Object3D();
        planoGalaticoT1.add(planoGalatico);

        var planoGalaticoT2 = new THREE.Object3D();
        planoGalaticoT2.position.x += planoGalaticoTamanho / 2;
        planoGalaticoT2.position.y += planoGalaticoTamanho / 2;
        planoGalaticoT2.add(planoGalaticoT1);

        var planoGalaticoObjeto = new THREE.Object3D();
        planoGalaticoObjeto.add(planoGalaticoT2);

        planoGalaticoObjeto.rotation.x = -Math.PI / 2;

        objetoSol.rotation.x = inclinacaoPlanoGalatico;
        objetoSol.position.y = objetoSol.position.x = (planoGalaticoTamanho / 2) * 0.55;

        var rotacaoGalatica = Math.PI / 1.5;

        var objetoSolR = new THREE.Object3D();
        objetoSolR.rotation.z = rotacaoGalatica;

        objetoSolR.add(objetoSol);
        planoGalatico.add(objetoSolR);

        ON_DAED["3D"].createTextLabel("☉", objetoSol);

        ON_DAED["3D"].register(scene, planoGalaticoObjeto, function () {
//            planoGalatico.rotation.z -= 0.00000045;
//            refPlanoGalatico.rotation.z -= 0.00000045;
        });

        var refObjetoSol = objetoSol.clone();
        var refObjetoSolR = objetoSolR.clone();
        refObjetoSolR.add(refObjetoSol);

        var refPlanoGalatico = new THREE.Object3D();
        refPlanoGalatico.position.copy(planoGalatico.position);
        refPlanoGalatico.add(refObjetoSolR);

        var refPlanoGalaticoT1 = new THREE.Object3D();
        refPlanoGalaticoT1.add(refPlanoGalatico);

        var refPlanoGalaticoT2 = new THREE.Object3D();
        refPlanoGalaticoT2.position.copy(planoGalaticoT2.position);
        refPlanoGalaticoT2.add(refPlanoGalaticoT1);

        var refPlanoGalaticoObjeto = new THREE.Object3D();
        refPlanoGalaticoObjeto.rotation.copy(planoGalaticoObjeto.rotation);

        refPlanoGalaticoObjeto.add(refPlanoGalaticoT2);

        /* Outros objetos de referência */

        function parseStringTempoSideral(str) {
            var v = str.split(',');
            return ON_DAED.parseTempoSideral(parseFloat(v[0]), parseFloat(v[1]), parseFloat(v[2]));
        }

        function addGalaxia(dist, alpha, delta, path, conteudo, nome) {
            var alphaNumerico = parseStringTempoSideral(alpha) * 15 * (Math.PI / 180);
            var deltaNumerico = parseStringTempoSideral(delta) * Math.PI / 180;

            var gCoords = ON_DAED.ASTRO.getTransformedCoordinates({
                from: "EQUATORIAL",
                to: "GALACTIC",
                rightAscension: alphaNumerico,
                declination: deltaNumerico
            });

            var sCoords = ON_DAED.ASTRO.getTransformedCoordinates({
                from: "EQUATORIAL",
                to: "SUPERGALACTIC",
                rightAscension: alphaNumerico,
                declination: deltaNumerico
            });

            var texturaGalaxia = THREE.ImageUtils.loadTexture(path);

            texturaGalaxia.minFilter = THREE.LinearFilter;

            var andromedaMat = new THREE.SpriteMaterial({
                side: THREE.DoubleSide,
                map: texturaGalaxia,
                color: 0xFFFFFF,
                depthTest: false
            });

            var andromedaSprite = new THREE.Sprite(andromedaMat);

            andromedaSprite.scale.set(planoGalaticoTamanho, planoGalaticoTamanho, 1);
            andromedaSprite.position.x = (planoGalaticoTamanho / 2) * 0.8;

            var andromedaObject = new THREE.Object3D();
            andromedaObject.add(andromedaSprite);

            var andromedaObjectR = new THREE.Object3D();
            andromedaObjectR.rotation.y = Math.PI / 4 + rotacaoGalatica;
            andromedaObjectR.add(andromedaObject);

            var l = gCoords.longitude;
            var b = -((Math.PI / 2) + gCoords.latitude);
            var r = dist;

            andromedaObject.position.x = r * Math.sin(b) * Math.cos(l);
            andromedaObject.position.z = r * Math.sin(b) * Math.sin(l);
            andromedaObject.position.y = r * Math.cos(b);

            andromedaSprite.name = path;

            andromedaSprite.data = {};

            andromedaSprite.data.l = gCoords.longitude * 180 / Math.PI;
            andromedaSprite.data.b = gCoords.latitude * 180 / Math.PI;
            andromedaSprite.data.L = sCoords.longitude * 180 / Math.PI;
            andromedaSprite.data.B = sCoords.latitude * 180 / Math.PI;
            andromedaSprite.data.conteudo = conteudo;
            andromedaSprite.data.nome = nome;

            andromedaSprite.mover = function (event) {
                if (window.innerWidth >= 1024 && window.innerHeight >= 768) {
                    if ($('.qtip:visible').length === 0) {
                        if (!this.data.loadedConteudo) {
                            ON_DAED.criarQtip("Carregando!", "mouse", true);
                            var data = this.data;
                            $.getJSON(this.data.conteudo + "&callback=?", function (c) {
                                var div = document.createElement('div');
                                div.className = "galaxia-qtip";
                                ON_DAED.wikipediaSnippet(c, div, true, true);
                                data.loadedConteudo = div.outerHTML;
                                window.setTimeout(function () {
                                    $('.qtip').qtip('option', 'content.text', data.loadedConteudo);
                                }, 1000);
                            });
                        } else {
                            ON_DAED.criarQtip(this.data.loadedConteudo, "mouse", true);
                        }
                    }
                }
            };

            andromedaSprite.mout = function (event) {
                $('.qtip').qtip('hide');
            };

            andromedaSprite.mclick = function (event) {
                if (options.clickCallback instanceof Function) {
                    options.clickCallback(this.data);
                }
            };

            ON_DAED["3D"].register(scene, andromedaObjectR, function () {
            });
        }

        if (options.galaxias instanceof Array) {
            for (var i = 0; i < options.galaxias.length; i++) {
                var g = options.galaxias[i];
                addGalaxia(g.r, g.alpha, g.delta, g.img, g.wiki, g.nome);
            }
        }

        /* Fim de outros objetos de referência */

        o.cenaInformacao.add(refPlanoGalaticoObjeto);

        o.resetCamera = function () {
            camera.position.x = -300;
            camera.position.y = -2000;
            camera.position.z = -1300;

            camera.rotation.x = 2.3582;
            camera.rotation.y = -0.4012;
            camera.rotation.z = 2.7705;
        };


        o.coordenadasSupergalacticas = function (longitude, latitude) {
            while (longitude > Math.PI) {
                longitude -= Math.PI * 2;
            }

            while (longitude < -Math.PI) {
                longitude += Math.PI * 2;
            }

            while (latitude > Math.PI / 2) {
                latitude -= Math.PI * 2;
            }

            while (latitude < -Math.PI / 2) {
                latitude += Math.PI * 2;
            }

            var escalaCoordenadas = 10;

            removeCoords();
            var tamLinha = 1;

            var centroGalatico = MathHelper.lineFromOrigin(objetoSol.position, 0xFF0000, tamLinha);
            centroGalatico.rotation.x = -inclinacaoPlanoGalatico;
            centroGalatico.rotation.z = -137.37 * Math.PI / 180 + Math.PI;
            centroGalatico.scale.multiplyScalar(escalaCoordenadas);

            cadCoords(refObjetoSol, centroGalatico);

            var raioGalactico = (planoGalaticoTamanho / 2) * 0.775;

            var clock = true;

            if (longitude <= 0) {
                clock = false;
            }

            var longitudeCurva = MathHelper.buildCurve(
                    0, 0,
                    raioGalactico, raioGalactico,
                    0, -longitude,
                    clock,
                    120,
                    0x0000FF);

            longitudeCurva.rotation.x = Math.PI / 2;
            longitudeCurva.rotation.y = -137.37 * Math.PI / 180 + Math.PI + Math.PI / 4;

            var longitudeCurvaFinal = new THREE.Object3D();
            longitudeCurvaFinal.add(longitudeCurva);

            longitudeCurvaFinal.rotation.x = -inclinacaoPlanoGalatico;
            longitudeCurvaFinal.rotation.y = -6.32 * Math.PI / 180;

            var verticeMeio = longitudeCurva.geometry.vertices[parseInt(longitudeCurva.geometry.vertices.length / 2)];
            var x = verticeMeio.x;
            var y = verticeMeio.y;
            var aR = new THREE.Object3D();
            aR.position.x = x;
            aR.position.y = y;
            longitudeCurva.add(aR);

            cadText("L", aR);

            longitudeCurvaFinal.scale.multiplyScalar(escalaCoordenadas);

            cadCoords(refObjetoSol, longitudeCurvaFinal);

            clock = true;

            if (latitude <= 0) {
                clock = false;
            }

            var latitudeCurva = MathHelper.buildCurve(
                    0, 0,
                    raioGalactico, raioGalactico,
                    0, -latitude,
                    clock,
                    120,
                    0x00FF00);

            latitudeCurva.rotation.y = -longitude;
            latitudeCurva.rotation.x = Math.PI / 2 - 6.32 * Math.PI / 180;

            var latitudeCurvaFinal = new THREE.Object3D();
            latitudeCurvaFinal.add(latitudeCurva);

            latitudeCurvaFinal.rotation.x = inclinacaoPlanoGalatico / 2;
            latitudeCurvaFinal.rotation.y = -47.37 * Math.PI / 180 + Math.PI * 3 / 4;

            var verticeMeio = latitudeCurva.geometry.vertices[parseInt(latitudeCurva.geometry.vertices.length / 2)];
            var x = verticeMeio.x;
            var y = verticeMeio.y;
            aR = new THREE.Object3D();
            aR.position.x = x;
            aR.position.y = y;
            latitudeCurva.add(aR);

            cadText("B", aR);

            latitudeCurvaFinal.scale.multiplyScalar(escalaCoordenadas);

            cadCoords(refObjetoSol, latitudeCurvaFinal);

            var marcadorCoordenada = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), raioGalactico, 0xFFFF00);

            marcadorCoordenada.rotation.x = -longitude;
            marcadorCoordenada.rotation.z = latitude;

            var marcadorCoordenadaObj = new THREE.Object3D();
            marcadorCoordenadaObj.add(marcadorCoordenada);

            marcadorCoordenadaObj.rotation.x = -inclinacaoPlanoGalatico;
            marcadorCoordenadaObj.rotation.z = -47.37 * Math.PI / 180 + Math.PI * 1 / 4;
            marcadorCoordenadaObj.rotation.y = -6.32 * Math.PI / 180;

            marcadorCoordenadaObj.scale.multiplyScalar(escalaCoordenadas);

            cadCoords(refObjetoSol, marcadorCoordenadaObj);
        };

        o.coordenadasGalacticas = function (longitude, latitude) {

            while (longitude > Math.PI) {
                longitude -= Math.PI * 2;
            }

            while (longitude < -Math.PI) {
                longitude += Math.PI * 2;
            }

            while (latitude > Math.PI / 2) {
                latitude -= Math.PI * 2;
            }

            while (latitude < -Math.PI / 2) {
                latitude += Math.PI * 2;
            }

            var escalaCoordenadas = 10;

            removeCoords();
            var tamLinha = 1;

            var centroGalatico = MathHelper.lineFromOrigin(objetoSol.position, 0xFF0000, tamLinha);
            centroGalatico.rotation.x = -inclinacaoPlanoGalatico;
            centroGalatico.rotation.z = Math.PI;
            centroGalatico.scale.multiplyScalar(escalaCoordenadas);

            cadCoords(refObjetoSol, centroGalatico);

            var raioGalactico = (planoGalaticoTamanho / 2) * 0.775;

            var clock = true;

            if (longitude <= 0) {
                clock = false;
            }

            var latitudeCurva = MathHelper.buildCurve(
                    0, 0,
                    raioGalactico, raioGalactico,
                    0, -longitude,
                    clock,
                    120,
                    0x0000FF);

            latitudeCurva.rotation.x -= inclinacaoPlanoGalatico;
            latitudeCurva.rotation.z = Math.PI * 1.25;

            var latitudeCurvaFinal = new THREE.Object3D();
            latitudeCurvaFinal.add(latitudeCurva);

            var verticeMeio = latitudeCurva.geometry.vertices[parseInt(latitudeCurva.geometry.vertices.length / 2)];
            var x = verticeMeio.x;
            var y = verticeMeio.y;
            var aR = new THREE.Object3D();
            aR.position.x = x;
            aR.position.y = y;
            latitudeCurva.add(aR);

            cadText("l", aR);

            latitudeCurvaFinal.scale.multiplyScalar(escalaCoordenadas);

            cadCoords(refObjetoSol, latitudeCurvaFinal);

            clock = true;

            if (latitude <= 0) {
                clock = false;
            }

            var longitudeCurva = MathHelper.buildCurve(
                    0, 0,
                    raioGalactico, raioGalactico,
                    0, -latitude,
                    clock,
                    120,
                    0x00FF00);

            longitudeCurva.rotation.x = inclinacaoPlanoGalatico / 2;
            longitudeCurva.rotation.y = Math.PI * 1.25 - longitude;

            var longitudeCurvaFinal = new THREE.Object3D();
            longitudeCurvaFinal.add(longitudeCurva);

            var verticeMeio = longitudeCurva.geometry.vertices[parseInt(longitudeCurva.geometry.vertices.length / 2)];
            var x = verticeMeio.x;
            var y = verticeMeio.y;
            aR = new THREE.Object3D();
            aR.position.x = x;
            aR.position.y = y;
            longitudeCurva.add(aR);

            cadText("b", aR);

            longitudeCurvaFinal.scale.multiplyScalar(escalaCoordenadas);

            cadCoords(refObjetoSol, longitudeCurvaFinal);

            var marcadorCoordenada = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), raioGalactico, 0xFFFF00);

            marcadorCoordenada.rotation.x = -latitude;

            var marcadorCoordenadaObj = new THREE.Object3D();
            marcadorCoordenadaObj.add(marcadorCoordenada);

            marcadorCoordenadaObj.rotation.x = -inclinacaoPlanoGalatico;
            marcadorCoordenadaObj.rotation.z = -Math.PI * 1.25 - longitude;

            marcadorCoordenadaObj.scale.multiplyScalar(escalaCoordenadas);

            cadCoords(refObjetoSol, marcadorCoordenadaObj);
        };

    }

    var wPlanoGalacticoGeo = new THREE.PlaneBufferGeometry(10000, 10000, 100, 100);
    var wPlanoGalacticoMat = new THREE.MeshBasicMaterial({
        color: 0x31b0d5,
        side: THREE.DoubleSide,
        wireframe: true,
        visible: false,
        depthWrite: false
    });

    var wPlanoGalacticoMesh = new THREE.Mesh(wPlanoGalacticoGeo, wPlanoGalacticoMat);
    scene.add(wPlanoGalacticoMesh);

    wPlanoGalacticoMesh.rotation.x = Math.PI / 2;

    var wPlanoSupergalacticoGeo = new THREE.PlaneBufferGeometry(10000, 10000, 100, 100);
    var wPlanoSupergalacticoMat = new THREE.MeshBasicMaterial({
        color: 0x5cb85c,
        side: THREE.DoubleSide,
        wireframe: true,
        visible: false,
        depthWrite: false
    });

    var wPlanoSupergalacticoMesh = new THREE.Mesh(wPlanoSupergalacticoGeo, wPlanoSupergalacticoMat);
    var wPlanoSupergalacticoObj = new THREE.Object3D();

    wPlanoSupergalacticoMesh.rotation.x = -6.32 * Math.PI / 180;
    wPlanoSupergalacticoMesh.rotation.y = Math.PI / 4 - 47.37 * Math.PI / 180;

    wPlanoSupergalacticoMesh.position.x = objetoSol.position.x;
    wPlanoSupergalacticoMesh.position.z = objetoSol.position.y;
    wPlanoSupergalacticoObj.add(wPlanoSupergalacticoMesh);
    wPlanoSupergalacticoObj.rotation.y = Math.PI / 2 + rotacaoGalatica;

    scene.add(wPlanoSupergalacticoObj);

    o.addControlePlanos = function (obj) {
        $('#unidade-zoom-btn-group').remove();

        obj.append('<div id="unidade-zoom-btn-group" class="btn-group" role="group">\
            <button id="referencia-add-plano-galactico" type="button" class="btn btn-info">Plano Galáctico</button>\
            <button id="referencia-add-plano-supergalactico" type="button" class="btn btn-info">Plano Supergaláctico</button>\
        </div>');

        $('#referencia-add-plano-galactico').click(function () {
            $(this).toggleClass('active');
            $(this).toggleClass('btn-info');
            $(this).toggleClass('btn-primary');
            if ($(this).hasClass('active')) {
                wPlanoGalacticoMat.visible = true;
            } else {
                wPlanoGalacticoMat.visible = false;
            }
        });

        $('#referencia-add-plano-supergalactico').click(function () {
            $(this).toggleClass('active');
            $(this).toggleClass('btn-info');
            $(this).toggleClass('btn-primary');
            if ($(this).hasClass('active')) {
                wPlanoSupergalacticoMat.visible = true;
            } else {
                wPlanoSupergalacticoMat.visible = false;
            }
        });
    };


    o.resetCamera();

    $('.hover-label-text').show();

    return o;
};