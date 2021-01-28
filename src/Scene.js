const Defines = require("./Defines.js");
const I18n = require("./I18n.js");
const SceneObjectStateEnum = require("./SceneObjectStateEnum.js");
const SceneObjectEnum = require("./SceneObjectEnum.js");
const WaiterWidget = require("./WaiterWidget.js");
const PhotoWidget = require("./PhotoWidget.js");
const Button = require("./Button.js");
const FullscreenButton = require("./FullscreenButton.js")
let TourData = require("./TourData.js");

/**
 * @classdesc
 * The base panorama scene class
 */
class Scene {
    /**
     * @constructor
     * @param {HTMLElement} [parentElement] - An HTML container for the scene
     */
    constructor(parentElement) {
        /**
         * The host HTML container of the scene
         * 
         * @type {HTMLElement}
         * @protected
         */
        this._parentElement = parentElement;

        /**
         * The scene domain radius
         * 
         * @type {number}
         * @default 0
         * @protected
         */
        this._sceneRadius = 0;

        /**
         * The scene UID
         * 
         * @type {string}
         * @default ""
         * @protected
         */
        this._uid = "";

        /**
         * The textures loader object
         * 
         * @type {THREE.TextureLoader}
         * @protected
         */
        this._textureLoader = new THREE.TextureLoader();

        /**
         * The Three.js scene object
         * 
         * @type {THREE.Scene}
         * @protected
         */
        this._scene = new THREE.Scene();

        /**
         * The camera object
         * 
         * @type {THREE.PerspectiveCamera}
         * @protected
         */
        this._camera = new THREE.PerspectiveCamera();

        /**
         * The camera initial position point
         * 
         * @type {THREE.Vector3}
         * @protected
         */
        this._camera_init_position = this._camera.position.clone();

        /**
         * The camera initial up point
         * 
         * @type {THREE.Vector3}
         * @protected
         */
        this._camera_init_up = this._camera.up.clone();

        /**
         * The camera initial zoom value
         * 
         * @type {number}
         * @protected
         */
        this._camera_init_zoom = this._camera.zoom;

        /**
         * The Three.js renderer object
         * 
         * @type {THREE.WebGLRenderer}
         * @protected
         */
        this._renderer = new THREE.WebGLRenderer();
        this._parentElement.appendChild( this._renderer.domElement );

        /**
         * The scene moving controller
         * 
         * @type {THREE.OrbitControls}
         * @protected
         */
        this._controls = new THREE.OrbitControls(this._camera, this._parentElement);
        this._controls.enableZoom = false;
        this._controls.enablePan = false;
        this._controls.enableKeys = false;

        /**
         * The raycaster
         * 
         * @type {THREE.Raycaster}
         * @protected
         */
        this._raycaster = new THREE.Raycaster();

        /**
         * The button to exit from the tour
         * 
         * @type {Button}
         * @protected
         */
        this._exitButton = NaN;

        if (TourData.getExitUrl()) {
            this._exitButton = new Button(this._parentElement);
            this._exitButton.setToolTip(I18n.Dict.ExitTooltip);
            this._exitButton.addClassName("vt-exit-button");
            this._exitButton.addClickEventListener(() => {this.dispatchEvent( { type: "exit" } );});
        }

        /**
         * The widget to show additional pictures
         * 
         * @type {PhotoWidget}
         * @protected
         */
        this._photoWidget = new PhotoWidget(this._parentElement);

        /**
         * The label to show the scene title
         * 
         * @type {HTMLElement}
         * @protected
         */
        this._nameLabel = document.createElement("div");
        this._nameLabel.title = I18n.Dict.SceneTooltip;
        this._nameLabel.className = "vt-scene-name-label";
        this._parentElement.appendChild(this._nameLabel);

        /**
         * The label to show the vtour library version
         * 
         * @type {HTMLElement}
         * @protected
         */
        this._versionLabel = document.createElement("div");
        this._versionLabel.title = I18n.Dict.VersionLabelTooltip;
        this._versionLabel.className = "vt-version-label";
        this._versionLabel.innerHTML = "vtour " + Defines.VersionMajor + "." + Defines.VersionMinor 
                                       + "." + Defines.VersionPatch;
        this._parentElement.appendChild(this._versionLabel);

        /**
         * The button to switch fullscreen mode
         * 
         * @type {FullscreenButton}
         * @protected
         */
        this._fullscreenButton = new FullscreenButton(this._parentElement);

        /**
         * The waiter widget. Shows "Loading..." text
         * 
         * @type {WaiterWidget}
         * @protected
         */
        this._waiterWidget = new WaiterWidget(I18n.Dict.Loading, this._parentElement);
        this._setWaiterVisibility(false);

        /**
         * The scene objects array (meshes)
         * 
         * @type {Array}
         * @protected
         */
        this._sceneObjects = new Array();

        /**
         * The hovered scene object mesh
         * 
         * @type {THREE.Mesh}
         * @protected
         */
        this._hoveredSceneObject = NaN;
        this.setPhotoVisibility(false, -1);

        Object.assign( Scene.prototype, THREE.EventDispatcher.prototype );
    }

    /**
     * Initializes the scene with the specified scene UID. The UID should be correspond with the tour configuration
     * @param {string} [uid] - The UID string
     */
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

    /**
     * Resize the scene. Called automatically on browser window resize
     * @param {number} width - The view width
     * @param {number} height - The view height
     */
    resize(width, height) {
        this._renderer.setSize( width, height );
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
    }

    /**
     * Renders the scene
     */
    render() {
        requestAnimationFrame( () => {this.render();} );
        this._controls.update();
        this._renderer.render( this._scene, this._camera );
    }

    /**
     * Hovers a scene object at the specific point
     * 
     * @param {number} x - The X coordinate
     * @param {number} y - The Y coordinate
     */
    hover(x, y) {
        if (!this._controls.enabled) {
            return;
        }

        this._hoverObject(x, y);
    }

    /**
     * Activates a scene object at the specific point
     * 
     * @param {number} x - The X coordinate
     * @param {number} y - The Y coordinate
     * @fires "portalclicked" event
     */
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

    /**
     * Scales the scene
     * 
     * @param {number} delta - The zoom value. Positive to zoom in and negative to zoom out
     * @returns {boolean} `true` if the scene is zoomed
     */
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

    /**
     * Rotates the scene around the X axis
     * 
     * @param {number} angle The rotation angle in radians
     * @returns {boolean} `true` if the scene is rotated
     */
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

    /**
     * Rotates the scene around the Y axis
     * 
     * @param {number} angle The rotation angle in radians
     * @returns {boolean} `true` if the scene is rotated
     */
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

    /**
     * Rotates the scene around the Z axis
     * 
     * @param {number} angle The rotation angle in radians
     * @returns {boolean} `true` if the scene is rotated
     */
    rotateZ(angle) {
        if (!this._controls.enabled) {
            return false;
        }

        const zAxis = new THREE.Vector3(0, 0, 1);
        let quaternion = new THREE.Quaternion;
        this._camera.up.applyQuaternion(quaternion.setFromAxisAngle(zAxis, angle));
        return true;
    }

    /**
     * Returns the visibility state of the additional picture widget
     * @returns {boolean} `true` if the widget is visible
     */
    isPhotoVisible() {
        return this._photoWidget.isVisible();
    }

    /**
     * Shows/hides the additional picture widget with the specified image
     * 
     * @param {boolean} visible - Set `true` to show the widget and `false` otherwise
     * @param {number} photoIndex - The index of the picture image in the scene configuration object
     */
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

    /**
     * Hovers an object on the scene by view coordinates
     * 
     * @param {number} x - The X coordinate
     * @param {number} y - The Y coordinate
     * @protected
     */
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

    /**
     * Calls automaticaly when the requested scene image is loaded
     * 
     * @param {THREE.Texture} _texture - The loaded texture object
     * @protected
     */
    _onTextureLoaded(_texture) {
        this._setWaiterVisibility(false);
    }

    /**
     * Calls automaticaly when the requested scene image is not loaded
     * 
     * @param {object} err - The error object
     * @protected
     */
    _onTextureLoadError(err) {
        console.log(err);
        this._setWaiterVisibility(false);
    }

    /**
     * Creates the all scene objects (transitions and photospots)
     * 
     * @protected
     */
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

    /**
     * Creates the mesh for the scene object
     * 
     * @param {number} color - The hex value of the mesh material color
     * @param {number} spotHeight - The height of the mesh position
     * @param {number} spotRadius - The radius of the mesh position
     * @protected
     */
    _createSceneObjectMesh(color, spotHeight, spotRadius) {
        const geometry = new THREE.PlaneGeometry(32, 32);
        const material = new THREE.MeshBasicMaterial(
            { color: color, transparent: true, side: THREE.DoubleSide }
        );

        let mesh = new THREE.Mesh( geometry, material);
        mesh.position.set(0, spotHeight, -this._sceneRadius * spotRadius);
        return mesh;
    }

    /**
     * Adds an object to the scene
     * 
     * @param {THREE.Mesh} mesh - The mesh object
     * @param {number} angle - The angle of the mesh position
     * @protected
     */
    _addSceneObject(mesh, angle) {
        let pivot = new THREE.Group();
        this._scene.add( pivot );
        pivot.add( mesh );
        pivot.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle);
        this._sceneObjects.push(mesh);
    }

    /**
     * Sets the specified state to the scene object
     * 
     * @param {THREE.Mesh} mesh - The mesh object
     * @param {SceneObjectStateEnum} state - The new state of the object
     * @protected
     */
    _setSceneObjectState(mesh, state) {
        this._parentElement.style.cursor = (state == SceneObjectStateEnum.Hovered) ? "pointer" : "auto";
        this._parentElement.title = (state == SceneObjectStateEnum.Hovered) ? mesh.userData.tooltip : ""; 
        this._hoveredSceneObject = (state == SceneObjectStateEnum.Hovered) ? mesh : NaN;
    }

    /**
     * Shows/hides the waiter widget
     * 
     * @param {boolean} visible - Set `true` to show the widget and `false` to hide one
     * @protected
     */
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

    /**
     * Removes the all objects from the scene and set it as empty
     * 
     * @protected
     */
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

    /**
     * Returns the full asset path
     * 
     * @param {string} fileName - The file name of the asset
     * @returns {string} The full path string
     * @protected
     */
    _getAssetFilePath(fileName) {
        const assetsPath = TourData.getAssetsPath();
        return assetsPath ? (assetsPath + "/" + fileName) : fileName;
    }

    /**
     * Returns the X-axis of the camera
     * 
     * @returns {THREE.Vector3} The axis object
     * @protected
     */
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
