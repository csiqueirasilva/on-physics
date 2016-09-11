function PhysFramework (particlePath, updateTime, camPosition) {
	
	var element = document.body;
	
	this.mainControls = null;
	this.particles = [];
	this.sceneAxes = null;//MathHelper.buildAxes(10000);
	this.mainScene = null;
	this.mainCamera;
	this._updateInterval = null;
	this._updateFrequency = null;
	this._callbackRender = null;
	this._labels = [];
	
	this._accTime = 0;
	
	var framework = this;
	
	ON_DAED["3D"].create(function (scene, camera) {

		framework.mainScene = scene;
		framework.mainCamera = camera;
	
		if(framework.sceneAxes !== null) {
			scene.add(framework.sceneAxes);
		}
		
		framework.setCamPosition(camPosition);
		
	}, function (cameraControl, renderer, scene, camera, stats, clock) {
		if(framework._callbackRender instanceof Function) {
			framework._callbackRender();
		}
		
		cameraControl.update();
		ON_DAED["3D"].update();
		renderer.render(scene, camera);
	},
	element,
	function (camera, renderer) {
		var oc = new THREE.OrbitControls(camera, element);
		oc.enableDamping = false;
		framework.mainControls = oc;
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
	
	this.clearObjectUpdate();
	
	this._updateInterval = window.setInterval(function() {
	
		for(var i = 0; i < particles.length; i++) {
			for(var j = 0; j < particles.length; j++) {
				if(i !== j) {
					particles[i]._physElement.applyGravity(particles[j]._physElement);
				}
			}
		}

		for(var i = 0; i < particles.length; i++) {
			particles[i]._physElement.flushAccel(framework.timeInterval);
			particles[i]._physElement.exportPosition(particles[i].position);
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
	var wrapper = new PhysObject3D();
	
	wrapper.initFromVectors(radius, mass, position, speed, color);
	
	this.particles.push(wrapper);
	this.mainScene.add(wrapper);

	return wrapper;
};

PhysFramework.prototype.addObjectFromKepler = function addObjectFromKepler (mass, radius, color, a, e, I, w, Omega, M) {
	var wrapper = new PhysObject3D();
	
	wrapper.initFromKepler(mass, radius, color, a, e, I, w, Omega, M);
	
	this.particles.push(wrapper);
	this.mainScene.add(wrapper);

	return wrapper;
};

PhysFramework.prototype.hideObject = function hide (obj) {
	if(obj instanceof PhysObject3D) {
		obj.visible = false;
		if(obj._trace !== null) {
			obj._trace.trace.visible = false;
		}
	}
};

PhysFramework.prototype.showObject = function show (obj) {
	if(obj instanceof PhysObject3D) {
		obj.visible = true;
		if(obj._trace !== null) {
			obj._trace.trace.visible = true;
		}
	}
};

PhysFramework.prototype.addTracingLine = function addTracingLine (obj, nVerts) {
	if(obj instanceof PhysObject3D) {
		var color = obj._tracingLineColor;
		var trace = new PhysTrace(obj, color, nVerts);
		this.mainScene.add(trace.trace);
	}
};

PhysFramework.prototype.addObjectFromKepler2 = function addObjectFromKepler2 (mass, radius, color, a, e, I, L, longitudeOfPerihelion, Omega) {

	var w = (longitudeOfPerihelion - Omega);
	var M = (L - longitudeOfPerihelion) % 360;
	
	if(M > 180) {
		M -= 180;
	}
	
	return this.addObjectFromKepler(mass, radius, color, a, e, I, w, Omega, M);
};

PhysFramework.prototype.addSpriteLabel = function (obj, name, scale) {
	var nameObject = null;
	
	if(obj instanceof PhysObject3D && name) {
	
		var str = "<----- " + name;
	
		var accSpace = "";
		
		for(var i = 0; i < str.length * 2; i++) {
			accSpace += " ";
		}
	
		nameObject = ThreeHelper.Sprite.FromText(accSpace + str);
		obj.add(nameObject);
		
		obj._label = nameObject;
		
		if(scale) {
			nameObject.scale.multiplyScalar(scale);
		}
		
		this._labels.push(nameObject);
	}
	
	return nameObject;
};

PhysFramework.prototype.hideSpriteLabels = function () {
	for(var i = 0; i < this._labels.length; i++) {
		this._labels[i].visible = false;
	}
};

PhysFramework.prototype.showSpriteLabels = function () {
	for(var i = 0; i < this._labels.length; i++) {
		this._labels[i].visible = true;
	}
};

PhysFramework.prototype.createReferenceAxis = function createReferenceAxis (obj) {
	
	var debugAxisMarkers = null;
	
	if(obj instanceof PhysObject3D) {
	
		obj._physElement.exportPosition(earth.position);
		
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
};