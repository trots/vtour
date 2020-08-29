const Scene = require("./Scene.js");

class CylindricalScene extends Scene {
    constructor() {
        super();

        this._controls.maxPolarAngle = Math.PI/2;
        this._controls.minPolarAngle = Math.PI/2;
        this._controls.rotateSpeed = -0.3;

        this._data = NaN;
        this._cylinderRadius = 0;
    }

    _onTextureLoaded(texture) {
        this._cylinderRadius = texture.image.width / (2 * Math.PI);
        const cylinderHeight = texture.image.height;

        this._camera.fov = Math.atan((cylinderHeight / 2) / this._cylinderRadius) * 180 / Math.PI * 2;
        this._camera.near = 1;
        this._camera.far = this._cylinderRadius + 10;
        this._camera.updateProjectionMatrix();
        this._camera.position.set( 0, 0, 10 );
        this._camera.lookAt(0, 0, 0);
        
        const geometry = new THREE.CylinderGeometry(this._cylinderRadius, this._cylinderRadius, cylinderHeight, 40);
        const material = new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide});
        const cylinder = new THREE.Mesh( geometry, material );
        this._scene.add( cylinder );

        this._createTransitionPortals();
        this.render();
    }
}

module.exports = CylindricalScene;
