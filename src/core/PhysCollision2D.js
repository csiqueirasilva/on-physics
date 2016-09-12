function PhysCollision2D (src, dst) {
	THREE.Object3D.apply(this, arguments);
	this.add(MathHelper.buildAxes(1000));
	this._src = src;
	this._dst = dst;
	this._physFramework = null;
	this._objects = [];
	this._objectStateData = [];
	dst.add(this);
}

PhysCollision2D.prototype = Object.create(THREE.Object3D.prototype);

PhysCollision2D.prototype.constructor = PhysCollision2D;

(function(){

	var STATES = PhysCollision2D.prototype.STATES = {
		EOC: "Entered OC",
		LOC: "Left OC",
		SB: "SB",
		TR: "TR",
		EEC: "Entered EC",
		LEC: "Left EC"
	};

	var physFramework = null;
	var reportCallback = null;
	var epochDate = null;
	
	function changeState (R, r, stateObject, vector) {
		var distObject = Math.sqrt(vector.x * vector.x + vector.y * vector.y) + r;
		if(distObject <= R && distObject !== 0) {
			var oldState = stateObject.state;
			stateObject.state = vector.z < 0 ? STATES.EOC : STATES.EEC;
			if(physFramework !== null) {
				stateObject.date = epochDate + physFramework._accTime;
			}
			
			if(reportCallback instanceof Function && oldState !== stateObject.state) {
				reportCallback(stateObject);
			}
		} else if (stateObject.state === STATES.EOC || stateObject.state === STATES.EEC) {
			stateObject.state = stateObject.state === STATES.EOC ? STATES.LOC : STATES.LEC;
			if(reportCallback instanceof Function) {
				reportCallback(stateObject);
			}
		}
	}

	PhysCollision2D.prototype.update = function update () {
		var src = this._src;
		var dst = this._dst;

		src.updateMatrixWorld();
		dst.updateMatrixWorld();
		
		var pos = src.position.clone();
		var finalPos = dst.worldToLocal(pos);
		this.lookAt(finalPos);

		this.updateMatrixWorld();
		
		for(var i = 0; i < this._objects.length; i++) {
			var o = this._objects[i];
			o.updateMatrixWorld();
			var comparePos = this.worldToLocal(o.position.clone());
			changeState(this._dst._physElement._radius, o._physElement._radius, this._objectStateData[i], comparePos);
		}
	};

	PhysCollision2D.prototype.setEpochDate = function setEpochDate(ed) {
		epochDate = ed;
	};
	
	PhysCollision2D.prototype.setPhysFramework = function setPhysFramework (fw) {
		if(fw instanceof PhysFramework) {
			physFramework = this._physFramework = fw;
		} else {
			physFramework = this._physFramework = null;
		}
	};
	
	PhysCollision2D.prototype.setReportCallback = function(rc) {
		if(rc instanceof Function) {
			reportCallback = rc;
		}
	};
	
}());

PhysCollision2D.prototype.addObject = function addObject (name, object) {
	if(object instanceof PhysObject3D) {
		this._objects.push(object);
		this._objectStateData.push({state: null, date: null, name: name});
	}
};