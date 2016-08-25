function PhysSolarSystem (imgPath) {
	
	this.physFramework = new PhysFramework(
		imgPath,
		1,
		{x: 0, y: 0, z: -4}
	);

	// control variables
	this._objects = [];
	this._solarSystemInit = false;
	this._sdmInit = false;
	this._epochDate = null;
}

(function () {
	
	var LABEL_SCALE_FACT = 0.1;
	var EARTH_MASS = 0.000003003; // in solar mass
	var UA = 149597870.7; //km
	var EARTH_RADIUS = 4.2587504555972266254990218921612e-5; // AU
	
	PhysSolarSystem.prototype.getUA = function () {
		return UA;
	};
	
	PhysSolarSystem.prototype.getEarthMass = function () {
		return EARTH_MASS;
	};
	
	PhysSolarSystem.prototype.getSun = function () {
		return this._objects[0];
	};

	PhysSolarSystem.prototype.getEarth = function () {
		return this._objects[3];
	};
	
	PhysSolarSystem.prototype.getEarthObjectDistance = function () {

		var ret = null;
	
		var earth = this.getEarth();
		var body = this._objects[this._objects.length - 1];
		
		var dist = Math.abs(earth.position.clone().sub(body.position).length() * UA);

		ret = dist;
		
		return ret;
	};
	
	PhysSolarSystem.prototype.checkInputDate = function checkInputDate (jd) {
		// 2451545.0 == Jan 1 2000 12:00
		// 2378497.0 == Jan 1 1800 12:00
		// 2469807.0 == Jan 1 2050 12:00
		// Constants are defined for inputs between 1800 and 2050
		
		var topLimit = 2469807.0;
		var bottomLimit = 2378497.0;
		
		var ret = jd >= bottomLimit && jd <= topLimit;
		
		return ret;
	};
	
	PhysSolarSystem.prototype.hideOtherPlanets = function hideOtherPlanets () {
		var physFramework = this.physFramework;
		var topLimit = 12;
		
		for(var i = 1; i < topLimit; i++) {
			if(i !== 3) {
				physFramework.hideObject(this._objects[i]);
			}
		}
	};
	
	PhysSolarSystem.prototype.initSolarSystem = function(jd) {

		if(!this._solarSystemInit) {
			
			if(!this.checkInputDate(jd)) {
				jd = 2451545.0; // defaults to Jan 1 2000 12:00
			}
			
			this._epochDate = jd;
			
			var t = (jd - 2451545.0) / 36525;
		
			var physFramework = this.physFramework;
		
			// EARTH BARY
			var earth = physFramework.addObjectFromKepler2(
				EARTH_MASS,
				0.001,
				0x0077FF,
				1.00000261 + (0.00000562 * t),
				0.01671123 + (-0.00004392 * t),
				-0.00001531 + (-0.01294668 * t),
				100.46457166 + (35999.37244981 * t),
				102.93768193 + (0.32327364 * t),
				0 + 0 * t
			);
			
			physFramework.addTracingLine(earth, 350);
			
			// VENUS
			var venus = physFramework.addObjectFromKepler2(
				EARTH_MASS * 0.815,
				0.01,
				0xFFa500,
				0.72333566 + 0.00000390 * t,
				0.00677672 + -0.00004107 * t,
				3.39467605 + -0.00078890 * t,
				181.97909950 + 58517.81538729 * t,
				131.60246718 + 0.00268329 * t,
				76.67984255 + -0.27769418 * t
			);
			
			physFramework.addTracingLine(venus, 200);
			
			// MERCURY
			var mercury = physFramework.addObjectFromKepler2(
				EARTH_MASS * 0.055,
				0.005,
				0xd3d3d3,
				0.38709927 + 0.00000037 * t,
				0.20563593 + 0.00001906 * t,
				7.00497902 + -0.00594749 * t,
				252.25032350 + 149472.67411175 * t,
				77.45779628 + 0.16047689 * t,
				48.33076593 + -0.12534081 * t
			);
			
			physFramework.addTracingLine(mercury, 120);
			
			// MARS
			var mars = physFramework.addObjectFromKepler2(
				EARTH_MASS * 0.107,
				0.0075,
				0xFF0000,
				1.52371034 + 0.00001847 * t,
				0.09339410 + 0.00007882 * t,
				1.84969142 + -0.00813131 * t,
				-4.55343205 + 19140.30268499 * t,
				-23.94362959 + 0.44441088 * t,
				49.55953891 + -0.29257343 * t
			);
			
			physFramework.addTracingLine(mars, 600);
			
			// JUPITER
			var jupiter = physFramework.addObjectFromKepler2(
				EARTH_MASS * 317.8,
				0.5,
				0xFFA500,
				5.20288700 + -0.00011607 * t,
				0.04838624 + -0.00013253 * t,
				1.30439695 + -0.00183714 * t,
				34.39644051 + 3034.74612775 * t,
				14.72847983 + 0.21252668 * t,
				100.47390909 + 0.20469106 * t
			);
			
			physFramework.addTracingLine(jupiter, 500);
			
			var saturn = physFramework.addObjectFromKepler2(
				EARTH_MASS * 95.16,
				0.275,
				0xC5FF77,
				9.53667594 + -0.00125060 * t,
				0.05386179 + -0.00050991 * t,
				2.48599187 + 0.00193609 * t,
				49.95424423 + 1222.49362201 * t,
				92.59887831 + -0.41897216 * t,
				113.66242448 + -0.28867794 * t
			);

			physFramework.addTracingLine(saturn, 600);

			var uranus = physFramework.addObjectFromKepler2(
				EARTH_MASS * 14.54,
				0.35,
				0xCCCCFF,
				19.18916464 + -0.00196176 * t,
				0.04725744 + -0.00004397 * t,
				0.77263783 + -0.00242939 * t,
				313.23810451 + 428.48202785 * t,
				170.95427630 + 0.40805281 * t,
				74.01692503 + 0.04240589 * t
			);
			
			physFramework.addTracingLine(uranus, 700);

			var neptune = physFramework.addObjectFromKepler2(
				EARTH_MASS * 17.15,
				0.35,
				0x0077FF,
				30.06992276 + 0.00026291 * t,
				0.00859048 + 0.00005105 * t,
				1.77004347 + 0.00035372 * t,
				-55.12002969 + 218.45945325 * t,
				44.96476227 + -0.32241464 * t,
				131.78422574 + -0.00508664 * t
			);
			
			physFramework.addTracingLine(neptune, 800);

			// SUN
			var sun = physFramework.addObject(
				0.1,
				1,
				{x: 0, y: 0, z: 0},
				{x: 0, y: 0, z: 0},
				0xFFFF00
			);
			
			//sun._physElement._collided = true;
			
			this._objects.push(sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune);
			this._solarSystemInit = true;
		}
	}

	PhysSolarSystem.prototype.loadStandardDynamicModel = function (data) {
		if(!this._sdmInit) {
			
			var results = data.results;
			
			// SUN
			var sun = physFramework.addObject(
				EARTH_RADIUS * 103.44673896894963601247957212896,
				1,
				{x: 0, y: 0, z: 0},
				{x: 0, y: 0, z: 0},
				0xFFFF00
			);

			this._objects.push(sun);
			
			for(var i = 0; i < results.length; i++) {
			
				var m = results[i].mass,
					a = results[i].a,
					e = results[i].ec,
					I = results[i].in,
					peri = results[i].w,
					node = results[i].om,
					M = results[i].ma,
					name = results[i].name,
					r = results[i].radius;
				
				var object = this.physFramework.addObjectFromKepler(
						m,
						r,
						i === 2 ? 0x00FF00 : 0xFFFFFF,
						a,
						e,
						I,
						peri,
						node,
						M
					);
					
				this.physFramework.addTracingLine(object, 800);

				this.physFramework.addSpriteLabel(object, name, LABEL_SCALE_FACT);
				
				this._objects.push(object);
			}
			
			this._epochDate = data.jd;
			this._sdmInit = true;
		}
	};
	
	PhysSolarSystem.prototype.loadObject = function (data) {
		var body = null;
		
		if(this._epochDate === data.jd) {
			var results = data.results[0];
			var name = results.name;
			
			var r = data.results[0].radius || (EARTH_RADIUS * 2.2284950230277819046204130144109e-5); // defaults to apophis' radius
			var m = data.results[0].mass || (EARTH_MASS * 4.519E-15); // defaults to apophis' mass
			
			// temp constants
			body = this.physFramework.addObjectFromKepler(
				m, r, 0xFF0000, results.a, results.ec, results.in, results.w, results.om, results.ma
			);

			this.physFramework.addTracingLine(body, 350);
			
			this.physFramework.addSpriteLabel(body, name, LABEL_SCALE_FACT);

			this._objects.push(body);
		}
		
		return body;
	};
	
})();