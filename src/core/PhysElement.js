function PhysElement () {
	this._position = {x: 0, y: 0, z: 0};
	this._speed = {x: 0, y: 0, z: 0};
	this._accel = {x: 0, y: 0, z: 0};
	this._mass = 1;
	this._radius = 1;
	this._collided = false;
}

(function () {
	var ACCEL_PRECISION = 1E7;
	var k = 0.01720209895; // gaussian gravitational constant
	var GRAVITIONAL_CONSTANT = k * k /* AU^3 * day^-2 * sunMass^-1 */;
	
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
	
		// Nico Sneeuw Pg 23 (2.11) / formula sheet (1)
		var E = EccAnom(e, M, 15);
		
		// Nico Sneeuw Pg 23 (2.12) / formula sheet (2)
		var q = [
			a * (Math.cos(E) - e),
			a * Math.sqrt(1 - e * e) * Math.sin(E),
			0
		];
		
		// Nico Sneeuw Pg 23 (2.12) / formula sheet (2)
		// Oliver, Thomas Pg 64
		var qDashXScalar = -Math.sqrt(GRAVITIONAL_CONSTANT / a);
		var qDashYScalar = Math.sqrt((GRAVITIONAL_CONSTANT * (1 - e * e)) / a);
		var qDashDiv = (1 - e * Math.cos(E));
		var qDash = [
			qDashXScalar * (Math.sin(E) / qDashDiv),
			qDashYScalar * (Math.cos(E) / qDashDiv),
			0
		];
		
		// Nico Sneeuw Pg 24 (2.15 & 2.16) / formula sheet (5 & 6)
		var multMat = multMat3x3(multMat3x3(R3(-Omega), R1(-I)), R3(-w));
		var r = multMatVet(multMat, q);
		var rDash = multMatVet(multMat, qDash);
		var rotFix = R3(Math.PI / 2);
		r = multMatVet(rotFix, r);
		rDash = multMatVet(rotFix, rDash);
		
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
			w - Argument of Pericenter
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