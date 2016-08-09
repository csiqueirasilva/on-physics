var PhysTrace = (function() {

	var TRACES = [];

	function PhysTrace (obj, c, maxVertices) {
		this.mat = new THREE.LineDashedMaterial({
			color: c,
			linewidth: 1,
			dashSize: 1,
			gapSize: 1
		});

		this.obj = obj;
		obj._trace = this;
		this.traceGeo = new THREE.Geometry();
		this.traceGeo.dynamic = true;
		
		var nVerts = maxVertices || 100;
		
		for (var i = 0; i < nVerts; i++) {
			var v = new THREE.Vector3();
			obj.physElement.exportPosition(v);
			this.traceGeo.vertices.push(v);
		}

		this.traceGeo.computeLineDistances();
		
		this.trace = new THREE.Line(this.traceGeo, this.mat);
		this.trace.frustumCulled = false;
		
		TRACES.push(this);
	}

	PhysTrace.prototype.updateTrace = function updateTrace() {
		var traceGeo = this.traceGeo;
		var obj = this.obj;
		var mat = this.mat;
		
		for (var i = 0; i < traceGeo.vertices.length - 1; i++) {
			traceGeo.vertices[i].copy(traceGeo.vertices[i + 1]);
		}

		var v = new THREE.Vector3().copy(obj.position);
		
		traceGeo.vertices[traceGeo.vertices.length - 1].copy(v);
		
		traceGeo.computeLineDistances();
		traceGeo.verticesNeedUpdate = true;
	};
	
	window.StartTracingLines = function StartTracingLines (t) {
	
		var interval = t || 100;
	
		window.setInterval(function() {
			for(var i = 0; i < TRACES.length; i++) {
				TRACES[i].updateTrace();
			}
		}, interval);
	
	};
	
	return PhysTrace;
	
})();