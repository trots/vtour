const Defines = require("./Defines.js");
const I18n = require("./I18n.js");
const SceneObjectStateEnum = require("./SceneObjectStateEnum.js");
const SceneObjectEnum = require("./SceneObjectEnum.js");
const WaiterWidget = require("./WaiterWidget.js");
const PhotoWidget = require("./PhotoWidget.js");
const Button = require("./Button.js");
const FullscreenButton = require("./FullscreenButton.js")
let TourData = require("./TourData.js");

class Scene {
    constructor(parentElement) {
        this._parentElement = parentElement;
        this._sceneRadius = 0;
        this._uid = "";

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

        if (TourData.getExitUrl()) {
            this._exitButton = new Button(this._parentElement);
            this._exitButton.setToolTip(I18n.Dict.ExitTooltip);
            this._exitButton.addClassName("vt-exit-button");
            this._exitButton.addClickEventListener(() => {this.dispatchEvent( { type: "exit" } );});
        } else {
            this._exitButton = NaN;
        }

        this._photoWidget = new PhotoWidget(this._parentElement);

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

        this._sceneObjects = new Array();
        this._hoveredSceneObject = NaN;
        this.setPhotoVisibility(false, -1);

        Object.assign( Scene.prototype, THREE.EventDispatcher.prototype );
    }

    init(uid) {
        this._clear();
        this._uid = uid;
        const image = TourData.getSceneImage(uid);

        if (!image) {
            throw new Error("No scene image by uid=" + uid);
        }

        this._textureLoader.load(image, 
            (texture) => {this._onTextureLoaded(texture);},
            undefined,
            (err) => {this._onTextureLoadError(err);});

        this._nameLabel.innerHTML = TourData.getSceneTitle(uid);
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
        if (!this._controls.enabled) {
            return;
        }

        this._hoverObject(x, y);
    }

    click(x, y) {
        if (this._controls.enabled) {
            this._hoverObject(x, y);
        }

        if (!this._hoveredSceneObject) {
            if (this._photoWidget.isVisible()) {
                this.setPhotoVisibility(false, -1);
            }
            return;
        }

        switch (this._hoveredSceneObject.userData.type) {
            case SceneObjectEnum.Portal:
                const uid = TourData.getSceneTransitionUid(this._uid, this._hoveredSceneObject.userData.transitionIndex);
                this.dispatchEvent( { type: "portalclicked", uid: uid } );
                break;

            case SceneObjectEnum.Photo:
                const photoPath = TourData.getScenePhotoPath(this._uid, this._hoveredSceneObject.userData.photoIndex);
                this._photoWidget.setPhoto(photoPath);
                this.setPhotoVisibility(true, this._hoveredSceneObject.userData.photoIndex);
                this._setSceneObjectState(this._hoveredSceneObject, SceneObjectStateEnum.Normal);
                break;

            default:
                break;
        }
    }

    zoom(delta) {
        if (!this._controls.enabled) {
            return false;
        }

        this._camera.zoom += delta * TourData.getZoomSpeed();

        if (this._camera.zoom < TourData.getZoomRangeMin()) {
            this._camera.zoom = TourData.getZoomRangeMin();
        } else if (this._camera.zoom > TourData.getZoomRangeMax()) {
            this._camera.zoom = TourData.getZoomRangeMax();
        }

        this._camera.updateProjectionMatrix();
        return true;
    }

    rotateX(angle) {
        if (!this._controls.enabled) {
            return false;
        }

        const xAxis = new THREE.Vector3(1, 0, 0);
        let quaternion = new THREE.Quaternion;
        quaternion.setFromAxisAngle(xAxis, angle)
        this._camera.position.applyQuaternion(quaternion);
        this._camera.up.applyQuaternion(quaternion);
        return true;
    }

    rotateY(angle) {
        if (!this._controls.enabled) {
            return false;
        }

        const yAxis = new THREE.Vector3(0, 1, 0);
        let quaternion = new THREE.Quaternion;
        quaternion.setFromAxisAngle(yAxis, angle);
        this._camera.position.applyQuaternion(quaternion);
        this._camera.up.applyQuaternion(quaternion);
        return true;
    }

    rotateZ(angle) {
        if (!this._controls.enabled) {
            return false;
        }

        const zAxis = new THREE.Vector3(0, 0, 1);
        let quaternion = new THREE.Quaternion;
        this._camera.up.applyQuaternion(quaternion.setFromAxisAngle(zAxis, angle));
        return true;
    }

    isPhotoVisible() {
        return this._photoWidget.isVisible();
    }

    setPhotoVisibility(visible, photoIndex) {
        if (visible) {
            this._photoWidget.show();
            this._nameLabel.innerHTML = TourData.getScenePhotoTitle(this._uid, photoIndex);
            this._versionLabel.style.visibility = "hidden";
            this._fullscreenButton.hide();
            this._controls.enabled = false;

            if (this._exitButton) {
                this._exitButton.hide();
            }
        } else {
            this._photoWidget.hide();
            this._nameLabel.innerHTML = TourData.getSceneTitle(this._uid);
            this._versionLabel.style.visibility = "visible";
            this._fullscreenButton.show();
            this._controls.enabled = true;

            if (this._exitButton) {
                this._exitButton.show();
            }
        }
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

        for (let i = 0; i < TourData.getSceneTransitionsCount(this._uid); i++) {
            let mesh = this._createSceneObjectMesh(0xff0000, TourData.getSceneTransitionHeight(this._uid, i),
                                                   TourData.getSceneTransitionRadius(this._uid, i));
            mesh.userData = {type: SceneObjectEnum.Portal, transitionIndex: i, tooltip: I18n.Dict.PortalTooltip};

            if (TourData.isInformativeDestinationTooltipsEnabled()) {
                const destSceneUid = TourData.getSceneTransitionUid(this._uid, i);
                mesh.userData.tooltip = TourData.getSceneTitle(destSceneUid);
            }

            this._textureLoader.load(this._getAssetFilePath("portal.png"), (texture) => {
                mesh.material.map = texture;
                mesh.material.color = NaN;
                mesh.material.needsUpdate = true;
            });

            this._setSceneObjectState(mesh, SceneObjectStateEnum.Normal);
            this._addSceneObject(mesh, TourData.getSceneTransitionAngle(this._uid, i));
        }

        for (let i = 0; i < TourData.getScenePhotosCount(this._uid); i++) {
            let mesh = this._createSceneObjectMesh(0x0000ff, TourData.getScenePhotoHeight(this._uid, i), 
                                                   TourData.getScenePhotoRadius(this._uid, i));
            mesh.userData = {type: SceneObjectEnum.Photo, photoIndex: i, tooltip: I18n.Dict.PhotospotTooltip};

            if (TourData.isInformativeDestinationTooltipsEnabled()) {
                mesh.userData.tooltip = TourData.getScenePhotoTitle(this._uid, i);
            }

            this._textureLoader.load(this._getAssetFilePath("photospot.png"), (texture) => {
                mesh.material.map = texture;
                mesh.material.color = NaN;
                mesh.material.needsUpdate = true;
            });

            this._setSceneObjectState(mesh, SceneObjectStateEnum.Normal);
            this._addSceneObject(mesh, TourData.getScenePhotoAngle(this._uid, i));
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

            if (this._exitButton) {
                this._exitButton.hide();
            }
        } else {
            this._waiterWidget.hide();
            this._nameLabel.style.visibility = "visible";
            this._versionLabel.style.visibility = "visible";
            this._fullscreenButton.show();
            
            if (this._exitButton) {
                this._exitButton.show();
            }
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
        this._uid = "";
        this._sceneRadius = 0;
    }

    _getAssetFilePath(fileName) {
        const assetsPath = TourData.getAssetsPath();
        return assetsPath ? (assetsPath + "/" + fileName) : fileName;
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
