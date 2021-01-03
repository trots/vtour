const Defines = require("./Defines.js");
const I18n = require("./I18n.js");
const SceneObjectStateEnum = require("./SceneObjectStateEnum.js");
const SceneObjectEnum = require("./SceneObjectEnum.js");
const WaiterWidget = require("./WaiterWidget.js");
const PhotoWidget = require("./PhotoWidget.js");
const FullscreenButton = require("./FullscreenButton.js")

class Scene {
    constructor(parentElement) {
        this._parentElement = parentElement;
        this._assetsPath = "";
        this._zoomMin = 1.0;
        this._zoomMax = 3.0;
        this._zoomSpeed = 0.02;
        this._sceneRadius = 0;

        this._textureLoader = new THREE.TextureLoader();
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera();
        this._camera_init_position = this._camera.position.clone();
        this._camera_init_up = this._camera.up.clone();
        this._camera_init_zoom = this._camera.zoom;

        this._renderer = new THREE.WebGLRenderer();
        this._parentElement.appendChild( this._renderer.domElement );

        this._controls = new THREE.OrbitControls(this._camera, this._parentElement);
        this._controls.enableZoom = false;
        this._controls.enablePan = false;
        this._controls.enableKeys = false;

        this._raycaster = new THREE.Raycaster(); 

        this._nameLabel = document.createElement("div");
        this._nameLabel.title = I18n.Dict.SceneTooltip;
        this._nameLabel.className = "vt-scene-name-label";
        this._parentElement.appendChild(this._nameLabel);

        this._versionLabel = document.createElement("div");
        this._versionLabel.title = I18n.Dict.VersionLabelTooltip;
        this._versionLabel.className = "vt-version-label";
        this._versionLabel.innerHTML = "vtour " + Defines.VersionMajor + "." + Defines.VersionMinor 
                                       + "." + Defines.VersionPatch;
        this._parentElement.appendChild(this._versionLabel);

        this._fullscreenButton = new FullscreenButton(this._parentElement);

        this._waiterWidget = new WaiterWidget(I18n.Dict.Loading, this._parentElement);
        this._setWaiterVisibility(false);

        this._photoWidget = new PhotoWidget(this._parentElement);
        this._setPhotoVisibility(false);

        this._sceneObjects = new Array();
        this._hoveredSceneObject = NaN;

        Object.assign( Scene.prototype, THREE.EventDispatcher.prototype );
    }

    setAssetsPath(assetsPath) {
        this._assetsPath = assetsPath;
    }

    setZoom(zoomMin, zoomMax, zoomSpeed) {
        this._zoomMin = zoomMin;
        this._zoomMax = zoomMax;
        this._zoomSpeed = zoomSpeed;
    }

    init(data) {
        this._clear();
        this._data = data;

        this._textureLoader.load(this._data.image, 
            (texture) => {this._onTextureLoaded(texture);},
            undefined,
            (err) => {this._onTextureLoadError(err);});

        this._nameLabel.innerHTML = this._data.title;
        this._setWaiterVisibility(true);
    }

    resize(width, height) {
        this._renderer.setSize( width, height );
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
    }

    render() {
        requestAnimationFrame( () => {this.render();} );
        this._controls.update();
        this._renderer.render( this._scene, this._camera );
    }

    hover(x, y) {
        if (this._photoWidget.isVisible()) {
            return;
        }

        this._hoverObject(x, y);
    }

    click(x, y) {
        this._hoverObject(x, y);

        if (!this._hoveredSceneObject) {
            if (this._photoWidget.isVisible()) {
                this._setPhotoVisibility(false);
            }
            return;
        }

        switch (this._hoveredSceneObject.userData.type) {
            case SceneObjectEnum.Portal:
                const uid = this._hoveredSceneObject.userData.data.toUid;
                this.dispatchEvent( { type: "portalclicked", uid: uid } );
                break;

            case SceneObjectEnum.Photo:
                const photoPath = this._hoveredSceneObject.userData.data.image;
                this._photoWidget.setPhoto(photoPath);
                this._setPhotoVisibility(true);
                this._setSceneObjectState(this._hoveredSceneObject, SceneObjectStateEnum.Normal);
                break;

            default:
                break;
        }
    }

    zoom(delta) {
        this._camera.zoom += delta * this._zoomSpeed;

        if (this._camera.zoom < this._zoomMin) {
            this._camera.zoom = this._zoomMin;
        } else if (this._camera.zoom > this._zoomMax) {
            this._camera.zoom = this._zoomMax;
        }

        this._camera.updateProjectionMatrix();
    }

    rotateX(angle) {
        const xAxis = new THREE.Vector3(1, 0, 0);
        let quaternion = new THREE.Quaternion;
        quaternion.setFromAxisAngle(xAxis, angle)
        this._camera.position.applyQuaternion(quaternion);
        this._camera.up.applyQuaternion(quaternion);
    }

    rotateY(angle) {
        const yAxis = new THREE.Vector3(0, 1, 0);
        let quaternion = new THREE.Quaternion;
        quaternion.setFromAxisAngle(yAxis, angle);
        this._camera.position.applyQuaternion(quaternion);
        this._camera.up.applyQuaternion(quaternion);
    }

    rotateZ(angle) {
        const zAxis = new THREE.Vector3(0, 0, 1);
        var quaternion = new THREE.Quaternion;
        this._camera.up.applyQuaternion(quaternion.setFromAxisAngle(zAxis, angle));
    }

    _hoverObject(x, y) {
        const sceneSize = new THREE.Vector2( 0, 0 );
        this._renderer.getSize(sceneSize);

        let cursor = new THREE.Vector2();
        cursor.x = ( x / sceneSize.width ) * 2 - 1; 
        cursor.y = - ( y / sceneSize.height ) * 2 + 1; 

        this._raycaster.setFromCamera( cursor, this._camera );
        const intersectedObjects = this._raycaster.intersectObjects(this._sceneObjects);

        if (intersectedObjects.length > 0) {
            this._setSceneObjectState(intersectedObjects[0].object, SceneObjectStateEnum.Hovered);
        } else if (this._hoveredSceneObject) {
            this._setSceneObjectState(this._hoveredSceneObject, SceneObjectStateEnum.Normal);
        }
    }

    _onTextureLoaded(_texture) {
        this._setWaiterVisibility(false);
    }

    _onTextureLoadError(err) {
        console.log(err);
        this._setWaiterVisibility(false);
    }

    _createSceneObjects() {
        this._sceneObjects = [];

        for (let i = 0; i < this._data.transitions.length; i++) {
            const transition = this._data.transitions[i];
            let mesh = this._createSceneObjectMesh(0xff0000, transition.point.height, transition.point.radius);
            mesh.userData = {type: SceneObjectEnum.Portal, data: transition, tooltip: I18n.Dict.PortalTooltip};

            this._textureLoader.load(this._getAssetFilePath("portal.png"), (texture) => {
                mesh.material.map = texture;
                mesh.material.color = NaN;
                mesh.material.needsUpdate = true;
            });

            this._setSceneObjectState(mesh, SceneObjectStateEnum.Normal);
            this._addSceneObject(mesh, transition.point.angle);
        }

        for (let i = 0; i < this._data.photos.length; i++) {
            const photo = this._data.photos[i];
            let mesh = this._createSceneObjectMesh(0x0000ff, photo.point.height, photo.point.radius);
            mesh.userData = {type: SceneObjectEnum.Photo, data: photo, tooltip: I18n.Dict.PhotospotTooltip};

            this._textureLoader.load(this._getAssetFilePath("photospot.png"), (texture) => {
                mesh.material.map = texture;
                mesh.material.color = NaN;
                mesh.material.needsUpdate = true;
            });

            this._setSceneObjectState(mesh, SceneObjectStateEnum.Normal);
            this._addSceneObject(mesh, photo.point.angle);
        }
    }

    _createSceneObjectMesh(color, spotHeight, spotRadius) {
        const geometry = new THREE.PlaneGeometry(32, 32);
        const material = new THREE.MeshBasicMaterial(
            { color: color, transparent: true, side: THREE.DoubleSide }
        );

        let mesh = new THREE.Mesh( geometry, material);
        mesh.position.set(0, spotHeight, -this._sceneRadius * spotRadius);
        return mesh;
    }

    _addSceneObject(mesh, angle) {
        let pivot = new THREE.Group();
        this._scene.add( pivot );
        pivot.add( mesh );
        pivot.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle);
        this._sceneObjects.push(mesh);
    }

    _setSceneObjectState(mesh, state) {
        this._parentElement.style.cursor = (state == SceneObjectStateEnum.Hovered) ? "pointer" : "auto";
        this._parentElement.title = (state == SceneObjectStateEnum.Hovered) ? mesh.userData.tooltip : ""; 
        this._hoveredSceneObject = (state == SceneObjectStateEnum.Hovered) ? mesh : NaN;
    }

    _setWaiterVisibility(visible) {
        if (visible) {
            this._waiterWidget.show();
            this._nameLabel.style.visibility = "hidden";
            this._versionLabel.style.visibility = "hidden";
            this._fullscreenButton.hide();
        } else {
            this._waiterWidget.hide();
            this._nameLabel.style.visibility = "visible";
            this._versionLabel.style.visibility = "visible";
            this._fullscreenButton.show();
        }
    }

    _setPhotoVisibility(visible) {
        if (visible) {
            this._photoWidget.show();
            this._nameLabel.style.visibility = "hidden";
            this._versionLabel.style.visibility = "hidden";
            this._fullscreenButton.hide();
        } else {
            this._photoWidget.hide();
            this._nameLabel.style.visibility = "visible";
            this._versionLabel.style.visibility = "visible";
            this._fullscreenButton.show();
        }
    }

    _clear() {
        while(this._scene.children.length > 0){
            this._scene.remove(this._scene.children[0]);
        }

        this._camera.position.copy(this._camera_init_position);
        this._camera.up.copy(this._camera_init_up);
        this._camera.zoom = this._camera_init_zoom;
        this._camera.updateProjectionMatrix();
        this._cylinder = NaN;
        this._data = NaN;
        this._sceneRadius = 0;
    }

    _getAssetFilePath(fileName) {
        return this._assetsPath ? (this._assetsPath + "/" + fileName) : fileName;
    }

    _getCameraXAxis() {
        let cameraVec = new THREE.Vector3( 0, 0, - 1 );
        cameraVec.applyQuaternion( this._camera.quaternion );
        const yAxis = new THREE.Vector3( 0, 1, 0 );
        cameraVec.applyAxisAngle(yAxis, -Math.PI/2);
        cameraVec.normalize();
        return cameraVec;
    }
}

module.exports = Scene;
