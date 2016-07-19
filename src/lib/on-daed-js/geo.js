(function () {

    ON_DAED['GEO'] = {};

    var IGRF_DATA = null;
    var IGRF_MIN = null;
    var IGRF_MAX = null;

    (function () {

        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4) {
                if (httpRequest.status === 200) {
                    IGRF_DATA = JSON.parse(httpRequest.responseText);
                    IGRF_MIN = 1900;
                    IGRF_MAX = 2020;
                    ON_DAED['GEO'].IGRF = IGRFv12;
                }
            }
        };

        httpRequest.open('GET', 'igrf-v12.json', false);
        httpRequest.send();

    }());


    ON_DAED['GEO'].IGRF_MODE = {
        GEODETIC: 1,
        GEOCENTRIC: 2
    };

    ON_DAED['GEO'].IGRF_ISV = {
        MAIN_FIELD_VALUES: 0,
        SECULAR_VARIATION: 1
    };

    ON_DAED['GEO'].obterDadosMagneticos = function (date, alt, colat, elong) {
        var valoresCampoPrincipal = ON_DAED.GEO.IGRF(
                ON_DAED.GEO.IGRF_ISV.MAIN_FIELD_VALUES,
                date,
                ON_DAED.GEO.IGRF_MODE.GEODETIC,
                alt,
                colat,
                elong
                );

        var grau = 180 / Math.PI;

        var D = grau * Math.atan2(valoresCampoPrincipal.y, valoresCampoPrincipal.x);
        var H = Math.sqrt(valoresCampoPrincipal.x * valoresCampoPrincipal.x + valoresCampoPrincipal.y * valoresCampoPrincipal.y);
        var S = grau * Math.atan2(valoresCampoPrincipal.z, H);

        var valoresSeculares = ON_DAED.GEO.IGRF(
                ON_DAED.GEO.IGRF_ISV.SECULAR_VARIATION,
                date,
                ON_DAED.GEO.IGRF_MODE.GEODETIC,
                alt,
                colat,
                elong
                );

        var DD = (60 * grau * (valoresCampoPrincipal.x * valoresSeculares.y - valoresCampoPrincipal.y * valoresSeculares.x)) / (H * H);
        var DH = (valoresCampoPrincipal.x * valoresSeculares.x + valoresCampoPrincipal.y * valoresSeculares.y) / H;
        var DS = (60 * grau * (H * valoresSeculares.z - valoresCampoPrincipal.z * DH)) / (valoresCampoPrincipal.f * valoresCampoPrincipal.f);
        var DF = (H * DH + valoresCampoPrincipal.z * valoresSeculares.z) / valoresCampoPrincipal.f;

        return {
            inclinacao: S,
            declinacao: D,
            intensidade: valoresCampoPrincipal.f,
            H: H,
            DH: DH,
            variacaoInclinacao: DS,
            variacaoDeclinacao: DD,
            variacaoIntensidade: DF,
            variacaoSecular: valoresSeculares,
            valoresCampo: valoresCampoPrincipal
        };

    };

    // src: NOAA
    function IGRFv12(isv, date, itype, alt, colat, elong) {

        var yearData = parseInt(date);

        var ret = null;

        if (yearData >= IGRF_MIN && yearData <= IGRF_MAX) {

            var x = 0, y = 0, z = 0;

            if (date < 2015.0) {

                var t = 0.2 * (date - 1900.0);
                var ll = parseInt(t);
                var one = ll;
                t = t - one;

                var nmx;
                var nc;
                var kmx;
                var tc;

                /* SH models before 1995.0 are only to degree 10 */
                if (date < 1995.0) {
                    nmx = 10;
                    nc = nmx * (nmx + 2);
                    ll = nc * ll;
                    kmx = (nmx + 1) * (nmx + 2) / 2;
                } else {
                    nmx = 13;
                    nc = nmx * (nmx + 2);
                    ll = parseInt(0.2 * (date - 1995.0));

                    /* 19 is the number of SH models that extend to degree 10 */

                    ll = 120 * 19 + nc * ll;
                    kmx = parseInt((nmx + 1) * (nmx + 2) / 2);
                }
                tc = 1.0 - t;
                if (isv === ON_DAED['GEO'].IGRF_ISV.SECULAR_VARIATION) {
                    tc = -0.2;
                    t = 0.2;
                }
            } else {

                t = date - 2015.0;
                tc = 1.0;

                if (isv === ON_DAED['GEO'].IGRF_ISV.SECULAR_VARIATION) {
                    t = 1.0;
                    tc = 0.0;
                }

                /* pointer for last coefficient in pen-ultimate set of MF coefficients... */
                ll = 3060;
                nmx = 13;
                nc = nmx * (nmx + 2);
                kmx = parseInt((nmx + 1) * (nmx + 2) / 2);
            }

            var r = alt;

            var radian = 0.017453292;//Math.PI / 180;//0.01745329238474369; // had to adjust pi/180 to this

            one = colat * radian;
            var ct = Math.cos(one);
            var st = Math.sin(one);
            one = elong * radian;

            var cl = [];
            var sl = [];

            cl[1] = Math.cos(one);
            sl[1] = Math.sin(one);

            var cd = 1.0;
            var sd = 0.0;
            var l = 1;
            var m = 1;
            var n = 0;

            if (itype === ON_DAED.GEO.IGRF_MODE.GEODETIC) {

                /*     conversion from geodetic to geocentric coordinates 
                 (using the WGS84 spheroid) */

                var a2 = 40680631.6;
                var b2 = 40408296.0;
                one = a2 * st * st;
                var two = b2 * ct * ct;
                var three = one + two;
                var rho = Math.sqrt(three);
                r = Math.sqrt(alt * (alt + 2.0 * rho) + (a2 * one + b2 * two) / three);
                cd = (alt + rho) / r;
                sd = (a2 - b2) / rho * ct * st / r;
                one = ct;
                ct = ct * cd - st * sd;
                st = st * cd + one * sd;

            } else if (alt <= 3485) {
                alt = 3486;
            }

            var ratio = 6371.2 / r;
            var rr = ratio * ratio;

            /* computation of Schmidt quasi-normal coefficients p and x(=q) */

            var p = [];
            var q = [];

            var fn, gn, fm, gmm, fn, j, i, lm;

            var gh = IGRF_DATA;

            p[1] = 1.0;
            p[3] = st;
            q[1] = 0.0;
            q[3] = ct;

            for (var k = 2; k <= kmx; k++) {
                if (n < m) {
                    m = 0;
                    n = n + 1;
                    rr = rr * ratio;
                    fn = n;
                    gn = n - 1;
                }

                fm = m;

                if (m !== n) {
                    gmm = m * m;
                    one = Math.sqrt(fn * fn - gmm);
                    two = Math.sqrt(gn * gn - gmm) / one;
                    three = (fn + gn) / one;
                    i = k - n;
                    j = i - n + 1;
                    p[k] = three * ct * p[i] - two * p[j];
                    q[k] = three * (ct * q[i] - st * p[i]) - two * q[j];
                } else if (k !== 3) {
                    one = Math.sqrt(1.0 - 0.5 / fm);
                    j = k - n - 1;
                    p[k] = one * st * p[j];
                    q[k] = one * (st * q[j] + ct * p[j]);
                    cl[m] = cl[m - 1] * cl[1] - sl[m - 1] * sl[1];
                    sl[m] = sl[m - 1] * cl[1] + cl[m - 1] * sl[1];
                }

                /* synthesis of x, y and z in geocentric coordinates */

                lm = ll + l;
                one = (tc * gh[lm] + t * gh[lm + nc]) * rr;

                if (m !== 0) {

                    two = (tc * gh[lm + 1] + t * gh[lm + nc + 1]) * rr;
                    three = one * cl[m] + two * sl[m];
                    x = x + three * q[k];
                    z = z - (fn + 1.0) * three * p[k];

                    if (st !== 0.0) {
                        y = y + (one * sl[m] - two * cl[m]) * fm * p[k] / st;
                    } else {
                        y = y + (one * sl[m] - two * cl[m]) * q[k] * ct;
                    }

                    l = l + 2;

                } else {
                    x = x + one * q[k];
                    z = z - (fn + 1.0) * one * p[k];
                    l = l + 1;
                }

                m = m + 1;
            }

            var ret = {};

            one = x;

            ret.x = x * cd + z * sd;
            ret.y = y;
            ret.z = z * cd - one * sd;
            ret.f = Math.sqrt(x * x + y * y + z * z);

        }

        return ret;

    }

}());