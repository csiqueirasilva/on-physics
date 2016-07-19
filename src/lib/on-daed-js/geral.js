var ON_DAED = (function () {
    var o = {};

    var precisao = 1E8;

    o.diaDoAno = function (dt) {
        var j1 = new Date(dt);
        j1.setMonth(0, 0);
        return Math.round((dt - j1) / 8.64e7);
    };

    o.dataJuliana = function () {
        return new Date().getTime() / 86400000 + 2440587.5;
    };

    /* SRC: http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript */
    o.formatarNumero = function (x) {
        return x.toFixed(2).toString().replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    o.datasJulianas = function (data) {
        var hora = data.hora.split(":");
        var dataDe = data.dataDe.split("/");
        var dataAte = data.dataAte.split("/");

        var ret = [];

        var dataInicio = new Date(dataDe[2], parseInt(dataDe[1]) - 1, dataDe[0], hora[0], hora[1], hora[2]);
        var dataFinal = new Date(dataAte[2], parseInt(dataAte[1]) - 1, dataAte[0], hora[0], hora[1], hora[2]);

        while ((((dataFinal - dataInicio) / 1000) / 86400) >= 0) {
            var dt = ON_DAED.ASTRO.getJulianFromGregorian(
                    dataInicio.getDate(),
                    dataInicio.getMonth() + 1,
                    dataInicio.getFullYear(),
                    dataInicio.getHours(),
                    dataInicio.getMinutes(),
                    dataInicio.getSeconds()
                    );

            ret.push({
                dataJuliana: dt,
                dia: dataInicio.getDate(),
                mes: dataInicio.getMonth() + 1,
                ano: dataInicio.getFullYear(),
                hora: dataInicio.getHours(),
                minuto: dataInicio.getMinutes(),
                segundo: dataInicio.getSeconds()
            });

            dataInicio.setDate(dataInicio.getDate() + 1);
        }

        return ret;
    };

    o.obterFaseLua = function (jd) {
        jd = jd || ON_DAED.ASTRO.getJulianFromUnix(new Date().getTime());
        var tipoFaseLua = ON_DAED["ASTRO"].getMoonPhaseFromJulian(jd);
        var faseLua;

        switch (tipoFaseLua) {
            case ON_DAED.ASTRO.MoonPhases.FULL:
                faseLua = "CHEIA";
                break;
            case ON_DAED.ASTRO.MoonPhases.NEW:
                faseLua = "NOVA";
                break;
            case ON_DAED.ASTRO.MoonPhases.FIRST_QUARTER:
                faseLua = "CRESCENTE";
                break;
            case ON_DAED.ASTRO.MoonPhases.LAST_QUARTER:
                faseLua = "MINGUANTE";
        }

        return faseLua;
    };

    o.astro = function (added, sendData, doneFunc, completeFunc) {

        for (var i in sendData) {
            var n = sendData[i];
            if (!isNaN(parseFloat(n)) && isFinite(n)) {
                sendData[i] = Math.round(n * precisao) / precisao;
            }
        }

        if (added === '/data-juliana') {
            var ret = o.datasJulianas(sendData);
            doneFunc(ret);
        } else if (added === '/calendario-gregoriano') {
            var obj = ON_DAED.ASTRO.getDateFromJulian(sendData.entradaJuliana);
            var ret = {
                dia: obj.getUTCDate(),
                mes: obj.getUTCMonth() + 1,
                ano: obj.getUTCFullYear(),
                hora: obj.getUTCHours(),
                minuto: obj.getUTCMinutes(),
                segundo: obj.getUTCSeconds()
            };
            doneFunc(ret);
        } else {
            $.ajax({
                url: 'astro' + added,
                dataType: 'json',
                type: 'POST',
                data: sendData
            })

                    .fail(function () {
                        alert("Erro ao conectar com o servidor!");
                    })

                    .done(doneFunc instanceof Function ? doneFunc : null)

                    .complete(completeFunc instanceof Function ? completeFunc : null);

        }
    };

    o.formatarData = function (dia, mes, ano) {
        return (parseInt(dia) < 10 ? ('0' + dia) : dia) + "/" +
                (parseInt(mes) < 10 ? ('0' + mes) : mes) + "/" +
                ano;
    };

    o.criarQtip = function (content, target, adjustMouse, element) {
        var elem = element || $('canvas:first').parent();

        elem.qtip({
            content: {
                text: content
            },
            position: {
                adjust: {
                    mouse: adjustMouse,
                    x: 25,
                    y: 25
                },
                target: target,
                effect: false,
                viewport: $(window)
            },
            style: {
                classes: "qtip-rounded qtip-bootstrap"
            },
            show: {
                ready: true,
                delay: 0,
                effect: false
            },
            hide: {
                delay: 0,
                effect: false
            },
            events: {
                hidden: function () {
                    $(this).qtip().destroy(true);
                },
                visible: function () {
                    var interval = window.setInterval(function () {
                        if ($('.qtip:visible').length > 0) {
                            $('.qtip:visible').qtip().reposition(null, false);
                        } else {
                            window.clearInterval(interval);
                        }
                    }, 100);
                }
            }
        });
    };

    o.wikipediaSnippet = function (conteudo, elementoHTML, stripImgButton, primeiroParagrafo) {
        var tituloWiki = conteudo.parse.title;
        var baseWikipediaUrl = 'http://pt.wikipedia.org';
        var linkArtigo = tituloWiki.replace(' ', '_');

        var htmlString = '<div id="titulo-wiki"><h1>%TITULO%</h1></div><div id="conteudo-wiki">%CONTEUDO%</div>';

        if (stripImgButton !== true) {
            htmlString += '<a href="%LINK_ARTIGO%"><button type="button" class="btn btn-default conteudo-destaque">Leia mais sobre %TITULO%</button></a>';
        }

        htmlString = htmlString.replace(/%TITULO%/g, tituloWiki);
        htmlString = htmlString.replace('%CONTEUDO%', conteudo.parse.text['*']);
        htmlString = htmlString.replace('%LINK_ARTIGO%', baseWikipediaUrl + '/wiki/' + linkArtigo);
        var conteudoHTML = $(htmlString);
        conteudoHTML.find('a.image').removeAttr('href');
        conteudoHTML.find('.dablink').remove();
        conteudoHTML.find('table').remove();
        conteudoHTML.find('ul').remove();
        conteudoHTML.find('div.noprint').remove();
        conteudoHTML.find('a[href^=#cite]').remove();
        conteudoHTML.find('.thumbinner').css('width', 'auto').css('font-style', 'italic').css('margin-bottom', '10px');
        conteudoHTML.find('.thumbcaption').css('margin-top', '4px').css('font-size', '0.86em');

        if (primeiroParagrafo) {
            conteudoHTML.find('p:not(:first)').remove();
        }

        if (stripImgButton === true) {
            conteudoHTML.find('img').remove();
        }

        var elementoRemovido = null;

        if (conteudoHTML.find('#toc').length !== 0) {
            elementoRemovido = conteudoHTML.find('#toc');
        } else if (conteudoHTML.find('h2').length !== 0) {
            elementoRemovido = conteudoHTML.find('h2');
        }

        if (elementoRemovido !== null) {
            elementoRemovido.nextAll().remove();
            elementoRemovido.remove();
        }

        conteudoHTML.find('a').each(function (index) {
            if ($(this).attr('href') !== undefined) {
                if (stripImgButton) {
                    $(this).replaceWith("<span>" + $(this).html() + "</span>");
                } else {
                    $(this).attr('href', 'http://pt.wikipedia.org' + $(this).attr('href'));
                }
            }
        });

        $(elementoHTML).append(conteudoHTML);
    };

    o.formatarDataJuliana = function (juliana, fuso) {
        var d1 = ON_DAED.ASTRO.getDateFromJulian(juliana);

        var dt = new Date(d1);
        var horaAlterada = d1.getUTCHours() + parseFloat(fuso);
        dt.setUTCHours(horaAlterada);
        return o.formatarData(dt.getUTCDate(), dt.getUTCMonth() + 1, dt.getFullYear()) + " às " + o.formatarHora(dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds());
    };

    o.formatarHora = function (hora, minuto, segundo) {
        return (parseInt(hora) < 10 ? ('0' + hora) : hora) + ":" +
                (parseInt(minuto) < 10 ? ('0' + minuto) : minuto) + ":" +
                (parseInt(segundo) < 10 ? ('0' + segundo) : segundo);
    };

    o.dataValida = function (d) {
        var ret = false;

        if (Object.prototype.toString.call(d) === "[object Date]") {
            if (!isNaN(d.getTime())) {
                ret = true;
            }
        }

        return ret;
    };

    o.csv = function (cssQuery, bind) {
        $(cssQuery).bind(bind, function () {
            $(this).prop('disabled', true);

            var header = $('#resultados-input > table > thead > tr > th');
            var body = $('#resultados-input > table > tbody > tr');

            var headerSend = [];

            for (var i = 0; i < header.length; i++) {
                headerSend.push('"' + header[i].innerHTML.replace('"', '\\"') + '"');
            }

            var bodySend = [];

            for (var i = 0; i < body.length; i++) {
                var cols = $(body[i]).children('td');
                var colsSend = [];
                for (var j = 0; j < cols.length; j++) {
                    colsSend.push('"' + cols[j].innerHTML.replace('"', '\\"') + '"');
                }
                bodySend.push(colsSend.join(';'));
            }

            $('#csv-form-titulos').val(headerSend.join(';'));
            $('#csv-form-corpo').val(bodySend.join('\n'));

            $('#csv-form').submit();
            $(this).prop('disabled', false);
        });
    };

    function numberInputMinMax(ev) {
        var value = parseFloat($(this).val());
        var min = parseFloat($(this).attr('min'));
        var max = parseFloat($(this).attr('max'));

        if (isNaN(value) || value < min) {
            $(this).val(min);
        } else if (value > max) {
            $(this).val(max);
        }
    }

    o.numberInputMinMax = function (cssQuery) {

        $.each($(cssQuery), function (k, elem) {
            var events = $._data(elem, 'events');
            var add = true;
            if (events && events.blur) {
                for (var i = 0; i < events.blur.length && add; i++) {
                    if (events.blur[i].handler === numberInputMinMax) {
                        add = false;
                    }
                }
            }

            if (add) {
                $(elem).bind('blur', numberInputMinMax);
            }
        });

    };

    o.fusoOriginal = function (date) {
        var dt = date || new Date();

        var jan = new Date(dt.getFullYear(), 0, 1);
        var jul = new Date(dt.getFullYear(), 6, 1);
        var stdTimezone = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
        return -stdTimezone / 60;
    };

    o.horarioVerao = function (dt) {
        var date = dt || new Date();

        var stdTimezone = o.fusoOriginal(date);

        return (-date.getTimezoneOffset() / 60) > stdTimezone;
    };

    o.addTempoSideralAnglepicker = function (element, target, ts) {
        var elemHora = $(target + "-hora");
        var elemMinuto = $(target + "-min");
        var elemSegundo = $(target + "-sec");
        var elemHidden = $(target + "-hidden");
        var elemSinal = $(target + "-sinal");

        if (ts) {
            $(elemHidden).addClass("input-tempo-sideral");
        }

        element.anglepicker({
            clockwise: false,
            change: function (e, ui) {
                var angle;

                if (ts) {
                    angle = ui.value * Math.PI / 180;
                    elemHidden.val(ui.value / 15);

                } else {
                    angle = ui.value;
                    var valorFinal = ((parseFloat(elemHidden.attr("max")) - parseFloat(elemHidden.attr("min"))) * (angle / 360));

                    if (valorFinal > (parseFloat(elemHidden.attr("max")))) {
                        valorFinal = valorFinal - parseFloat(elemHidden.attr("max")) + parseFloat(elemHidden.attr("min"));
                    }

                    if (ultSign !== null && Math.sign(valorFinal) !== ultSign) {
                        valorFinal *= ultSign;
                    }

                    elemHidden.val(valorFinal.toFixed(14));

                    angle = valorFinal * Math.PI / 180;
                }

                if (elemSinal.length > 0) {
                    if (angle < 0) {
                        angle *= -1;
                        elemSinal.html('-');
                    } else {
                        elemSinal.html('+');
                    }
                }

                ultSign = null;

                var split = ON_DAED.tempoSideral(angle, !ts).split(' ');
                elemHora.val(split[0].replace("h", "").replace("&#186;", ""));
                elemMinuto.val(split[1].replace("'", "").replace("m", ""));
                elemSegundo.val(split[2].replace("\"", "").replace("s", ""));

                elemHidden.trigger('change');

            }, value: 0
        });

        var ultSign = null;

        function blurTempoSideralTextField() {
            var h = elemHora.val().match(/^\d+$/g) === null ? "00" : elemHora.val();
            var m = elemMinuto.val().match(/^\d+$/g) === null ? "00" : elemMinuto.val();
            var s = elemSegundo.val().match(/^\d+$/g) === null ? "00" : elemSegundo.val();

            elemHora.val(h);
            elemMinuto.val(m);
            elemSegundo.val(s);

            var tempoSideral = ON_DAED.parseTempoSideral(h, m, s);

            if (elemSinal.length > 0) {
                if (elemSinal.html() === "-") {
                    tempoSideral *= -1;
                    ultSign = -1;
                } else {
                    ultSign = 1;
                }
            }

            var val;

            if (!ts) {
                var max = parseFloat(elemHidden.attr('max'));

                if (Math.abs(tempoSideral) > max) {
                    tempoSideral = max * Math.sign(tempoSideral);
                    elemHora.val(Math.abs(max));
                    elemMinuto.val("00");
                    elemSegundo.val("00");
                }

                if (+elemHidden.attr("max") === -elemHidden.attr("min")) {
                    var v = parseInt(elemHidden.attr("max"));
                    tempoSideral *= 180 / v;
                } else {
                    var v = parseInt(elemHidden.attr("max"));
                    tempoSideral *= 360 / v;
                }

                val = tempoSideral;
            } else {
                val = tempoSideral;
                tempoSideral *= 15;
            }

            elemHidden.val(val);

            element.anglepicker("value", tempoSideral, true);
        }

        elemHora.bind('blur', blurTempoSideralTextField);
        elemMinuto.bind('blur', blurTempoSideralTextField);
        elemSegundo.bind('blur', blurTempoSideralTextField);

        if (elemSinal.length > 0) {
            elemSinal.click(function () {
                if ($(this).html() === "+") {
                    $(this).html("-");
                } else {
                    $(this).html("+");
                }
                blurTempoSideralTextField();
            });
        }

    };

    o.tempoSideral = function (angulo, notTs) {
        if (!notTs) {
            angulo *= 12 / Math.PI;
        } else {
            angulo *= 180 / Math.PI;
        }

        var tempoSideral = parseFloat(angulo.toPrecision(14));
        var horas = parseInt(tempoSideral);
        var minutosTemp = ((tempoSideral * 60) % 60).toPrecision(10);
        var minutos = parseInt(minutosTemp);
        var segundosTemp = ((minutosTemp * 60) % 60).toPrecision(4);
        var segundos = parseInt(Math.ceil(segundosTemp * 1000) / 1000);

        minutos = minutos % 60;
        segundos = segundos % 60;

        return (Math.abs(horas) < 10 && Math.abs(horas) >= 0 ? (horas < 0 ? "-0" + Math.abs(horas) : "0" + horas) : horas) + (notTs ? "&#186; " : "h ") +
                (Math.abs(minutos) < 10 && Math.abs(minutos) >= 0 ? (minutos < 0 ? "0" + Math.abs(minutos) : "0" + minutos) : Math.abs(minutos)) + (notTs ? "' " : "m ") +
                (Math.abs(segundos) < 10 && Math.abs(segundos) >= 0 ? (segundos < 0 ? "0" + Math.abs(segundos) : "0" + segundos) : Math.abs(segundos)) + (notTs ? "\"" : "s");
    };

    o.parseTempoSideral = function (hora, min, sec) {
        hora = parseInt(hora);
        min = parseInt(min);
        sec = parseInt(sec);

        sec = sec / 3600;
        min = min / 60;

        return hora + sec + min;
    };

    o.tempoSideralRadiano = function (hora, min, sec) {
        return this.parseTempoSideral(hora, min, sec) * 15;
    };

    return o;
})();