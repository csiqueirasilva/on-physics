function PhysFramework (particlePath, updateTime, camPosition) {
	
	var element = document.body;
	var controls;
	
	this.particles = [];
	this.sceneAxes = MathHelper.buildAxes(10000);
	this.mainScene = null;
	this.mainCamera;
	this._updateInterval = null;
	this._updateFrequency = null;
	
	var framework = this;
	
	this.particleTexture = THREE.ImageUtils.loadTexture(particlePath);
	
	ON_DAED["3D"].create(function (scene, camera) {

		framework.mainScene = scene;
		framework.mainCamera = camera;

		scene.add(framework.sceneAxes);
		
		var sDebug = new THREE.Mesh(new THREE.SphereGeometry(0.01, 64, 32), new THREE.MeshBasicMaterial());
		
		sDebug.position.y = 1;

		scene.add(sDebug);

		framework.setCamPosition(camPosition);
		
	}, function (cameraControl, renderer, scene, camera, stats, clock) {
		cameraControl.update();
		ON_DAED["3D"].update();
		renderer.render(scene, camera);
	},
	element,
	function (camera, renderer) {
		var oc = new THREE.OrbitControls(camera, element);
		oc.enableDamping = false;
		controls = oc;
		return oc;
	});
	
	this.timeInterval = 1 / (365);
	
	ON_DAED['3D'].START_RENDER();	
	
	this.setObjectUpdate(updateTime);
}

PhysFramework.prototype.clearObjectUpdate = function clearObjectUpdate () {
	if(this._updateInterval !== null) {
		window.clearInterval(this._updateInterval);
		this._updateInterval = null;
	}
};

PhysFramework.prototype.setObjectUpdate = function setObjectUpdate (updateTime) {
	var framework = this;
	var particles = this.particles;
	var updateFrequency = !isNaN(updateTime) ? updateTime : 1;
	
	if(this._updateInterval !== null) {
		window.clearInterval(this._updateInterval);
		this._updateInterval = null;
	}
	
	this._updateInterval = window.setInterval(function() {
	
		for(var i = 0; i < particles.length; i++) {
			for(var j = 0; j < particles.length; j++) {
				if(i !== j) {
					particles[i].physElement.applyGravity(particles[j].physElement);
				}
			}
			
			if(i !== 1 && (particles[i].position.y > -0.01 && particles[i].position.y < 0.01)) {
				console.log(new Number(particles[i].position.length() * 1.496e+8)
							.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
			}
		}

		for(var i = 0; i < particles.length; i++) {
			particles[i].physElement.flushAccel(framework.timeInterval);
			particles[i].physElement.exportPosition(particles[i].position);
		}
		
	}, updateFrequency);
	
	this._updateFrequency = updateFrequency;
};

PhysFramework.prototype.setCamPosition = function (camPosition) {
	var finalCamPosition = camPosition instanceof Object ? camPosition : {};
	
	if(!finalCamPosition.x) {
		finalCamPosition.x = 0;
	}
	
	if(!finalCamPosition.y) {
		finalCamPosition.y = 0;
	}
	
	if(!finalCamPosition.z) {
		finalCamPosition.z = 0;
	}
		
	this.mainCamera.position.set(finalCamPosition.x, finalCamPosition.y, finalCamPosition.z);
};

PhysFramework.prototype.addObject = function addObject (radius, mass, position, speed, color) {
	var particle = new THREE.Sprite(
		new THREE.SpriteMaterial({
			map: this.particleTexture,
			color: !isNaN(color) ? color : parseInt(Math.random() * 0x333333 + 0xCCCCCC)
		})
	);
	
	particle.scale.multiplyScalar(radius * 2);
	
	particle.physElement = new PhysElement();
	particle.physElement._mass = mass;
	particle.physElement._radius = radius;
	
	particle.physElement._position.x = particle.position.x = position.x;
	particle.physElement._position.y = particle.position.y = position.y;
	particle.physElement._position.z = particle.position.z = position.z;

	particle.physElement._speed.x = speed.x;
	particle.physElement._speed.y = speed.y;
	particle.physElement._speed.z = speed.z;
	
	this.particles.push(particle);
	this.mainScene.add(particle);
};

PhysFramework.prototype.addObjectFromKepler = function addObjectFromKepler (radius, color, a, e, I, w, Omega, M, n) {
	var particle = new THREE.Sprite(
		new THREE.SpriteMaterial({
			map: this.particleTexture,
			color: !isNaN(color) ? color : parseInt(Math.random() * 0x333333 + 0xCCCCCC)
		})
	);
	
	particle.scale.multiplyScalar(radius * 2);
	
	particle.physElement = new PhysElement();
	
	particle.physElement.fromKepler(radius, a, e, I, w, Omega, M, n);
	
	this.particles.push(particle);
	this.mainScene.add(particle);
	
	return particle;
};

PhysFramework.prototype.addObjectFromKeplerNoMotion = function addObjectFromKepler (radius, color, a, e, I, w, Omega, M, mass) {
	var particle = new THREE.Sprite(
		new THREE.SpriteMaterial({
			map: this.particleTexture,
			color: !isNaN(color) ? color : parseInt(Math.random() * 0x333333 + 0xCCCCCC)
		})
	);
	
	particle.scale.multiplyScalar(radius * 2);
	
	particle.physElement = new PhysElement();
	
	particle.physElement.fromKeplerNoMotion(radius, a, e, I, w, Omega, M, mass);
	
	this.particles.push(particle);
	this.mainScene.add(particle);
	
	return particle;
};