function PhysElement () {
	this._position = {x: 0, y: 0, z: 0};
	this._speed = {x: 0, y: 0, z: 0};
	this._accel = {x: 0, y: 0, z: 0};
	this._mass = 1;
	this._radius = 1;
	this._collided = false;
}

(function () {
	var ACCEL_PRECISION = 1E16;
	var k = 0.01720209895; // gaussian gravitational constant
	//var GRAVITIONAL_CONSTANT = k * k /* AU^3 * day^-2 * sunMass^-1 */;
	var GRAVITIONAL_CONSTANT = 2.9591230378107436E-04; // GM from NASA horizons;
	
	PhysElement.prototype.applyGravity = function applyGravity (physElement) {
		var vec = null;
		
		if(!this._collided) {
		
			var b = this;
			var a = physElement;
		
			var M = a._mass;
			var m = b._mass;
		
			vec = {
				x: b._position.x - a._position.x,
				y: b._position.y - a._position.y,
				z: b._position.z - a._position.z
			};
		
			var modVec = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
			
			if(modVec <= this._radius) {
				console.log('please treat collision!');
				a._collided = true;
				b._collided = true;
				return;
			}
		
			var scalar = -(GRAVITIONAL_CONSTANT * M) / Math.pow(modVec, 3);
			
			b._accel.x += Math.round(vec.x * scalar * ACCEL_PRECISION) / ACCEL_PRECISION;
			b._accel.y += Math.round(vec.y * scalar * ACCEL_PRECISION) / ACCEL_PRECISION;
			b._accel.z += Math.round(vec.z * scalar * ACCEL_PRECISION) / ACCEL_PRECISION;
	
		}
		
		return vec;
	};
	
	PhysElement.prototype.flushAccel = function flushAccel (t) {
		if(!this._collided) {
			this._speed.x += this._accel.x * t;
			this._speed.y += this._accel.y * t;
			this._speed.z += this._accel.z * t;
			
			this._position.x += this._speed.x * t;
			this._position.y += this._speed.y * t;
			this._position.z += this._speed.z * t;
			
			this._accel.x = this._accel.y = this._accel.z = 0;
		}
	};
	
	PhysElement.prototype.exportPosition = function exportPosition (e) {
		e.x = this._position.x;
		e.y = this._position.y;
		e.z = this._position.z;
	};

	/* SRC: http://www.jgiesen.de/kepler/kepler.html */
	function EccAnom(ec,m,dp) {
		// arguments:
		// ec=eccentricity, m=mean anomaly,
		// dp=number of decimal places
		var pi=Math.PI, K=pi/180.0;

		m *= (180 / Math.PI); // to degree
		
		var maxIter=30, i=0;

		var delta=Math.pow(10,-dp);

		var E, F;

		m=m/360.0;

		m=2.0*pi*(m-Math.floor(m));

		if (ec<0.8) E=m; else E=pi;

		F = E - ec*Math.sin(m) - m;

		while ((Math.abs(F)>delta) && (i<maxIter)) {

			E = E - F/(1.0-ec*Math.cos(E));
			F = E - ec*Math.sin(E) - m;

			i = i + 1;

		}

		E=E/K;

		return Math.round(E*Math.pow(10,dp))/Math.pow(10,dp) * (Math.PI / 180);
	}
	
	// Oliver Montenbruck, Thomas Pfleger - Astronomy on the Personal Computer, Position in the Orbit
	// 4.3 Mathematical treatment of Kepler's Equation (pg 67)
	function HyperEccAnom(ECC, MH) {
		
		var MAXIT = 15;
		var EPS = 1E-10;
		
		var H = Math.log(2 * Math.abs(MH) / ECC + 1.8);
		if(MH < 0) H = -H;
		var SINHH = sinh(H);
		var COSHH = cosh(H);
		var F = ECC * SINHH - H - MH;
		var I = 0;
		while( (Math.abs(F) > EPS * (1 + Math.abs(H + MH))) && (I < MAXIT) ) {
			H = H - F / (ECC * COSHH - 1);
			SINHH = sinh(H);
			COSHH = cosh(H);
			F = ECC * SINHH - H - MH;
			I++;
		}
		
		return H;
		
	}
	
	function R1 (angle) {
		return [
			1, 0, 0,
			0, Math.cos(angle), -Math.sin(angle),
			0, Math.sin(angle), Math.cos(angle)
		];
	}

	function R3 (angle) {
		return [
			Math.cos(angle), -Math.sin(angle), 0,
			Math.sin(angle), Math.cos(angle), 0,
			0, 0, 1
		];
	}
	
	function multMat3x3(m1, m2) {
	
		var ret = [];
		
		for(var i = 0; i < 3; i++) {
			for(var j = 0; j < 3; j++) {
				var line = i * 3;
				ret[j + line] = m1[line] * m2[j] + m1[line + 1] * m2[j + 3] + m1[line + 2] * m2[j + 6];
			}
		}
	
		return ret; 
	}
	
	function multMatVet(m, v) {
		var ret = [];
		
		for(var j = 0; j < 3; j++) {
			var line = j * 3;
			ret[j] = m[line] * v[0] + m[line + 1] * v[1] + m[line + 2] * v[2];
		}
		
		return ret;
	}
	
	// http://ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf
	function keplerToCartesianMultMat(I, w, Omega, x, y) {
		return [
			(Math.cos(w) * Math.cos(Omega) - Math.sin(w) * Math.sin(Omega) * Math.cos(I)) * x + (-Math.sin(w) * Math.cos(Omega) - Math.cos(w) * Math.sin(Omega) * Math.cos(I)) * y,
			(Math.cos(w) * Math.sin(Omega) + Math.sin(w) * Math.cos(Omega) * Math.cos(I)) * x + (-Math.sin(w) * Math.sin(Omega) + Math.cos(w) * Math.cos(Omega) * Math.cos(I)) * y,
			(Math.sin(w) * Math.sin(I)) * x + (Math.cos(w) * Math.sin(I)) * y
		];
	}

	function sinh (x) {
		return (Math.pow(Math.E, x) - Math.pow(Math.E, -x))/2;
	}

	function cosh (x) {
		return (Math.pow(Math.E, x) + Math.pow(Math.E, -x))/2;
	}
	
	function keplerToCartesian(a, e, I, w, Omega, M) {
		/* 
			a - SemiMajor Axis
			e - Eccentricity
			I - Inclination
			Omega - Longitude of Nodes
			w - Argument of Pericenter
			M - Mean Anomaly
			n - Mean Motion
			
			References:
			Nico Sneeuw - Dynamic Satellite Geodesy, Pg. 12 (mean motion) and Pg. 23, 24 (kepler to cartesian)
			Oliver Montenbruck, Thomas Pfleger - Astronomy on the Personal Computer, Position in the Orbit, Pg. 63, 64
			Online converter - https://janus.astro.umd.edu/orbits/elements/convertframe.html
		*/ 
	
		var E;
	
		var q = []; 
		var qDash = [];
		
		if(e > 1) {
			
			E = HyperEccAnom(e, M);
		
			var absA = Math.abs(a);
			var sinhH = sinh(E);
			var coshH = cosh(E);
		
			q[0] = absA * (e - coshH);
			q[1] = absA * Math.sqrt(e * e - 1) * sinhH;
			q[2] = 0;
			
			qDash[0] = -Math.sqrt(GRAVITIONAL_CONSTANT / absA) * (sinhH / (e * coshH - 1));
			qDash[1] =  Math.sqrt((GRAVITIONAL_CONSTANT * (e * e - 1)) / absA) * (coshH / (e * coshH - 1));
			qDash[2] = 0;
		} else if (e === 1) {
		} else {
		
			E = EccAnom(e, M, 15);
		
			q[0] = a * (Math.cos(E) - e);
			q[1] = a * Math.sqrt(1 - e * e) * Math.sin(E);
			q[2] = 0;
			
			var qDashXScalar = -Math.sqrt(GRAVITIONAL_CONSTANT / a);
			var qDashYScalar = Math.sqrt((GRAVITIONAL_CONSTANT * (1 - e * e)) / a);
			var qDashDiv = (1 - e * Math.cos(E));
			
			qDash[0] = qDashXScalar * (Math.sin(E) / qDashDiv);
			qDash[1] = qDashYScalar * (Math.cos(E) / qDashDiv);
			qDash[2] = 0;
		}
		
		var r = keplerToCartesianMultMat(I, w, Omega, q[0], q[1]);
		var rDash = keplerToCartesianMultMat(I, w, Omega, qDash[0], qDash[1]);
		
		return {
			position: {
				x: r[0],
				y: r[1],
				z: r[2]
			}, 
			speed: {
				x: rDash[0],
				y: rDash[1],
				z: rDash[2]
			}
		};
	}
	
	// for debugging with https://janus.astro.umd.edu/orbits/elements/convertframe.html
	function keplerToCartesianDimensionless(a, e, I, w, Omega, M) {
		// Uses GM = 1
		var n = Math.sqrt(1 / (a * a * a));
		var rad = Math.PI / 180;
		return keplerToCartesian(a, e, I * rad, w * rad, Omega * rad, M * rad, n);
	}
	
	PhysElement.prototype.fromKepler = function fromKepler (mass, radius, a, e, I, w, Omega, M) {
		/* 
			a - SemiMajor Axis
			e - Eccentricity
			I - Inclination
			Omega - Longitude of Nodes
			w - Argument of Pericenter/periapsis
			M - Mean Anomaly
			n - Mean Motion
			
			References:
			Nico Sneeuw - Dynamic Satellite Geodesy, Pg. 12 (mean motion) and Pg. 23, 24 (kepler to cartesian)
			Oliver Montenbruck, Thomas Pfleger - Astronomy on the Personal Computer, Position in the Orbit, Pg. 63, 64
			Online converter - https://janus.astro.umd.edu/orbits/elements/convertframe.html
		*/ 
		
		this._mass = mass;
		this._radius = radius;
		
		var rad = Math.PI / 180;
		
		var cartesianProperties = keplerToCartesian(a, e, I * rad, w * rad, Omega * rad, M * rad);
		
		this._speed = cartesianProperties.speed;
		this._position = cartesianProperties.position;
	};
	
})();