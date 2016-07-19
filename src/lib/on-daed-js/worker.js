importScripts('geral.js');
importScripts('vsop87.min.js');
importScripts('astro.js');
importScripts('geo.js');

self._object = {};

self._object.acc = 0;
self._object.calculando = false;
self._object.interval = null;

self.addEventListener('message', function (e) {
    var data = e.data;

    (function () {
        var nx = 151;
        var ny = 121;

        var xmin = -80;
        var xmax = -30;

        var ymin = -36;
        var ymax = 6;

        var TIPO_MAPA = {
            INCLINACAO: 1,
            DECLINACAO: 2,
            INTENSIDADE: 3
        };

        function pointBetween(p1, p2, requiredLevel) {
            var px = {};
            px.x = p2.x - p1.x;
            px.y = p2.y - p1.y;
            px.z = p2.z - p1.z;

            var t = (requiredLevel - p1.z) / px.z;

            return {
                x: p1.x + px.x * t,
                y: p1.y + px.y * t,
                z: requiredLevel
            };
        }

        function conrec(x, y, z, zlevel) {

            var ret = [];

            /* x.length === y.length */
            for (var i = 0; i < x.length - 1; i++) {

                var mid = {};

                var pX = [x[i], x[i + 1], x[i], x[i + 1]];
                var pY = [y[i], y[i], y[i + 1], y[i + 1]];
                var pZ = [z[x[i]][y[i]], z[x[i + 1]][y[i]], z[x[i]][y[i + 1]], z[x[i + 1]][y[i + 1]]];

                mid.x = (pX[0] + pX[1] + pX[2] + pX[3]) / 4;
                mid.y = (pY[0] + pY[1] + pY[2] + pY[3]) / 4;
                mid.z = (pZ[0] + pZ[1] + pZ[2] + pZ[3]) / 4;

                for (var j = 0; j < 4; j++) {
                    for (var k = j + 1; k < 4; k++) {

                        var m1 = {};
                        var m2 = {};

                        m1.x = pX[j];
                        m1.y = pY[j];
                        m1.z = pZ[j];

                        m2.x = pX[k];
                        m2.y = pY[k];
                        m2.z = pZ[k];

                        var zchoice = [mid, m1, m2];

                        var above = [];
                        var below = [];
                        var onlevel = [];

                        for (var l = 0; l < zchoice.length; l++) {
                            if (zchoice[l].z < zlevel) {
                                below.push(zchoice[l]);
                            } else if (zchoice[l].z > zlevel) {
                                above.push(zchoice[l]);
                            } else {
                                onlevel.push(zchoice[l]);
                            }
                        }

                        // case c & f
                        if (onlevel.length === 0 && (below.length === 1 || above.length === 1)) {

                            var e1, e2;

                            if (below.length === 1) {
                                e1 = pointBetween(below[0], above[0], zlevel);
                                e2 = pointBetween(below[0], above[1], zlevel);
                            } else {
                                e1 = pointBetween(above[0], below[0], zlevel);
                                e2 = pointBetween(above[0], below[1], zlevel);
                            }

                            ret.push(e1, e2);

                        } /* case e */ else if (below.length === 1 && above.length === 1) {

                            var intersect = pointBetween(below[0], above[0], zlevel);
                            ret.push(onlevel[0], intersect);

                        } /* case d & h */ else if (onlevel.length === 2) {

                            ret.push(onlevel[0], onlevel[1]);

                        }

                    }

                }
            }

            return ret;
        }

        function populaPontosIGRF(ano, alt, ico) {
            var variacao = [];
            var valores = [];
            var longitudes = [];
            var latitudes = [];

            var grau = 180 / Math.PI;

            var maxVariacao = -Infinity;
            var minVariacao = Infinity;

            var maxValor = -Infinity;
            var minValor = Infinity;

            var DX = (xmax - xmin) / nx;
            var DY = (ymax - ymin) / ny;
            
            for (var ilon = 1; ilon < nx; ilon++) {
                var longitude = xmin + (ilon - 1) * DX;
                var elongitude = (longitude + 360.0) % 360;
                
                valores[longitude] = [];
                variacao[longitude] = [];
                
                for (var ilat = 1; ilat < ny; ilat++) {
                    var latitude = ymax - (ilat - 1) * DY;
                    var colatitude = (90 - latitude) % 180;

                    var valoresCampo = ON_DAED.GEO.IGRF(ON_DAED['GEO'].IGRF_ISV.MAIN_FIELD_VALUES,
                            ano,
                            ON_DAED['GEO'].IGRF_MODE.GEODETIC,
                            alt,
                            colatitude,
                            elongitude);

                    var variacaoSecular = ON_DAED.GEO.IGRF(ON_DAED['GEO'].IGRF_ISV.SECULAR_VARIATION,
                            ano,
                            ON_DAED['GEO'].IGRF_MODE.GEODETIC,
                            alt,
                            colatitude,
                            elongitude);

                    var D = grau * Math.atan2(valoresCampo.y, valoresCampo.x);
                    var H = Math.sqrt(valoresCampo.x * valoresCampo.x + valoresCampo.y * valoresCampo.y);
                    var S = grau * Math.atan2(valoresCampo.z, H);

                    var DD = (60 * grau * (valoresCampo.x * variacaoSecular.y - valoresCampo.y * variacaoSecular.x)) / (H * H);
                    var DH = (valoresCampo.x * variacaoSecular.x + valoresCampo.y * variacaoSecular.y) / H;
                    var DS = (60 * grau * (H * variacaoSecular.z - valoresCampo.z * DH)) / (valoresCampo.f * valoresCampo.f);
                    var DF = (H * DH + valoresCampo.z * variacaoSecular.z) / valoresCampo.f;

                    longitudes.push(longitude);
                    latitudes.push(latitude);

                    var valor, vSecular;

                    if (ico === TIPO_MAPA.INCLINACAO) {
                        valor = D;
                        vSecular = DD;
                    } else if (ico === TIPO_MAPA.DECLINACAO) {
                        valor = S;
                        vSecular = DS;
                    } else if (ico === TIPO_MAPA.INTENSIDADE) {
                        valor = valoresCampo.f;
                        vSecular = DF;
                    }

                    variacao[longitude][latitude] = vSecular;
                    valores[longitude][latitude] = valor;

                    if (valor > maxValor) {
                        maxValor = valor;
                    } else if (valor < minValor) {
                        minValor = valor;
                    }

                    if (vSecular > maxVariacao) {
                        maxVariacao = vSecular;
                    } else if (vSecular < minVariacao) {
                        minVariacao = vSecular;
                    }
                }
            }

            return {
                variacao: variacao,
                valores: valores,
                latitudes: latitudes,
                longitudes: longitudes,
                minVariacao: minVariacao,
                maxVariacao: maxVariacao,
                minValores: minValor,
                maxValores: maxValor
            };
        }

        self.curvasDeNivelIGRFv12 = function (extData) {
            var data = populaPontosIGRF(extData.ano, extData.alt, extData.tipoPlot);

            var maxValor = parseInt(data.maxValores) - 1;
            var minValor = parseInt(data.minValores) + 1;
            var maxVariacao = parseInt(data.maxVariacao) - 1;
            var minVariacao = parseInt(data.minVariacao) + 1;

            var curvasValor = [];
            var curvasVariacao = [];

            for (var i = minValor; i < maxValor; i++) {
                var v = conrec(data.longitudes, data.latitudes, data.valores, i);
                curvasValor.push(v);
            }

            for (var i = minVariacao; i < maxVariacao; i++) {
                var v = conrec(data.longitudes, data.latitudes, data.variacao, i);
                curvasVariacao.push(v);
            }


            self.postMessage({
                cmd: 'igrfData',
                data: {
                    variacao: curvasVariacao,
                    valores: curvasValor
                }
            });

        };

    }());


    var TIPO_PLOT_IGRF = {
        S_DECLINACAO: 1,
        S_INCLINACAO: 2,
        S_INTENSIDADE: 3,
        V_DECLINACAO: 4,
        V_INCLINACAO: 5,
        V_INTENSIDADE: 6
    };

    function igrf12(data) {

        var valores = [];

        var max = -Infinity;
        var min = Infinity;

        var grau = 180 / Math.PI;

        var startLatitude = data.startLatitude;
        var endLatitude = data.endLatitude;
        var startLongitude = data.startLongitude;
        var endLongitude = data.endLongitude;

        var tamanhoLatitude = endLatitude - startLatitude;
        var tamanhoLongitude = endLongitude - startLongitude;

        for (var i = 0; i < data.height; i++) {

            for (var j = 0; j < data.width; j++) {
                var lat = startLatitude + (i / data.height) * (tamanhoLatitude);
                var lon = startLongitude + (j / data.width) * (tamanhoLongitude);

                var valoresCampo = ON_DAED.GEO.IGRF(ON_DAED['GEO'].IGRF_ISV.MAIN_FIELD_VALUES,
                        data.ano,
                        ON_DAED['GEO'].IGRF_MODE.GEODETIC,
                        data.alt,
                        lat,
                        lon);

                var variacaoSecular = ON_DAED.GEO.IGRF(ON_DAED['GEO'].IGRF_ISV.SECULAR_VARIATION,
                        data.ano,
                        ON_DAED['GEO'].IGRF_MODE.GEODETIC,
                        data.alt,
                        lat,
                        lon);

                var ret = null;

                var H = Math.sqrt(valoresCampo.x * valoresCampo.x + valoresCampo.y * valoresCampo.y);
                var DH = (valoresCampo.x * variacaoSecular.x + valoresCampo.y * variacaoSecular.y) / H;

                if (TIPO_PLOT_IGRF.S_INCLINACAO === data.tipoPlot) {
                    ret = (60 * grau * (valoresCampo.x * variacaoSecular.y - valoresCampo.y * variacaoSecular.x)) / (H * H);
                } else if (TIPO_PLOT_IGRF.S_DECLINACAO === data.tipoPlot) {
                    ret = (60 * grau * (H * variacaoSecular.z - valoresCampo.z * DH)) / (valoresCampo.f * valoresCampo.f);
                } else if (TIPO_PLOT_IGRF.S_INTENSIDADE === data.tipoPlot) {
                    ret = (H * DH + valoresCampo.z * variacaoSecular.z) / valoresCampo.f;
                } else if (TIPO_PLOT_IGRF.V_DECLINACAO === data.tipoPlot) {
                    ret = grau * Math.atan2(valoresCampo.z, H);
                } else if (TIPO_PLOT_IGRF.V_INCLINACAO === data.tipoPlot) {
                    ret = grau * Math.atan2(valoresCampo.y, valoresCampo.x);
                } else if (TIPO_PLOT_IGRF.V_INTENSIDADE === data.tipoPlot) {
                    ret = valoresCampo.f;
                }

                if (data.tipoPlot !== TIPO_PLOT_IGRF.V_INTENSIDADE && data.tipoPlot !== TIPO_PLOT_IGRF.S_INTENSIDADE) {
                    ret %= 360;
                    if (ret < 0)
                        ret += 360;
                }

                if (ret > max) {
                    max = ret;
                }

                if (ret < min) {
                    min = ret;
                }

                valores.push(ret);
            }
        }

        self.postMessage({cmd: 'igrfData', data: {v: valores, max: max, alt: data.alt, tipoPlot: data.tipoPlot, ano: data.ano, min: min}});
    }

    function cancelarCalculo() {
        if (self._object.interval !== null && self._object.calculando) {
            self._object.calculando = false;
            self.clearInterval(self._object.interval);
            self._object.interval = null;
        }
    }

    function getAcc() {
        self.postMessage({cmd: 'getAcc', acc: self._object.acc, calculando: self._object.calculando});
    }

    var SEARCH_TYPE = {LUNAR: 1, SOLAR: 2};

    function eclipseSolar(julian) {
        setupSolLuaAnguloDiferenca(julian, SEARCH_TYPE.SOLAR, function (julianIt) {
            var solarEclipse = ON_DAED.ASTRO.getSolarEclipse(julianIt);
            return !solarEclipse.noEclipse && !isNaN(solarEclipse.maximumTime) && solarEclipse.maximumTime > julian;
        });
    }

    function eclipseLunar(julian) {
        setupSolLuaAnguloDiferenca(julian, SEARCH_TYPE.LUNAR, function (julianIt) {
            var lunarEclipse = ON_DAED.ASTRO.getLunarEclipse(julianIt);
            return !lunarEclipse.noEclipse && !isNaN(lunarEclipse.maximumTime) && lunarEclipse.maximumTime > julian;
        });
    }

    function setupSolLuaAnguloDiferenca(julian, type, cb) {
        var setupJulian = julian;

        var intervaloPassado = 14;

        var testeEclipsePossivel = type === SEARCH_TYPE.SOLAR ? ON_DAED.ASTRO.getSolarEclipse(setupJulian - intervaloPassado) : ON_DAED.ASTRO.getLunarEclipse(setupJulian - intervaloPassado);

        if (testeEclipsePossivel.noEclipse || testeEclipsePossivel.maximumTime !== setupJulian) {
            setupJulian -= intervaloPassado;
        } else {
            setupJulian += intervaloPassado;
        }

        getSolLuaAnguloDiferenca(setupJulian, cb);
    }

    function getSolLuaAnguloDiferenca(julian, fnInterval, extMinuteInterval) {
        if (!self._object.calculando) {
            self._object.calculando = true;

            var minInterval = extMinuteInterval || (60 * 24 * 28);

            var stepSearch = 0.000694 * minInterval; // 1 min * x min

            var start = julian;
            self._object.acc = start;

            var found = false;

            self._object.interval = self.setInterval(function () {
                if (self._object.calculando) {

                    found = fnInterval(self._object.acc);

                    if (found) {
                        self.clearInterval(self._object.interval);
                        self._object.calculando = false;
                        self._object.interval = null;
                    } else {
                        self._object.acc += stepSearch;
                    }

                }
            }, 100);
        }
    }

    function observacaoEquatorial(date) {
        var position = ON_DAED.ASTRO.getSolarSystemEquatorialCoordinates(date);
        position.cmd = 'observacaoEquatorial';
        position.julian = date;

        self.postMessage(position);
    }

    function transitoSolar(julian, localLongitude, localLatitude) {
        var transit = ON_DAED["ASTRO"].getTransit(-localLongitude, localLatitude, julian, ON_DAED.ASTRO.SolarSystemBody.SUN);
        transit.cmd = 'transitoSolar';
        self.postMessage(transit);
    }

    function fasesDaLua(julian) {
        var phases = ON_DAED["ASTRO"].getNextMoonPhasesFromJulian(julian);

        var fases = {
            nova: phases.new,
            crescente: phases.firstQuarter,
            cheia: phases.full,
            minguante: phases.lastQuarter
        };

        fases.cmd = 'fasesDaLua';

        self.postMessage(fases);
    }

    function faseAtualDaLua(julian) {
        var faseAtualLua = {};

        var atual = ON_DAED.ASTRO.getIlluminatedFractionOfMoonDiskFromJulian(julian);

        faseAtualLua.fase = parseInt(atual * 100) + '% do disco lunar iluminado';
        faseAtualLua.cmd = 'faseAtualLua';

        self.postMessage(faseAtualLua);
    }

    function checkIGRF() {
        var i = setInterval(function () {
            if (ON_DAED.GEO.IGRF !== undefined) {
                clearInterval(i);
                self.postMessage({
                    cmd: 'igrfReady'
                });
            }
        }, 200);
    }

    switch (data.cmd) {
        case 'observacaoEquatorial':
            observacaoEquatorial(data.data);
            break;
        case 'transitoSolar':
            transitoSolar(data.data, data.longitude, data.latitude);
            break;
        case 'fasesDaLua':
            fasesDaLua(data.data);
            break;
        case 'faseAtualLua':
            faseAtualDaLua(data.data);
            break;
        case 'getAcc':
            getAcc();
            break;
        case 'eclipseSolar':
            eclipseSolar(data.data);
            break;
        case 'eclipseLunar':
            eclipseLunar(data.data);
            break;
        case 'cancelarCalculo':
            cancelarCalculo();
            break;
        case 'updateIGRF':
            curvasDeNivelIGRFv12(data.data);
            break;
        case 'loadIGRF':
            checkIGRF();
            break;
    }

});