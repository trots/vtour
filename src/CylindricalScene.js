const Scene = require("./Scene.js");

class CylindricalScene extends Scene {
    constructor() {
        super();

        this._controls.maxPolarAngle = Math.PI/2;
        this._controls.minPolarAngle = Math.PI/2;
        this._controls.rotateSpeed = -0.3;

        this._data = NaN;
    }

    mouseWheel(event) {
        super.mouseWheel(event);
        const viewAngleDiff = (this._camera.fov - this._camera.getEffectiveFOV()) * (Math.PI / 180);
        this._controls.maxPolarAngle = Math.PI / 2 + viewAngleDiff / 2;
        this._controls.minPolarAngle = Math.PI / 2 - viewAngleDiff / 2;
    }

    _onTextureLoaded(texture) {
        this._sceneRadius = texture.image.width / (2 * Math.PI);
        const cylinderHeight = texture.image.height;

        this._camera.fov = Math.atan((cylinderHeight / 2) / this._sceneRadius) * 180 / Math.PI * 2;
        this._camera.near = 1;
        this._camera.far = this._sceneRadius + this._sceneRadius * 0.2;
        this._camera.updateProjectionMatrix();
        this._camera.position.set( 0, 0, 10 );
        this._camera.lookAt(0, 0, 0);
        
        const geometry = new THREE.CylinderGeometry(this._sceneRadius, this._sceneRadius, cylinderHeight, 40);
        const material = new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide});
        const cylinder = new THREE.Mesh( geometry, material );
        this._scene.add( cylinder );

        this._createSceneObjects();
        this.render();

        super._onTextureLoaded();
    }

    _clear() {
        super._clear();
        this._controls.maxPolarAngle = Math.PI/2;
        this._controls.minPolarAngle = Math.PI/2;
    }
}

module.exports = CylindricalScene;
