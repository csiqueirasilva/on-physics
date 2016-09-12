var PhysWrapperTrace = (function() {

	function PhysWrapperTrace (maxVertices, x, y, z) {
		THREE.Object3D.apply(this, arguments);
		this._nVerts = maxVertices || 100;
		this._updateVector = new THREE.Vector3();
		this._updateVector.set(x, y, z);
		
//		this.add(MathHelper.buildAxes(10000));
	}
	
	PhysWrapperTrace.prototype = Object.create(THREE.Object3D.prototype);

	PhysWrapperTrace.prototype.constructor = PhysWrapperTrace;

	PhysWrapperTrace.prototype._TRACES = [];
	
	PhysWrapperTrace.prototype.addTracingLine = function (worldObject, color) {
		var mat = new THREE.LineDashedMaterial({
			color: color,
			linewidth: 1,
			dashSize: 1,
			gapSize: 1
		});

		var traceGeo = new THREE.Geometry();
		traceGeo.dynamic = true;
		
		this.updateMatrixWorld();
		worldObject.updateMatrixWorld();
		
		for (var i = 0; i < this._nVerts; i++) {
			var v = this.worldToLocal(worldObject.position).clone();
			traceGeo.vertices.push(v);
		}

		traceGeo.computeLineDistances();
		
		var trace = new THREE.Line(traceGeo, mat);
		trace.frustumCulled = false;
		
		trace._worldObject = worldObject;
		
		this.add(trace);
		this._TRACES.push(trace);
	};
	
	PhysWrapperTrace.prototype.updateTrace = function updateTrace() {
		
		this.position.add(this._updateVector);
		
		for(var i = 0; i < this._TRACES.length; i++) {
			var traceGeo = this._TRACES[i].geometry;
			var obj = this._TRACES[i]._worldObject;
			var mat = this._TRACES[i].material;
		
			this.updateMatrixWorld();
			obj.updateMatrixWorld();
			
			var pos = this.worldToLocal(obj.position.clone());
			pos.multiplyScalar(0.9995); // against z-fighting
			
			if(!traceGeo.vertices[traceGeo.vertices.length - 1].equals(pos)) {
				for (var j = 0; j < traceGeo.vertices.length - 1; j++) {
					traceGeo.vertices[j].copy(traceGeo.vertices[j + 1]);
				}

				var v = new THREE.Vector3().copy(pos);
				
				traceGeo.vertices[traceGeo.vertices.length - 1].copy(v);
				
				traceGeo.computeLineDistances();
				traceGeo.verticesNeedUpdate = true;
			}
		}
	};
	
	PhysWrapperTrace.prototype.setUpdateVector = function setUpdateVector(x, y, z) {
		this._updateVector.set(x, y, z);
	};
	
	PhysWrapperTrace.prototype.startTracingLines = function StartTracingLines (t) {
	
		var interval = t || 100;
	
		var o = this;
	
		window.setInterval(function() {
			o.updateTrace();
		}, interval);
	
	};
	
	return PhysWrapperTrace;
	
})();