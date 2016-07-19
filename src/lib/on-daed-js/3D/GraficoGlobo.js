ON_DAED["3D"].GraficoGlobo = function (scene, camera, raioPlaneta, control, obj) {

    var geometriaEsfera = new THREE.SphereGeometry(raioPlaneta, 64, 32);
    camera.position.z = raioPlaneta + 500;

    if(control) {
        control.maxDistance = 3000;
        control.minDistance = 100;
        control.noPan = true;
    }

    var materialAtmosfera = new THREE.MeshPhongMaterial({
        color: 0x0038F4,
        transparent: true,
        side: THREE.FrontSide,
        opacity: 0.15,
        shininess: 20,
        blending: THREE.AdditiveBlending
    });

    var atmosfera = new THREE.Mesh(
            geometriaEsfera.clone(),
            materialAtmosfera);

    atmosfera.scale.multiplyScalar(1.05);

    var texturaTerra = THREE.ImageUtils.loadTexture('imgs/texturas/terra/map.jpg');
    var bumpTerra = THREE.ImageUtils.loadTexture('imgs/texturas/terra/bump.jpg');
    var specularTerra = THREE.ImageUtils.loadTexture('imgs/texturas/terra/specular.jpg');
    var texturaEsferaCeleste = THREE.ImageUtils.loadTexture('imgs/texturas/esfera-celeste/panorama.jpg');

    texturaEsferaCeleste.minFilter = texturaTerra.minFilter = specularTerra.minFilter = bumpTerra.minFilter = THREE.LinearFilter;

    var geometriaTerra = geometriaEsfera.clone();

    var terra = new THREE.Mesh(
            geometriaTerra,
            new THREE.MeshBasicMaterial({
                map: texturaTerra,
                bumpMap: bumpTerra,
                bumpScale: 1,
                shininess: 0.5,
                specularMap: specularTerra
            }));

    var objetoTerra = new THREE.Object3D();

    objetoTerra.add(atmosfera);
    objetoTerra.rotation.x = 23.4 * Math.PI / 180;
    objetoTerra.add(terra);

    var linhasImaginarias = new THREE.Object3D();
    objetoTerra.add(linhasImaginarias);

    var equador = MathHelper.buildSphereLines(raioPlaneta + 0.5, 0xFF0000, true, 0.1);
    var greenwich = MathHelper.buildSphereLines(raioPlaneta + 0.5, 0x00FF00, true, 0.1);
    greenwich.rotation.x = Math.PI / 2;

    var escalaFirmamento = 10;

    var margemEsferaCeleste = 10;

    var esferaCelesteObj = new THREE.Mesh(
            new THREE.SphereGeometry(raioPlaneta + margemEsferaCeleste, 64, 32),
            new THREE.MeshBasicMaterial({
                depthWrite: false,
                side: THREE.BackSide,
                map: texturaEsferaCeleste
            })
            );

    var escalaEsferaCeleste = 50;

    var esferaCelesteGiro = (Math.PI / 2) * 0.81;

    esferaCelesteObj.rotation.z = esferaCelesteGiro;
    esferaCelesteObj.scale.multiplyScalar(escalaEsferaCeleste * escalaFirmamento);

    ON_DAED["3D"].register(scene, esferaCelesteObj, function () {
        esferaCelesteObj.position.copy(camera.position);
    }, true);

    var esferaCeleste = new THREE.Object3D();

    esferaCeleste.scale.multiplyScalar(escalaFirmamento);

    var wrapperEsferaCeleste = new THREE.Object3D();
    wrapperEsferaCeleste.add(esferaCeleste);

    var longitudes = [];

    for (var i = 0; i < 180; i = i + 15) {
        var longitude = MathHelper.buildSphereLines(raioPlaneta + 0.1, 0x000000, false);
        longitude.rotation.x = Math.PI / 2;
        longitude.rotation.z = i * Math.PI / 180;
        longitudes.push(longitude);
        linhasImaginarias.add(longitude);
    }

    var latitudes = [];

    for (var i = -75; i <= 75; i = i + 15) {
        var raioLatitude = (raioPlaneta + 0.1) * Math.cos(i * Math.PI / 180);
        var alturaLatitude = (raioPlaneta + 0.1) * Math.sin(i * Math.PI / 180);
        var longitude = MathHelper.buildSphereLines(raioLatitude, 0x000000, false);
        longitude.position.y = alturaLatitude;
        latitudes.push(longitude);
        linhasImaginarias.add(longitude);
    }

    linhasImaginarias.add(equador);
    linhasImaginarias.add(greenwich);

    ON_DAED["3D"].register(scene, objetoTerra, function () {
    }, true);

    var geometriaLinha = new THREE.Geometry();
    geometriaLinha.vertices.push(new THREE.Vector3(0, 0, 0));
    geometriaLinha.vertices.push(new THREE.Vector3(1.1 * raioPlaneta, 0, 0));
    geometriaLinha.computeLineDistances();

    /* src: https://gist.github.com/maephisto/9228207 */
    var isoCountries = {
        'AF': 'Afghanistan',
        'AX': 'Aland Islands',
        'AL': 'Albania',
        'DZ': 'Algeria',
        'AS': 'American Samoa',
        'AD': 'Andorra',
        'AO': 'Angola',
        'AI': 'Anguilla',
        'AQ': 'Antarctica',
        'AG': 'Antigua And Barbuda',
        'AR': 'Argentina',
        'AM': 'Armenia',
        'AW': 'Aruba',
        'AU': 'Australia',
        'AT': 'Austria',
        'AZ': 'Azerbaijan',
        'BS': 'Bahamas',
        'BH': 'Bahrain',
        'BD': 'Bangladesh',
        'BB': 'Barbados',
        'BY': 'Belarus',
        'BE': 'Belgium',
        'BZ': 'Belize',
        'BJ': 'Benin',
        'BM': 'Bermuda',
        'BT': 'Bhutan',
        'BO': 'Bolivia',
        'BA': 'Bosnia And Herzegovina',
        'BW': 'Botswana',
        'BV': 'Bouvet Island',
        'BR': 'Brazil',
        'IO': 'British Indian Ocean Territory',
        'BN': 'Brunei Darussalam',
        'BG': 'Bulgaria',
        'BF': 'Burkina Faso',
        'BI': 'Burundi',
        'KH': 'Cambodia',
        'CM': 'Cameroon',
        'CA': 'Canada',
        'CV': 'Cape Verde',
        'KY': 'Cayman Islands',
        'CF': 'Central African Republic',
        'TD': 'Chad',
        'CL': 'Chile',
        'CN': 'China',
        'CX': 'Christmas Island',
        'CC': 'Cocos (Keeling) Islands',
        'CO': 'Colombia',
        'KM': 'Comoros',
        'CG': 'Congo',
        'CD': 'Congo, Democratic Republic',
        'CK': 'Cook Islands',
        'CR': 'Costa Rica',
        'CI': 'Cote D\'Ivoire',
        'HR': 'Croatia',
        'CU': 'Cuba',
        'CY': 'Cyprus',
        'CZ': 'Czech Republic',
        'DK': 'Denmark',
        'DJ': 'Djibouti',
        'DM': 'Dominica',
        'DO': 'Dominican Republic',
        'EC': 'Ecuador',
        'EG': 'Egypt',
        'SV': 'El Salvador',
        'GQ': 'Equatorial Guinea',
        'ER': 'Eritrea',
        'EE': 'Estonia',
        'ET': 'Ethiopia',
        'FK': 'Falkland Islands (Malvinas)',
        'FO': 'Faroe Islands',
        'FJ': 'Fiji',
        'FI': 'Finland',
        'FR': 'France',
        'GF': 'French Guiana',
        'PF': 'French Polynesia',
        'TF': 'French Southern Territories',
        'GA': 'Gabon',
        'GM': 'Gambia',
        'GE': 'Georgia',
        'DE': 'Germany',
        'GH': 'Ghana',
        'GI': 'Gibraltar',
        'GR': 'Greece',
        'GL': 'Greenland',
        'GD': 'Grenada',
        'GP': 'Guadeloupe',
        'GU': 'Guam',
        'GT': 'Guatemala',
        'GG': 'Guernsey',
        'GN': 'Guinea',
        'GW': 'Guinea-Bissau',
        'GY': 'Guyana',
        'HT': 'Haiti',
        'HM': 'Heard Island & Mcdonald Islands',
        'VA': 'Holy See (Vatican City State)',
        'HN': 'Honduras',
        'HK': 'Hong Kong',
        'HU': 'Hungary',
        'IS': 'Iceland',
        'IN': 'India',
        'ID': 'Indonesia',
        'IR': 'Iran, Islamic Republic Of',
        'IQ': 'Iraq',
        'IE': 'Ireland',
        'IM': 'Isle Of Man',
        'IL': 'Israel',
        'IT': 'Italy',
        'JM': 'Jamaica',
        'JP': 'Japan',
        'JE': 'Jersey',
        'JO': 'Jordan',
        'KZ': 'Kazakhstan',
        'KE': 'Kenya',
        'KI': 'Kiribati',
        'KR': 'Korea',
        'KW': 'Kuwait',
        'KG': 'Kyrgyzstan',
        'LA': 'Lao People\'s Democratic Republic',
        'LV': 'Latvia',
        'LB': 'Lebanon',
        'LS': 'Lesotho',
        'LR': 'Liberia',
        'LY': 'Libyan Arab Jamahiriya',
        'LI': 'Liechtenstein',
        'LT': 'Lithuania',
        'LU': 'Luxembourg',
        'MO': 'Macao',
        'MK': 'Macedonia',
        'MG': 'Madagascar',
        'MW': 'Malawi',
        'MY': 'Malaysia',
        'MV': 'Maldives',
        'ML': 'Mali',
        'MT': 'Malta',
        'MH': 'Marshall Islands',
        'MQ': 'Martinique',
        'MR': 'Mauritania',
        'MU': 'Mauritius',
        'YT': 'Mayotte',
        'MX': 'Mexico',
        'FM': 'Micronesia, Federated States Of',
        'MD': 'Moldova',
        'MC': 'Monaco',
        'MN': 'Mongolia',
        'ME': 'Montenegro',
        'MS': 'Montserrat',
        'MA': 'Morocco',
        'MZ': 'Mozambique',
        'MM': 'Myanmar',
        'NA': 'Namibia',
        'NR': 'Nauru',
        'NP': 'Nepal',
        'NL': 'Netherlands',
        'AN': 'Netherlands Antilles',
        'NC': 'New Caledonia',
        'NZ': 'New Zealand',
        'NI': 'Nicaragua',
        'NE': 'Niger',
        'NG': 'Nigeria',
        'NU': 'Niue',
        'NF': 'Norfolk Island',
        'MP': 'Northern Mariana Islands',
        'NO': 'Norway',
        'OM': 'Oman',
        'PK': 'Pakistan',
        'PW': 'Palau',
        'PS': 'Palestinian Territory, Occupied',
        'PA': 'Panama',
        'PG': 'Papua New Guinea',
        'PY': 'Paraguay',
        'PE': 'Peru',
        'PH': 'Philippines',
        'PN': 'Pitcairn',
        'PL': 'Poland',
        'PT': 'Portugal',
        'PR': 'Puerto Rico',
        'QA': 'Qatar',
        'RE': 'Reunion',
        'RO': 'Romania',
        'RU': 'Russian Federation',
        'RW': 'Rwanda',
        'BL': 'Saint Barthelemy',
        'SH': 'Saint Helena',
        'KN': 'Saint Kitts And Nevis',
        'LC': 'Saint Lucia',
        'MF': 'Saint Martin',
        'PM': 'Saint Pierre And Miquelon',
        'VC': 'Saint Vincent And Grenadines',
        'WS': 'Samoa',
        'SM': 'San Marino',
        'ST': 'Sao Tome And Principe',
        'SA': 'Saudi Arabia',
        'SN': 'Senegal',
        'RS': 'Serbia',
        'SC': 'Seychelles',
        'SL': 'Sierra Leone',
        'SG': 'Singapore',
        'SK': 'Slovakia',
        'SI': 'Slovenia',
        'SB': 'Solomon Islands',
        'SO': 'Somalia',
        'ZA': 'South Africa',
        'GS': 'South Georgia And Sandwich Isl.',
        'ES': 'Spain',
        'LK': 'Sri Lanka',
        'SD': 'Sudan',
        'SR': 'Suriname',
        'SJ': 'Svalbard And Jan Mayen',
        'SZ': 'Swaziland',
        'SE': 'Sweden',
        'CH': 'Switzerland',
        'SY': 'Syrian Arab Republic',
        'TW': 'Taiwan',
        'TJ': 'Tajikistan',
        'TZ': 'Tanzania',
        'TH': 'Thailand',
        'TL': 'Timor-Leste',
        'TG': 'Togo',
        'TK': 'Tokelau',
        'TO': 'Tonga',
        'TT': 'Trinidad And Tobago',
        'TN': 'Tunisia',
        'TR': 'Turkey',
        'TM': 'Turkmenistan',
        'TC': 'Turks And Caicos Islands',
        'TV': 'Tuvalu',
        'UG': 'Uganda',
        'UA': 'Ukraine',
        'AE': 'United Arab Emirates',
        'GB': 'United Kingdom',
        'US': 'United States',
        'UM': 'United States Outlying Islands',
        'UY': 'Uruguay',
        'UZ': 'Uzbekistan',
        'VU': 'Vanuatu',
        'VE': 'Venezuela',
        'VN': 'Viet Nam',
        'VG': 'Virgin Islands, British',
        'VI': 'Virgin Islands, U.S.',
        'WF': 'Wallis And Futuna',
        'EH': 'Western Sahara',
        'YE': 'Yemen',
        'ZM': 'Zambia',
        'ZW': 'Zimbabwe'
    };

    var dataGeo = {};
    var dataPais = {};

    function cadData(geo, inverse) {
        var coordInverse = inverse ? -1 : 1;
        
        if (isoCountries[geo.c]) {
            if (dataGeo[geo.g] === undefined) {
                var coords = geo.g.split(',');

                if (dataPais[geo.c] === undefined) {
                    dataPais[geo.c] = new THREE.Color();

                    dataPais[geo.c].r = Math.random();
                    dataPais[geo.c].g = Math.random();
                    dataPais[geo.c].b = Math.random();
                }

                var mat = new THREE.LineBasicMaterial({lineWidth: 1});
                mat.color = dataPais[geo.c];

                dataGeo[geo.g] = new THREE.Line(
                        geometriaLinha.clone(), mat)
                    ;

                objetoTerra.add(dataGeo[geo.g]);
                dataGeo[geo.g].rotation.z = parseFloat(coords[0]) * Math.PI / 180;
                dataGeo[geo.g].rotation.y = coordInverse * parseFloat(coords[1]) * Math.PI / 180;
            }

            dataGeo[geo.g].scale.x += 0.01;
        }
    }

    var o = {};

    o.cadData = cadData;
    o.dataGeo = dataGeo;
    o.dataPais = dataPais;

    o.rotateObjetoTerra = function () {
        objetoTerra.rotation.y -= 0.01;
    };

    o.setTerraPosicao = function (y) {
        objetoTerra.position.y = y;
    };

    o.setVisibilityEsferaCelesteBg = function (t) {
        esferaCelesteObj.visible = t;
    };

    o.mostrar = function() {
        for(var k in dataGeo) {
            dataGeo[k].visible = true;
        }
    };
    
    o.girar = function(coord) {
        if(dataGeo[coord]) {
            scene.updateMatrixWorld();
            var v = dataGeo[coord].geometry.vertices[1].clone();
            v.applyMatrix4(dataGeo[coord].matrixWorld);
            v.x -= 20;
            v.normalize();
            camera.position.copy(v.multiplyScalar(raioPlaneta * 4));
            camera.lookAt(new THREE.Vector3(0, 0, 0));
        }
    };
    
    o.esconder = function(coords) {
        for(var k in dataGeo) {
            if(coords.indexOf(k) === -1) {
                dataGeo[k].visible = false;
            } else {
                dataGeo[k].visible = true;
            }
        }
    };

    $('.hover-label-text').show();

    return o;
};