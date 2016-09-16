function PhysElement () {
	this._position = {x: 0, y: 0, z: 0};
	this._speed = {x: 0, y: 0, z: 0};
	this._accel = {x: 0, y: 0, z: 0};
	this._mass = 1;
	this._radius = 1;
	this._collided = false;
}

(function () {
	
	Decimal.config({precision: 17});
	
	//var ACCEL_PRECISION = 1E16;
	//var k = 0.01720209895; // gaussian gravitational constant
	//var GRAVITIONAL_CONSTANT = k * k /* AU^3 * day^-2 * sunMass^-1 */;
	var GRAVITIONAL_CONSTANT = Decimal("2.9591230378107436E-04"); // GM from NASA horizons;

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

	PhysElement.prototype.exportPosition = PhysElement.prototype.flushAccel = PhysElement.prototype.applyGravity = function(){};
	
	/* SRC: http://www.jgiesen.de/kepler/kepler.html */
	function EccAnom(ec,m,dp) {
		// arguments:
		// ec=eccentricity, m=mean anomaly,
		// dp=number of decimal places
		var pi = getDecimalPI(), K = pi.div("180");

		m = m.toDegree(); // to degree
		
		var maxIter = 30, i = 0;

		var delta = Decimal("10").toPower(Decimal(-dp));

		var E, F;

		m = m.div(Decimal("360"));

		m = m.sub(m.floor()).multFullCircle();

		if (ec.lt(Decimal("0.8"))) E = m; else E = pi;

		F = E.sub(ec.mul(m.sin())).sub(m);
		
		var One = Decimal("1");
		
		while (F.abs().gt(delta) && (i<maxIter)) {

			E = E.sub( F.div( One.sub( ec.mul(E.cos()) ) ) );

			F = E.sub( ec.mul(E.sin()) ).sub(m);

			i = i + 1;
		
		}

		E = E.div(K);

		return E.toRad();
	}
	
	// Oliver Montenbruck, Thomas Pfleger - Astronomy on the Personal Computer, Position in the Orbit
	// 4.3 Mathematical treatment of Kepler's Equation (pg 67)
	function HyperEccAnom(ECC, MH) {
		
		var MAXIT = 15;
		var EPS = Decimal("1E-10");
		
		var H = ((Decimal("2").mul(MH.abs()).div(ECC)).add(Decimal("1.8"))).ln();
		
		if(MH.lt(Decimal("0"))) H = H.neg();

		var SINHH = H.sinh();
		var COSHH = H.cosh();
		var F = (ECC.mul(SINHH)).sub(H).sub(MH);
		var I = 0;
		var One = Decimal("1");
		while( (F.abs().gt(EPS.mul(One.add((H.add(MH)).abs()))) && (I < MAXIT)) ) {
			H = H.sub(F.div((ECC.mul(COSHH)).sub(One)));
			SINHH = H.sinh();
			COSHH = H.cosh();
			F = (ECC.mul(SINHH)).sub(H).sub(MH);
			I++;
		}
		
		return H;
	}
	
	// http://ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf
	function keplerToCartesianMultMat(I, w, Omega, x, y) {
	
		var cosW = w.cos(),
			sinW = w.sin(),
		
			cosOmega = Omega.cos(),
			sinOmega = Omega.sin(),
		
			cosI = I.cos(),
			sinI = I.sin(),
			
			sinWNeg = sinW.neg(),
			cosWNeg = cosW.neg(),
			
			retX = x.mul(cosW.mul(cosOmega).sub(sinW.mul(sinOmega).mul(cosI))).add(
				   y.mul(sinWNeg.mul(cosOmega).sub(cosW.mul(sinOmega).mul(cosI)))			
			),
			retY = x.mul(cosW.mul(sinOmega).add(sinW.mul(cosOmega).mul(cosI))).add(
				   y.mul(sinWNeg.mul(sinOmega).add(cosW.mul(cosOmega).mul(cosI)))
			),
			retZ = x.mul(sinW.mul(sinI)).add(y.mul(cosW.mul(sinI)));
	
		return [retX, retY, retZ];
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
		var One = Decimal("1");
		var Zero = Decimal("0");
		
		if(e.gt(One)) {
			
			E = HyperEccAnom(e, M);
		
			var absA = a.abs();
			var sinhH = E.sinh();
			var coshH = E.cosh();
		
			q[0] = absA.mul(e.sub(coshH));
			q[1] = absA.mul((e.mul(e).sub(One)).sqrt().mul(sinhH));
			q[2] = Zero;
			
			qDash[0] = GRAVITIONAL_CONSTANT.div(absA).sqrt().neg().mul(sinhH.div(e.mul(coshH.sub(One))));
			qDash[1] = GRAVITIONAL_CONSTANT.mul(e.mul(e).sub(One)).div(absA).sqrt().mul(coshH.div(e.mul(coshH).sub(One)));
			qDash[2] = Zero;
		} else /* fits e === 1 (parabolla) too */ {
		
			E = EccAnom(e, M, 15);
		
			q[0] = a.mul((E.cos().sub(e)));
			q[1] = a.mul(One.sub(e.mul(e)).sqrt()).mul(E.sin());
			q[2] = Zero;
			
			var qDashXScalar = GRAVITIONAL_CONSTANT.div(a).sqrt().neg();
			var qDashYScalar = GRAVITIONAL_CONSTANT.mul( One.sub( e.mul(e) ) ).div(a).sqrt();
			var qDashDiv = One.sub(e.mul(E.cos()));
			
			qDash[0] = qDashXScalar.mul(E.sin().div(qDashDiv));
			qDash[1] = qDashYScalar.mul(E.cos().div(qDashDiv));
			qDash[2] = Zero;
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
		
		var cartesianProperties = keplerToCartesian(Decimal(a), Decimal(e), Decimal(I).toRad(), Decimal(w).toRad(), Decimal(Omega).toRad(), Decimal(M).toRad());
		
		this._speed = cartesianProperties.speed;
		this._position = cartesianProperties.position;
	};
	
})();