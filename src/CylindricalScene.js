const Scene = require("./Scene.js");

/**
 * @classdesc
 * Cylindrical panorama scene implementation
 * 
 * @extends Scene
 */
class CylindricalScene extends Scene {
    /**
     * @constructor
     * @param {HTMLElement} [parentElement] - An HTML container for the scene
     */
    constructor(parentElement) {
        super(parentElement);

        this._controls.maxPolarAngle = Math.PI/2;
        this._controls.minPolarAngle = Math.PI/2;
        this._controls.rotateSpeed = -0.3;
    }

    /**
     * Scales the scene
     * 
     * @override
     * @param {number} delta - The zoom value. Positive to zoom in and negative to zoom out
     * @returns {boolean} `true` if the scene is zoomed
     */
    zoom(delta) {
        if (!super.zoom(delta)) {
            return false;
        }

        const viewAngleDiff = (this._camera.fov - this._camera.getEffectiveFOV()) * (Math.PI / 180);
        this._controls.maxPolarAngle = Math.PI / 2 + viewAngleDiff / 2;
        this._controls.minPolarAngle = Math.PI / 2 - viewAngleDiff / 2;
        return true;
    }

    /**
     * Rotates the scene around the X axis
     * 
     * @override
     * @param {number} angle - The rotation angle in radians
     * @returns {boolean} `true` if the scene is rotated
     */
    rotateX(angle) {
        if (!this._controls.enabled) {
            return false;
        }

        const currentAngle = this._controls.getPolarAngle();
        let newAngle = currentAngle + angle;
        newAngle = Math.max( this._controls.minPolarAngle, Math.min( this._controls.maxPolarAngle, newAngle ) );
        const diff = newAngle - currentAngle;

        if (diff == 0) {
            return false;
        }

        const rotationVec = this._getCameraXAxis();
        let quaternion = new THREE.Quaternion;
        quaternion.setFromAxisAngle(rotationVec, diff);
        this._camera.position.applyQuaternion(quaternion);
        this._camera.up.applyQuaternion(quaternion);
        return true;
    }

    /**
     * Calls automaticaly when the requested scene image is loaded
     * 
     * @override
     * @param {THREE.Texture} _texture - The loaded texture object
     * @protected
     */
    _onTextureLoaded(texture) {
        this._sceneRadius = texture.image.width / (2 * Math.PI);
        const cylinderHeight = texture.image.height;
        const cameraOffset = 10;
        const cameraDistanceToScene = this._sceneRadius + cameraOffset;

        this._camera.fov = Math.atan((cylinderHeight / 2) / cameraDistanceToScene) * 180 / Math.PI * 2;
        this._camera.near = 1;
        this._camera.far = this._sceneRadius + this._sceneRadius * 0.2;
        this._camera.updateProjectionMatrix();
        this._camera.position.set( 0, 0, cameraOffset );
        this._camera.lookAt(0, 0, 0);
        
        const geometry = new THREE.CylinderGeometry(this._sceneRadius, this._sceneRadius, cylinderHeight, 40);
        const material = new THREE.MeshBasicMaterial({map: texture, side: THREE.BackSide});
        const cylinder = new THREE.Mesh( geometry, material );
        this._scene.add( cylinder );

        this._createSceneObjects();
        this.render();

        super._onTextureLoaded();
    }

    /**
     * Removes the all objects from the scene and set the scene as empty
     * 
     * @override
     * @protected
     */
    _clear() {
        super._clear();
        this._controls.maxPolarAngle = Math.PI/2;
        this._controls.minPolarAngle = Math.PI/2;
    }
}

module.exports = CylindricalScene;
