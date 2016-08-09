function PhysFramework (particlePath, updateTime, camPosition) {
	
	var element = document.body;
	var controls;
	
	this.particles = [];
	this.sceneAxes = MathHelper.buildAxes(10000);
	this.mainScene = null;
	this.mainCamera;
	this._updateInterval = null;
	this._updateFrequency = null;
	
	this._accTime = 0;
	
	var framework = this;
	
	this.particleTexture = THREE.ImageUtils.loadTexture(particlePath);
	
	ON_DAED["3D"].create(function (scene, camera) {

		framework.mainScene = scene;
		framework.mainCamera = camera;

		scene.add(framework.sceneAxes);
		
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
	
	this.timeInterval = 0.0;
	
	ON_DAED['3D'].START_RENDER();	
	
	this.setObjectUpdate(updateTime);
}

PhysFramework.prototype.addDebugAxisMarkers = function addDebugAxisMarkers (unit) {

	var pos = unit || 1;

	if(!this._debugAxisMarkers) {
		this._debugAxisMarkers = new THREE.Object3D();
		
		var geo = new THREE.SphereGeometry(0.01, 64, 32);
		var mat = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
		
		var sDebugPosY = new THREE.Mesh(geo, mat);
		sDebugPosY.position.y = pos;
		this._debugAxisMarkers.add(sDebugPosY);

		var sDebugNegY = new THREE.Mesh(geo, mat);
		sDebugNegY.position.y = -pos;
		this._debugAxisMarkers.add(sDebugNegY);
		
		var sDebugPosX = new THREE.Mesh(geo, mat);
		sDebugPosX.position.x = pos;
		this._debugAxisMarkers.add(sDebugPosX);
		
		var sDebugNegX = new THREE.Mesh(geo, mat);
		sDebugNegX.position.x = -pos;
		this._debugAxisMarkers.add(sDebugNegX);
		
		this.mainScene.add(this._debugAxisMarkers);
	} else {
		this._debugAxisMarkers.children[0].position.y = pos;
		this._debugAxisMarkers.children[1].position.y = -pos;
		this._debugAxisMarkers.children[2].position.x = pos;
		this._debugAxisMarkers.children[3].position.x = -pos;
		
		this._debugAxisMarkers.visible = true;
	}
	
};

PhysFramework.prototype.removeDebugAxisMarkers = function removeAxisMarkers () {
	if(this._debugAxisMarkers instanceof THREE.Object3D) {
		this._debugAxisMarkers.visible = false;
	}
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
		}

		for(var i = 0; i < particles.length; i++) {
			particles[i].physElement.flushAccel(framework.timeInterval);
			particles[i].physElement.exportPosition(particles[i].position);
		}
		
		framework._accTime += framework.timeInterval;
		
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
	
	return particle;
};

PhysFramework.prototype.addObjectFromKepler = function addObjectFromKepler (mass, radius, color, a, e, I, w, Omega, M) {
	var particle = new THREE.Sprite(
		new THREE.SpriteMaterial({
			map: this.particleTexture,
			color: !isNaN(color) ? color : parseInt(Math.random() * 0x333333 + 0xCCCCCC)
		})
	);
	
	particle.scale.multiplyScalar(radius * 2);
	
	particle.physElement = new PhysElement();
	
	particle.physElement.fromKepler(mass, radius, a, e, I, w, Omega, M);
	
	this.particles.push(particle);
	this.mainScene.add(particle);
	
	return particle;
};

PhysFramework.prototype.hide = function hide (obj) {
	if(obj instanceof THREE.Sprite) {
		obj.visible = false;
		if(obj._trace) {
			obj._trace.trace.visible = false;
		}
	}
};

PhysFramework.prototype.show = function show (obj) {
	if(obj instanceof THREE.Sprite) {
		obj.visible = true;
		if(obj._trace) {
			obj._trace.trace.visible = true;
		}
	}
};

PhysFramework.prototype.addTracingLine = function addTracingLine (obj, nVerts) {
	if(obj instanceof THREE.Sprite) {
		var color = obj.material.color.getHex() * 0.25;
		var trace = new PhysTrace(obj, color, nVerts);
		this.mainScene.add(trace.trace);
	}
};

PhysFramework.prototype.addObjectFromKepler2 = function addObjectFromKepler2 (mass, radius, color, a, e, I, L, longitudeOfPerihelion, Omega) {

	var w = longitudeOfPerihelion - Omega;
	var M = (L - longitudeOfPerihelion) % 360;
	
	if(M > 180) {
		M -= 180;
	}
	
	return this.addObjectFromKepler(mass, radius, color, a, e, I, w, Omega, M);
};

PhysFramework.prototype.createReferenceAxis = function createReferenceAxis (obj) {
	
	var debugAxisMarkers = null;
	
	if(obj instanceof THREE.Object3D && obj.physElement instanceof PhysElement) {
	
		obj.physElement.exportPosition(earth.position);
		
		// reference axis to spawn position
		debugAxisMarkers = new THREE.Object3D();

		var geo = new THREE.SphereGeometry(0.01, 64, 32);
		var mat = new THREE.MeshBasicMaterial({color: 0xFFFF00});
		
		var sDebugPosY = new THREE.Mesh(geo, mat);
		sDebugPosY.position.copy(earth.position);
		debugAxisMarkers.add(sDebugPosY);

		var sDebugNegY = new THREE.Mesh(geo, mat);
		sDebugNegY.position.y = -sDebugPosY.position.y;
		sDebugNegY.position.x = -sDebugPosY.position.x;
		debugAxisMarkers.add(sDebugNegY);
		
		var sDebugPosX = new THREE.Mesh(geo, mat);
		sDebugPosX.position.y = -sDebugPosY.position.x;
		sDebugPosX.position.x = sDebugPosY.position.y;
		debugAxisMarkers.add(sDebugPosX);
		
		var sDebugNegX = new THREE.Mesh(geo, mat);
		sDebugNegX.position.y = sDebugPosY.position.x;
		sDebugNegX.position.x = -sDebugPosY.position.y;
		debugAxisMarkers.add(sDebugNegX);
		
		physFramework.mainScene.add(debugAxisMarkers);
	
	}
	
	return debugAxisMarkers;
}