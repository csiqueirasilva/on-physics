function PhysFramework (particlePath) {
	
	var element = document.body;
	var controls;

	this.particles = [];
	this.sceneAxes = MathHelper.buildAxes(10000);
	this.mainScene = null;
	this.mainCamera;
	
	var mainScene;
	var mainCamera;
	var sceneAxes = this.sceneAxes;
	var particles = this.particles;
	
	this.particleTexture = THREE.ImageUtils.loadTexture(particlePath);
	
	ON_DAED["3D"].create(function (scene, camera) {

		mainScene = scene;

		scene.add(sceneAxes);

		camera.position.set(0, 0, -100);
		
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
	
	this.mainCamera = mainCamera;
	this.mainScene = mainScene;
	
	ON_DAED['3D'].START_RENDER();	
	
	var timeInterval = 1 / 2000;

	window.setInterval(function() {

		debugger;
	
		for(var i = 0; i < particles.length; i++) {
			for(var j = 0; j < particles.length; j++) {
				if(i !== j) {
					particles[i].physElement.applyGravity(particles[j].physElement);
				}
			}
		}

		for(var i = 0; i < particles.length; i++) {
			particles[i].physElement.flushAccel(timeInterval);
			particles[i].physElement.exportPosition(particles[i].position);
		}
		
	//			controls.target.y = camera.position.y = sphereC.position.y;
		
	}, timeInterval * 1000);
	
}

PhysFramework.prototype.addObject = function addObject (radius, mass, position, speed) {
	var particle = new THREE.Sprite(
		new THREE.SpriteMaterial({
			map: this.particleTexture,
			color: 0xFF0000
		})
	);
	
	particle.scale.multiplyScalar(radius);
	
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