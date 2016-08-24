function PhysObject3D () {
    THREE.Object3D.apply(this, arguments);
	this._physElement = new PhysElement();
	this._particle = null;
	this._label = null;
	this._init = false;
};

PhysObject3D.prototype = Object.create(THREE.Object3D.prototype);

PhysObject3D.prototype.constructor = PhysObject3D;

PhysObject3D.prototype.initFromKepler = function (mass, radius, color, a, e, I, w, Omega, M) {
	var particle = null;
	
	if(this._init === false) {
		
		var particle = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: this.particleTexture,
				color: !isNaN(color) ? color : parseInt(Math.random() * 0x333333 + 0xCCCCCC)
			})
		);
		
		particle.scale.multiplyScalar(radius * 2);
		
		this._physElement.fromKepler(mass, radius, a, e, I, w, Omega, M);
		
		this.add(particle);
		this._particle = particle;
		
	}
	
	return particle;
}

PhysObject3D.prototype.initFromVectors = function (radius, mass, position, speed, color) {
	var particle = null;
	
	if(this._init === false) {
	
		particle = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: this.particleTexture,
				color: !isNaN(color) ? color : parseInt(Math.random() * 0x333333 + 0xCCCCCC)
			})
		);
		
		particle.scale.multiplyScalar(radius * 2);
		
		var physElement = this._physElement;
		
		physElement._mass = mass;
		physElement._radius = radius;
		
		physElement._position.x = particle.position.x = position.x;
		physElement._position.y = particle.position.y = position.y;
		physElement._position.z = particle.position.z = position.z;

		physElement._speed.x = speed.x;
		physElement._speed.y = speed.y;
		physElement._speed.z = speed.z;
		
		this.add(particle);
		this._particle = particle;
	
	}
		
	return particle;
};

PhysObject3D.prototype.particleTexture = THREE.ImageUtils.loadTexture(typeof PARTICLE_PATH !== "undefined" ? PARTICLE_PATH : "../imgs/particleTexture.png");