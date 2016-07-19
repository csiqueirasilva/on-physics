MathHelper = {};

/* v' = v-2(v<dot>n).n
 * https://github.com/mrdoob/three.js/issues/3009
 */
MathHelper.reflect = function (vector, extlineBetween) {
    var reflect = new THREE.Vector3();
    var lineBetween = extlineBetween.clone();
    reflect.copy(vector).add(lineBetween.multiplyScalar(-2 * vector.dot(lineBetween)));
    return reflect;
};

MathHelper.buildCurve = function (aX, aY, xRadius, yRadius, startAngle, endAngle, clockwise, nPoints, color) {
    var curve = new THREE.EllipseCurve(
            aX, aY, // ax, aY
            xRadius, yRadius, // xRadius, yRadius
            startAngle, endAngle, // aStartAngle, aEndAngle
            clockwise             // aClockwise
            );

    var path = new THREE.Path(curve.getPoints(nPoints || 50));
    var geometry = path.createPointsGeometry(nPoints || 50);
    geometry.vertices.pop();
    var material = new THREE.LineBasicMaterial({color: color || 0xff0000, linewidth: 1});

    var ellipse = new THREE.Line(geometry, material);

    return ellipse;
};

MathHelper.buildLimitedSphereLines = function (arcLength, radius, color, dashed, gap, lineWidth) {
    var geo = new THREE.Geometry();
    var mat;

    gap = gap || 1;

    if (!lineWidth) {
        lineWidth = 1;
    }

    if (dashed) {
        mat = new THREE.LineDashedMaterial({linewidth: lineWidth, color: color, dashSize: gap * 30, gapSize: gap * 30});
    } else {
        mat = new THREE.LineBasicMaterial({linewidth: lineWidth, color: color});
    }

    if (arcLength > 0) {
        for (var i = 0; i < arcLength; i += gap) {
            geo.vertices.push(new THREE.Vector3(radius * Math.cos(i), 0, radius * Math.sin(i)));
        }
    } else {
        for (var i = 0; i > arcLength; i -= gap) {
            geo.vertices.push(new THREE.Vector3(radius * Math.cos(i), 0, radius * Math.sin(i)));
        }
    }

    geo.vertices.push(new THREE.Vector3(radius * Math.cos(arcLength), 0, radius * Math.sin(arcLength)));

    geo.computeLineDistances();

    var verticeMeio = geo.vertices[parseInt(geo.vertices.length / 2)];
    var x = verticeMeio.x;
    var z = verticeMeio.z;

    var ret = new THREE.Line(geo, mat, THREE.LineStrip);

    ret.position.x = -x;
    ret.position.z = -z;

    var r = new THREE.Object3D();

    r.add(ret);

    return r;
};

MathHelper.cartesianToSpherical = function(v) {
    var o = {};
    
    if(v instanceof THREE.Vector3) {
        o.cartesian = v.clone();
        o.r = v.length();
    } else {
        o.r = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }
    
    o.theta = Math.PI / 2 - Math.atan2(v.y, v.x);
    o.fi = Math.atan2(v.z, v.x);
    o.rho = Math.PI / 2 - Math.atan2(v.y, v.z);
    
    return o;
};

MathHelper.sphericalToCartesian = function (r, hAngle, vAngle) {
    var v = new THREE.Vector3();

    v.x = r * Math.sin(vAngle) * Math.cos(hAngle);
    v.y = r * Math.cos(vAngle);
    v.z = r * Math.sin(vAngle) * Math.sin(hAngle);

    return v;
};

MathHelper.buildSphereLines = function (radius, color, dashed, gap, lineWidth) {
    var geo = new THREE.Geometry();
    var mat;

    gap = gap || 1;
    lineWidth = lineWidth || 1;

    if (dashed) {
        mat = new THREE.LineDashedMaterial({linewidth: lineWidth, color: color, dashSize: gap * 30, gapSize: gap * 30});
    } else {
        mat = new THREE.LineBasicMaterial({linewidth: lineWidth, color: color});
    }

    for (var i = -radius; i < radius; i += gap) {
        geo.vertices.push(new THREE.Vector3(i, 0, -Math.sqrt(radius * radius - i * i)));
    }

    for (; i >= -radius; i -= gap) {
        geo.vertices.push(new THREE.Vector3(i, 0, Math.sqrt(radius * radius - i * i)));
    }

    geo.computeLineDistances();

    return new THREE.Line(geo, mat, THREE.LineStrip);
};

/*
 * http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/
 */

MathHelper.buildAxes = function (length) {

    function buildAxis(src, dst, colorHex, dashed) {
        var geom = new THREE.Geometry(),
                mat;

        if (dashed) {
            mat = new THREE.LineDashedMaterial({linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3});
        } else {
            mat = new THREE.LineBasicMaterial({linewidth: 3, color: colorHex});
        }

        geom.vertices.push(src.clone());
        geom.vertices.push(dst.clone());
        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        var axis = new THREE.Line(geom, mat, THREE.LinePieces);

        return axis;

    }

    var axes = new THREE.Object3D();

    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0), 0xFF0000, false)); // +X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-length, 0, 0), 0xFF0000, true)); // -X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0), 0x00FF00, false)); // +Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -length, 0), 0x00FF00, true)); // -Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length), 0x0000FF, false)); // +Z
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -length), 0x0000FF, true)); // -Z

    return axes;

};

MathHelper.lineFromOrigin = function (pos, color, size, type) {
    var line = new THREE.Geometry();
    var lineColor = color || 0x000000;
    line.vertices.push(new THREE.Vector3(0, 0, 0));
    line.vertices.push(pos.clone());

    return new THREE.Line(line, new THREE.LineBasicMaterial({linewidth: size || 3, color: lineColor}), THREE.LinePieces || type);
};

MathHelper.angleVectors = function (vector1, vector2) {
    var v1 = vector1.clone().normalize();
    var v2 = vector2.clone().normalize();

    return Math.acos(v1.dot(v2));
};

MathHelper.rotateVector = function (vector, extAxis, extAngle) {
    var rotated = vector.clone();
    var axis = extAxis || new THREE.Vector3(0, 1, 0);
    var angle = extAngle || Math.PI / 2;
    var matrix = new THREE.Matrix4().makeRotationAxis(axis, angle);
    return rotated.applyMatrix4(matrix);
};