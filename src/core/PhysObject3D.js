function PhysObject3D () {
    THREE.Object3D.apply(this, arguments);
	this._physElement = new PhysElement();
	this._particle = null;
	this._sprite = null;
	this._sphere = null;
	this._label = null;
	this._trace = null;
	this._tracingLineColor = 0xFFFFFF;
	this._init = false;
};

PhysObject3D.prototype = Object.create(THREE.Object3D.prototype);

PhysObject3D.prototype.constructor = PhysObject3D;

PhysObject3D.prototype.swapToSphere = function swapToSphere () {
	this._sprite.visible = false;
	this._sphere.visible = true;
};

PhysObject3D.prototype.initFromKepler = function (mass, radius, color, a, e, I, w, Omega, M) {
	var particle = null;
	
	if(this._init === false) {
		
		var chosenColor = !isNaN(color) ? color : parseInt(Math.random() * 0x333333 + 0xCCCCCC);
		
		particle = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: this.particleTexture,
				color: chosenColor
			})
		);
		
		var sphere = new THREE.Mesh(
			new THREE.SphereGeometry(radius, 32, 16),
			new THREE.MeshBasicMaterial({
				color: chosenColor
			})
		);
		
		particle.scale.multiplyScalar(radius * 2);
		
		this._physElement.fromKepler(mass, radius, a, e, I, w, Omega, M);
		
		this.add(particle);
		this.add(sphere);
		
		sphere.visible = false;
		
		this._sphere = sphere;
		this._sprite = particle;
		
		this._init = true;
	}
	
	return particle;
};

PhysObject3D.prototype.initFromVectors = function (radius, mass, position, speed, color) {
	var particle = null;
	
	if(this._init === false) {
	
		var chosenColor = !isNaN(color) ? color : parseInt(Math.random() * 0x333333 + 0xCCCCCC);
	
		particle = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: this.particleTexture,
				color: chosenColor
			})
		);
		
		var sphere = new THREE.Mesh(
			new THREE.SphereGeometry(radius, 32, 16),
			new THREE.MeshBasicMaterial({
				color: chosenColor
			})
		);
		
		particle.scale.multiplyScalar(radius * 2);
		
		var physElement = this._physElement;
		
		physElement._mass = mass;
		physElement._radius = radius;
	
		this.setVectors(position, speed);
		
		this.add(particle);
		this.add(sphere);
		
		sphere.visible = false;
		
		this._sphere = sphere;
		this._sprite = particle;
		
		this._init = true;
	}
		
	return particle;
};

PhysObject3D.prototype.setVectors = function setVectors (position, speed) {
	
	var physElement = this._physElement;
	
	physElement._position.x = this.position.x = position.x;
	physElement._position.y = this.position.y = position.y;
	physElement._position.z = this.position.z = position.z;

	physElement._speed.x = speed.x;
	physElement._speed.y = speed.y;
	physElement._speed.z = speed.z;

};

PhysObject3D.prototype.particleTexture = THREE.ImageUtils.loadTexture(typeof PARTICLE_PATH !== "undefined" ? PARTICLE_PATH : "../imgs/particleTexture.png");