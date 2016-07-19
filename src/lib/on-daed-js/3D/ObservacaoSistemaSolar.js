ON_DAED["3D"].ObservacaoSistemaSolar = function (scene) {
    var grupoSistemaSolar = new THREE.Object3D();
    
    scene.add(grupoSistemaSolar);

    ON_DAED["3D"].ativarFlaresSol();

    var sol = ON_DAED["3D"].criarSol(grupoSistemaSolar);
    
    sol.scale.multiplyScalar(0.5);
    
    var velocidadeRotacao = 0;
    
    var o = {};
    
    o.getObject = function() {
        return grupoSistemaSolar;
    };
    
    o.efetuarRotacao = function () {
        grupoSistemaSolar.rotation.y += velocidadeRotacao;
        sol.rotation.y = -grupoSistemaSolar.rotation.y;
        return grupoSistemaSolar.rotation.y;
    };
    
    o.setVelocidadeRotacao = function (n) {
        velocidadeRotacao = n;
    };
    
    return o;
};