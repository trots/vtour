const SceneObjectStateEnum = require("./SceneObjectStateEnum.js");
const SceneObjectEnum = require("./SceneObjectEnum.js");
const WaiterWidget = require("./WaiterWidget.js");
const PhotoWidget = require("./PhotoWidget.js");

class Scene {
    constructor() {
        this._zoomMin = 1.0;
        this._zoomMax = 3.0;
        this._zoomSpeed = 0.02;
        this._sceneRadius = 0;

        this._textureLoader = new THREE.TextureLoader();
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera();

        this._renderer = new THREE.WebGLRenderer();
        document.body.appendChild( this._renderer.domElement );

        this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement);
        this._controls.enableZoom = false;

        this._raycaster = new THREE.Raycaster(); 
        this._mouse = new THREE.Vector2();

        this._nameLabel = document.createElement("div");
        this._nameLabel.className = "scene-name";
        this._nameLabel.style = "position:absolute; top:5px; left:5px; color:white; font-size:1.5em;\
            background-color:#a6a6a687; padding:5px; border-radius:2px;";
        document.body.appendChild(this._nameLabel);

        this._waiterWidget = new WaiterWidget("Loading...", document.body);
        this._setWaiterVisibility(false);

        this._photoWidget = new PhotoWidget(document.body);
        this._setPhotoVisibility(false);

        this._sceneObjects = new Array();
        this._hoveredSceneObject = NaN;

        this._sceneObjectTextures = {};
        this._sceneObjectTextures[SceneObjectEnum.Portal] = {};
        this._sceneObjectTextures[SceneObjectEnum.Portal][SceneObjectStateEnum.Normal] = "";
        this._sceneObjectTextures[SceneObjectEnum.Portal][SceneObjectStateEnum.Hovered] = "";
        this._sceneObjectTextures[SceneObjectEnum.Photo] = {};
        this._sceneObjectTextures[SceneObjectEnum.Photo][SceneObjectStateEnum.Normal] = "";
        this._sceneObjectTextures[SceneObjectEnum.Photo][SceneObjectStateEnum.Hovered] = "";

        Object.assign( Scene.prototype, THREE.EventDispatcher.prototype );
    }

    setSceneObjectTexture(sceneObjectEnum, sceneObjectState, texture) {
        this._sceneObjectTextures[sceneObjectEnum][sceneObjectState] = texture;
    }

    setZoom(zoomMin, zoomMax, zoomSpeed) {
        this._zoomMin = zoomMin;
        this._zoomMax = zoomMax;
        this._zoomSpeed = zoomSpeed;
    }

    setLang(lang) {
        switch (lang) {
            case "ru":
                this._waiterWidget.setText("Загрузка...");
                break;

            default:
                this._waiterWidget.setText("Loading...");
                break;
        }
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

    mouseMove(event) {
        if (this._photoWidget.isVisible()) {
            return;
        }

        let sceneSize = new THREE.Vector2( 0, 0 );
        this._renderer.getSize(sceneSize);

        this._mouse.x = ( event.clientX / sceneSize.width ) * 2 - 1; 
        this._mouse.y = - ( event.clientY / sceneSize.height ) * 2 + 1; 

        this._raycaster.setFromCamera( this._mouse, this._camera );
        const intersectedObjects = this._raycaster.intersectObjects(this._sceneObjects);

        if (intersectedObjects.length > 0) {
            this._setSceneObjectState(intersectedObjects[0].object, SceneObjectStateEnum.Hovered);
        } else if (this._hoveredSceneObject) {
            this._setSceneObjectState(this._hoveredSceneObject, SceneObjectStateEnum.Normal);
        }
    }

    mouseClick(_event) {
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

    mouseWheel(event) {
        event.preventDefault();
        this._camera.zoom += event.deltaY * -this._zoomSpeed;

        if (this._camera.zoom < this._zoomMin) {
            this._camera.zoom = this._zoomMin;
        } else if (this._camera.zoom > this._zoomMax) {
            this._camera.zoom = this._zoomMax;
        }

        this._camera.updateProjectionMatrix();
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
            mesh.userData = {type: SceneObjectEnum.Portal, data: transition};
            this._setSceneObjectState(mesh, SceneObjectStateEnum.Normal);
            this._addSceneObject(mesh, transition.point.angle);
        }

        for (let i = 0; i < this._data.photos.length; i++) {
            const photo = this._data.photos[i];
            let mesh = this._createSceneObjectMesh(0x0000ff, photo.point.height, photo.point.radius);
            mesh.userData = {type: SceneObjectEnum.Photo, data: photo};
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
        document.body.style.cursor = (state == SceneObjectStateEnum.Hovered) ? "pointer" : "auto";
        this._hoveredSceneObject = (state == SceneObjectStateEnum.Hovered) ? mesh : NaN;
        const textureName = this._sceneObjectTextures[mesh.userData.type][state];
        this._textureLoader.load(textureName, (texture) => {
            mesh.material.map = texture;
            mesh.material.color = NaN;
            mesh.material.needsUpdate = true;
        });
    }

    _setWaiterVisibility(visible) {
        if (visible) {
            this._waiterWidget.show();
            this._nameLabel.style.visibility = "hidden";
        } else {
            this._waiterWidget.hide();
            this._nameLabel.style.visibility = "visible";
        }
    }

    _setPhotoVisibility(visible) {
        if (visible) {
            this._photoWidget.show();
            this._nameLabel.style.visibility = "hidden";
        } else {
            this._photoWidget.hide();
            this._nameLabel.style.visibility = "visible";
        }
    }

    _clear() {
        while(this._scene.children.length > 0){
            this._scene.remove(this._scene.children[0]);
        }

        this._camera.zoom = 1.0;
        this._cylinder = NaN;
        this._data = NaN;
        this._sceneRadius = 0;
    }
}

module.exports = Scene;
