function PhysCollision2D (src, dst) {
	THREE.Object3D.apply(this, arguments);
	//this.add(MathHelper.buildAxes(1000));
	this._src = src;
	this._dst = dst;
	this._physFramework = null;
	this._objects = [];
	dst.add(this);
}

PhysCollision2D.prototype = Object.create(THREE.Object3D.prototype);

PhysCollision2D.prototype.constructor = PhysCollision2D;

PhysCollision2D.prototype._changeState = function(){};

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
		this._changeState(this._dst._physElement._radius, o._physElement._radius, o, comparePos);
	}
};

PhysCollision2D.prototype.addObject = function addObject (name, object) {
	if(object instanceof PhysObject3D) {
		object.name = name;
		this._objects.push(object);
	}
};