function PhysElement () {
	this._position = {x: 0, y: 0, z: 0};
	this._speed = {x: 0, y: 0, z: 0};
	this._accel = {x: 0, y: 0, z: 0};
	this._mass = 1;
	this._radius = 1;
	this._collided = false;
}

(function () {
	var GRAVITIONAL_CONSTANT = 6.674E-11;
	
	PhysElement.prototype.applyGravity = function applyGravity (physElement) {
		var vec = null;
		
		if(!this._collided && this._mass <= physElement._mass) {
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
			
			var scalar = -GRAVITIONAL_CONSTANT * (M + m) / Math.pow(modVec, 3);
			
			b._accel = {
				x: vec.x * scalar,
				y: vec.y * scalar,
				z: vec.z * scalar
			};
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
		}
	};
	
	PhysElement.prototype.exportPosition = function exportPosition (e) {
		e.x = this._position.x;
		e.y = this._position.y;
		e.z = this._position.z;
	};
	
})();