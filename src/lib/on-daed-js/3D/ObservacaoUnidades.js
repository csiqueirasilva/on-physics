ON_DAED["3D"].ObservacaoUnidades = function (scene, camera) {

    var pushed = -5;

    var coords = [];
    var text = [];

    function removeCoords() {
        while (text.length > 0) {
            ThreeHelper.removeLabelText(text[0].uuid);
            text.splice(0, 1);
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
        text.push(parent);
        ThreeHelper.createLabel(t, parent, camera);
    }

    var material = new THREE.LineBasicMaterial({
        color: 0xFFFFFF
    });

    function criarLinha(tamanho, nome, push) {
        removeCoords();

        var geo = new THREE.Geometry();
        geo.vertices.push(new THREE.Vector3(0, 0, 0));
        geo.vertices.push(new THREE.Vector3(tamanho, 0, 0));

        var mesh = new THREE.Line(geo, material);

        var o = new THREE.Object3D();
        o.add(mesh);

        var text = new THREE.Object3D();
        text.position.x = -5;
        text.position.y = pushed;
        scene.add(text);

        o.position.y = pushed;

        if (push) {
            cadText(nome, text);
            cadCoords(mainObject, o);
        } else {
            pushed += 2;
            ThreeHelper.createLabel(nome, text, camera);
        }

        $('.hover-label-text').show();

        return o;
    }

    var mainObject = new THREE.Object3D();

    camera.position.z = 25;

    var parsecRef = 30856775800000;
    var UARef = 149597871;
    var kmRef = 1;
    var segArcoRef = 725.27094;

    var o = criarLinha(parsecRef, "1 Parsec");
    mainObject.add(o);

    o = criarLinha(UARef, "1 Unidade Astronômica");
    mainObject.add(o);

    o = criarLinha(kmRef, "1 Quilômetro");
    mainObject.add(o);

//    o = criarLinha(segArcoRef, "1 Segundo de Arco");
//    mainObject.add(o);

    scene.add(mainObject);

    return {
        getKMRef: function () {
            return kmRef;
        },
        getUARef: function () {
            return UARef;
        },
        getSegArcoRef: function () {
            return segArcoRef;
        },
        getParsecRef: function () {
            return parsecRef;
        },
        mudarEscala: function (x) {
            mainObject.scale.x = x;
        },
        adicionarLinha: function (tamanho, nome) {
            criarLinha(tamanho, nome, true);
        },
        addZoom: function (obj) {
            $('#unidade-zoom-btn-group').remove();

            obj.append('<div id="unidade-zoom-btn-group" class="btn-group" role="group">\
                <button id="unidade-add-zoom" type="button" class="btn btn-default"><span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span></button>\
                <button id="unidade-remove-zoom" type="button" class="btn btn-default"><span class="glyphicon glyphicon-zoom-out" aria-hidden="true"></span></button>\
            </div>');

            var zoomFact = 2;

            $('#unidade-add-zoom').click(function () {
                mainObject.scale.x *= zoomFact;
            });

            $('#unidade-remove-zoom').click(function () {
                mainObject.scale.x *= (1 / zoomFact);
            });
        }
    };

};