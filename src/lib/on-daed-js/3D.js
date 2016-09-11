(function () {

    // Copiado do Detector do Mr Doob - THREE JS
    ON_DAED["WEBGL_SUPPORT"] = (function () {
        try {
            return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
        } catch (e) {
            return false;
        }
    })();

    ON_DAED["3D"] = {};

    ON_DAED["3D"].objects = [];
    ON_DAED["3D"].intersectObjects = [];

    ON_DAED["3D"].workerLogica = new Worker('lib/on-daed-js/worker.js');

    // private
    var texturesTextLabel = {};

    var TEXT_LABEL = {
        PONTO_VERNAL: "ɤ",
        ECLIPTICA: "ε",
        ASCENSAO_RETA: "α",
        DECLINACAO: "δ",
        LATITUDE_ECLIPTICA: "β",
        LONGITUDE_ECLIPTICA: "λ",
        LATITUDE_GALACTICA: "b",
        LONGITUDE_GALACTICA: "l",
        LATITUDE_SUPERGALACTICA: "B",
        LONGITUDE_SUPERGALACTICA: "L",
        ALTURA: "h",
        AZIMUTE: "A",
        NORTE: "N",
        SUL: "S",
        OESTE: "O",
        LESTE: "L",
        ZENITE: "z",
        PONTO_LIBRA: "Ω"
    };

    ON_DAED["3D"].TEXT_LABEL = TEXT_LABEL;

    ON_DAED["3D"].createTextLabel = function (cod, parent) {
        if (!texturesTextLabel[cod]) {
            texturesTextLabel[cod] = criarTexturaLetraComBorda(cod);
        }

        var texture = texturesTextLabel[cod];

        var mat = new THREE.SpriteMaterial({
            map: texture
        });

        var obj = new THREE.Sprite(mat);

        obj.scale.multiplyScalar(40);

        if (parent) {
            parent.add(obj);
        }

        return obj;
    };

    ON_DAED["3D"].addQtipHelp = function (scene, object, showCallback, clickCallback) {
        object.mover = function (event) {
            if ($('.qtip:visible').length === 0) {
                showCallback(object);
            }
        };

        object.mout = function (event) {
            $('.qtip').qtip('hide');
        };

        if (clickCallback instanceof Function) {
            object.mclick = function (event) {

                clickCallback(object);
            };
        }

        ON_DAED["3D"].register(scene, object, function () {
        });
    };

    var flareObject = null;

    ON_DAED["3D"].ativarFlaresSol = function (cb) {
        if ($('#load-modal').data('loadOBJMTL') instanceof Function) {

            var flareMat = new THREE.MeshBasicMaterial();

            flareMat.side = THREE.DoubleSide;
            flareMat.transparent = true;
            flareMat.map = new THREE.ImageUtils.loadTexture("lib/on-daed-js/models/sol/uv-test2.png");
            flareMat.depthWrite = false;
            flareMat.color = new THREE.Color(0xFF0000);

            $('#load-modal').data('loadOBJMTL')('sol', 'lib/on-daed-js/models/sol/solarflare.obj', 'lib/on-daed-js/models/sol/solarflare.mtl', function (object) {

                object.scale.multiplyScalar(50);

                var wrap = new THREE.Object3D();

                object.traverse(function (o) {
                    if (o.material instanceof THREE.MeshPhongMaterial || o.material instanceof THREE.MeshLambertMaterial) {
                        o.material = flareMat;
                    }
                });

                wrap.add(object);

                flareObject = wrap;

                if (cb instanceof Function) {
                    cb();
                }
            });
        }
    };

    ON_DAED["3D"].criarSol = function (scene) {

        var tamanho = 90;

        var sol = new THREE.Mesh(
                new THREE.SphereGeometry(tamanho, 64, 32),
                new THREE.MeshBasicMaterial({
                    color: 0xFFFF00,
                    map: THREE.ImageUtils.loadTexture('imgs/texturas/sol/sol.png')
                })
                );

        var objetoSol = new THREE.Object3D();
        objetoSol.add(sol);

        var brilho = new THREE.Sprite(
                new THREE.SpriteMaterial({
                    map: THREE.ImageUtils.loadTexture('imgs/texturas/sol/glow.png'),
                    depthBuffer: false
                }));

        var mod = 4.5;
        var escalaBase = tamanho / mod;

        objetoSol.add(brilho);

        var factSolAnimacao = 0;

        var flares = [];

        function addFlare() {
            var flare = flareObject.clone();

            var scale = 1 - parseInt(Math.random() * 4) / 10;

            flare.children[0].children[0].children[1].position.z = -1;

            flare.children[0].children[0].children[1].scale.multiplyScalar(scale);

            flare.children[0].children[0].rotation.y = Math.random() * Math.PI * 2;
            flare.children[0].children[0].rotation.z = Math.random() * Math.PI * 2;
            flare.children[0].children[0].rotation.x = Math.random() * Math.PI * 2;

            flare.children[0].children[0].children[1].rotation.y = -Math.PI;

            objetoSol.add(flare);

            flare.speed = (Math.PI - Math.random() * Math.PI / 5) / 100;

            return flare;
        }
        ;

        ON_DAED["3D"].register(scene, objetoSol, function () {
            var anim = ++factSolAnimacao / mod;
            brilho.scale.x = (escalaBase + Math.cos(anim)) * escalaBase;
            brilho.scale.y = (escalaBase + Math.sin(anim)) * escalaBase;

            for (var i = flares.length - 1; i >= 0; i--) {
                flares[i].children[0].children[0].children[1].rotation.y += flares[i].speed;

                if (flares[i].children[0].children[0].children[1].rotation.y >= Math.PI) {
                    var removed = flares[i];
                    objetoSol.remove(removed);
                    flares.splice(i, 1);
                    flares.push(addFlare());
                }
            }

            if (flares.length === 0 && flareObject) {
                for (var i = 0; i < 10; i++) {
                    flares.push(addFlare());
                }
            }

        }, true);

        return objetoSol;
    };

    function circuloContext2D(ctx, x, y, radius, iniAngulo, fimAngulo) {
        ctx.beginPath();
        ctx.arc(x, y, radius, iniAngulo, fimAngulo, true);
        ctx.fill();
        ctx.stroke();
    }

    // stemkoski
    function roundRect(ctx, x, y, w, h, r)
    {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    function criarTexturaLetraComBorda(message, parameters) {
        if (parameters === undefined)
            parameters = {};

        var fontSize = 400;
        var canvasSize = 512;

        var fontface = parameters.hasOwnProperty("fontface") ?
                parameters["fontface"] : "Arial";

        var fontsize = parameters.hasOwnProperty("fontsize") ?
                parameters["fontsize"] : fontSize;

        var borderThickness = parameters.hasOwnProperty("borderThickness") ?
                parameters["borderThickness"] : 8;

        var borderColor = parameters.hasOwnProperty("borderColor") ?
                parameters["borderColor"] : {r: 0, g: 0, b: 0, a: 1.0};

        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
                parameters["backgroundColor"] : {r: 255, g: 255, b: 255, a: 1.0};

        var canvas = document.createElement('canvas');
        canvas.height = canvas.width = canvasSize;

        var context = canvas.getContext('2d');
        context.font = "" + fontsize + "px " + fontface;

        // text color
        context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                + backgroundColor.b + "," + backgroundColor.a + ")";

        // get size data (height depends only on font size)
        var metrics = context.measureText(message);
        var textWidth = metrics.width;

        var textX = canvasSize / 2 - textWidth / 2;
        var textY = (canvasSize - fontsize) / 2 + fontsize / 1.4 + borderThickness;

        context.fillText(message, textX, textY);

        context.lineWidth = borderThickness;

        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                + borderColor.b + "," + borderColor.a + ")";

        context.strokeText(message, textX, textY);

        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        return texture;
    }

    // stemkoski
    function makeTextSprite(message, parameters)
    {
        if (parameters === undefined)
            parameters = {};

        var fontface = parameters.hasOwnProperty("fontface") ?
                parameters["fontface"] : "Arial";

        var fontsize = parameters.hasOwnProperty("fontsize") ?
                parameters["fontsize"] : 18;

        var borderThickness = parameters.hasOwnProperty("borderThickness") ?
                parameters["borderThickness"] : 4;

        var borderColor = parameters.hasOwnProperty("borderColor") ?
                parameters["borderColor"] : {r: 0, g: 0, b: 0, a: 1.0};

        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
                parameters["backgroundColor"] : {r: 255, g: 255, b: 255, a: 1.0};

        var depthTest = parameters.hasOwnProperty("depthTest") ?
                parameters["depthTest"] : false;


        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;

        // get size data (height depends only on font size)
        var metrics = context.measureText(message);
        var textWidth = metrics.width;

        // background color
        context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                + backgroundColor.b + "," + backgroundColor.a + ")";
        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 0);
        // 1.4 is extra height factor for text below baseline: g,j,p,q.

        // text color
        context.fillStyle = "rgba(0, 0, 0, 1.0)";

        context.fillText(message, borderThickness, fontsize + borderThickness);

        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial(
                {map: texture, depthTest: depthTest});
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(100, 50, 1.0);
        return sprite;
    }

    // public

    ON_DAED["3D"].setMouseOverPossible = function (parent, renderer, camera) {
        var obj = $(parent);
        var mouse = new THREE.Vector2();
        var intersected;

        var element = renderer.domElement;

        // MOUSE
        function onDocumentMouseMove(event) {
            var x = event.clientX - parseInt($(element).offset().left);
            var y = event.clientY - parseInt($(element).offset().top);

            mouse.x = (x / element.offsetWidth) * 2 - 1;
            mouse.y = -(y / element.offsetHeight) * 2 + 1;

            var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
            vector.unproject(camera);
            var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
            var intersections = raycaster.intersectObjects(ON_DAED["3D"].intersectObjects, true);

            if (intersections.length > 0) {
                if (intersected !== intersections[ 0 ].object) {
                    if (intersected) {
                        if (intersected.mout instanceof Function) {
                            intersected.mout(event, intersected);
                        }
                    }

                    $('body').css('cursor', 'auto');
                }

                intersected = intersections[ 0 ].object;

                $('body').css('cursor', 'pointer');

                if (intersected.mover instanceof Function) {
                    intersected.mover(event, intersected);
                }
            } else if (intersected) {
                if (intersected.mout instanceof Function) {
                    intersected.mout(event, intersected);
                }
                $('body').css('cursor', 'auto');
                intersected = null;
            } else {
                $('body').css('cursor', 'auto');
            }
        }

        obj.bind('mousemove', onDocumentMouseMove);

        function onMouseOut(event) {
            if (('.qtip:visible').length > 0) {
                $('.qtip').qtip('hide');
            }

            $('body').css('cursor', 'auto');
        }

        obj.bind('mouseout', onMouseOut);

        function onClick(event) {
            if (intersected && intersected.mclick instanceof Function) {
                intersected.mclick(event, intersected);
            }
        }

        obj.bind('click', onClick);
    }
    ;

    ON_DAED["3D"].register = function (scene, obj, updateFunction, ignoreMouse) {
        scene.add(obj);
        obj.update = updateFunction;

        if (!ignoreMouse) {
            ON_DAED["3D"].intersectObjects.push(obj);
        }

        ON_DAED["3D"].objects.push(obj);
    };

    ON_DAED["3D"].unregister = function (scene, obj) {
        var idx = ON_DAED["3D"].objects.indexOf(obj);
        if (idx !== -1) {
            ON_DAED["3D"].objects.splice(idx, 1);
            scene.remove(obj);
        }
    };

    ON_DAED["3D"].update = function () {
        var list = ON_DAED["3D"].objects;
        for (var i = 0; i < list.length; i++) {
            if (list[i].update instanceof Function) {
                list[i].update();
            }
        }
    };

    ON_DAED['3D'].START_RENDER = null;

    ON_DAED["3D"].create = function (buildScene, render, element, controls, color) {
        if (!ON_DAED["WEBGL_SUPPORT"]) {
            console.log("Sem suporte a WEBGL");
            return null;
        }

        var renderer;
        var scene;
        var camera;
        var clock = new THREE.Clock();
        var cameraControl;
        var stats = new Stats();

        function rendering() {
            requestAnimationFrame(rendering);
            render(cameraControl, renderer, scene, camera, stats, clock);
        }

        scene = new THREE.Scene();
        var w = element !== window ? element.offsetWidth : window.innerWidth,
                h = element !== window ? element.offsetHeight : window.innerHeight;

        // camera
        camera = new THREE.PerspectiveCamera(45, w / h, 0.000000001, 10000000000);

        // renderer
        renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, logarithmicDepthBuffer: true});
        renderer.domElement.id = 'main-canvas';
        renderer.setClearColor(0x000000, 1);
        renderer.setSize(w, h);

        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        renderer.shadowMapEnabled = true;
        renderer.shadowSoftMap = true;
        renderer.shadowMapType = THREE.PCFSoftShadowMap;

        scene.add(camera);

        (function () {
            var width = window.innerWidth;
            var height = window.innerHeight;

            setInterval(function () {
                if ((width !== window.innerWidth) || (height !== window.innerHeight)) {
                    width = window.innerWidth;
                    height = window.innerHeight;

                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();

                    renderer.setSize(width, height);
                }
            }, 300);
        })();

        // controls, return camera control if any
        if (controls instanceof Function) {
            cameraControl = controls(camera, renderer, scene, stats);
        }

        element.style['overflow'] = 'hidden';
        element.appendChild(renderer.domElement);

        // Build scene
        buildScene(scene, camera);

        if (color !== undefined) {
            renderer.setClearColor(color);
        }

        ON_DAED['3D'].START_RENDER = function() {
            
            var width = window.innerWidth;
            var height = window.innerHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);
            
            rendering();
            
        };

        return {
            scene: scene
        };
    };

    ON_DAED["3D"].createManager = function (component) {
        var manager = new THREE.LoadingManager();

        manager.onProgress = function (item, loaded, total) {
            console.log(item, loaded, total);
        };

        manager.onLoad = function () {
            console.log("Finished loading: " + component);
        };

        manager.onError = function () {
            console.log("Error loading: " + component);
        };

        return manager;
    };

})();