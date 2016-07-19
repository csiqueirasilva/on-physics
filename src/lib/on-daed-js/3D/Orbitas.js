ON_DAED['3D'].Orbitas = function (scene, url) {

    var wrapper = new THREE.Object3D();

    var fatorEscala = 5;

    var tamanhoBaseGalaxia = 40 * fatorEscala;
    var raioDistanciaSol = 8 * fatorEscala;

    var umMilhaoDeAnosJD = 366963559.5;
    var correcaoData = 1; // ?? KPC ?

    var esferaReferencia = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 8), new THREE.MeshBasicMaterial({
        color: 0x0000FF
    }));

    wrapper.add(esferaReferencia);

    var lastLine = null;
    var lastData = null;
    
    var sol = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 16, 8),
            new THREE.MeshBasicMaterial({
                color: 0xFFFF00
            })
        );

    wrapper.add(sol);

    var galaxia = new THREE.Mesh(new THREE.PlaneGeometry(tamanhoBaseGalaxia, tamanhoBaseGalaxia, 2, 2), new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture("imgs/texturas/galaxias/vialactea.jpg"), 
        side: THREE.DoubleSide,
        depthTest: false
    }));

    galaxia.renderOrder = -1;

    wrapper.add(galaxia);

    scene.add(wrapper);

    var o = {};

    o.loadData = function (url) {

        document.body.style.cursor = 'wait';

        $('#select-orbitas').attr("disabled", true);

        $.getJSON("lib/on-daed-js/orbitas/" + url, {}, function (dataSelecionada) {

            $.getJSON(dataSelecionada[1],
                    function (data) {
                        
                        for(var pageId in data.query.pages) {
                            
                            var page = data.query.pages[pageId];
                            var parentTitle = $('#informacao-texto-modal .modal-title')[0];
                            
                            $('#wiki-orbita-titulo').html(page.title);
                            $('#wiki-orbita-conteudo').html(page.extract);
                            
                            parentTitle.innerHTML = page.title;
                            
                        }
                        
                    });

            delete lastData;

            lastData = dataSelecionada;

            var sliderDataJuliana = $('#data-juliana-slider').data('bootstrapSlider');

            sliderDataJuliana.setAttribute("max", dataSelecionada.length - 4);
            sliderDataJuliana.setAttribute("min", 2);
            sliderDataJuliana.setAttribute("value", 2);
            sliderDataJuliana.refresh();

            $('#data-juliana-slider').trigger('slide');

            if (lastLine !== null) {
                lastLine.parent.remove(lastLine);
                ThreeHelper.dispose(lastLine);
            }

            var geo = new THREE.Geometry();
            var mat;

            mat = new THREE.LineDashedMaterial({linewidth: 1, color: 0xFF0000, dashSize: 0.2, gapSize: 0.2, depthTest: false});

            for (var i = 2; i < dataSelecionada.length; i = i + 4) {
                geo.vertices.push(new THREE.Vector3((dataSelecionada[i + 1] * fatorEscala) * correcaoData, (dataSelecionada[i + 2] * fatorEscala) * correcaoData, (dataSelecionada[i + 3] * fatorEscala) * correcaoData));
            }

            geo.computeLineDistances();

            lastLine = new THREE.Line(geo, mat, THREE.LineStrip);
            wrapper.add(lastLine);

            $('#select-orbitas').attr("disabled", false);

            window.history.pushState({}, "", "orbitas-" + url.replace(".json", "").replace(/ /g, "-").replace(/[^a-zA-Z0-9-]/g, "").toLowerCase());
            
            document.body.style.cursor = 'auto';
            
        });
    };

    o.setGalaxia = function (bool) {
        galaxia.visible = bool;
    };

    o.setRaioGalaxia = function (raio) {
        galaxia.scale.x = galaxia.scale.y = galaxia.scale.z = raio / (tamanhoBaseGalaxia / (2 * fatorEscala));
    };

    o.update = function (value) {
        
        var periodoSol = 250000000 * 365.25;
        var argumentoSol = (value / periodoSol) * Math.PI * 2;
        
        sol.position.set(raioDistanciaSol * Math.cos(argumentoSol), raioDistanciaSol * Math.sin(argumentoSol), 0);
        
        esferaReferencia.position.set((lastData[value + 1] * fatorEscala) * correcaoData, (lastData[value + 2] * fatorEscala) * correcaoData, (lastData[value + 3] * fatorEscala) * correcaoData);
        
        $('#distancia-centro-galaxia').html(Math.round((esferaReferencia.position.length() / fatorEscala) * 1000) / 1000);
        
        return Math.round(lastData[value] * umMilhaoDeAnosJD * 1000) / 1000;
        
    };

    o.loadData(url);

    return o;

};