function PhysElement () {
	this._position = {x: 0, y: 0, z: 0};
	this._speed = {x: 0, y: 0, z: 0};
	this._accel = {x: 0, y: 0, z: 0};
	this._mass = 1;
}

(function () {
	var GRAVITIONAL_CONSTANT = 6.674E-11;
	
	PhysElement.prototype.applyGravity = function applyGravity (physElement) {
		if(this._mass < physElement._mass) {
			var b = this;
			var a = physElement;
			
			var M = a._mass;
			var m = b._mass;
			
			var vec = {
				x: b._position.x - a._position.x,
				y: b._position.y - a._position.y,
				z: b._position.z - a._position.z
			};
			
			var modVec = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
			
			var scalar = -GRAVITIONAL_CONSTANT * (M + m) / Math.pow(modVec, 3);
			
			b._accel = {
				x: vec.x * scalar,
				y: vec.y * scalar,
				z: vec.z * scalar
			};
		}
	};
	
})();