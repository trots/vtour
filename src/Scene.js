const SceneObjectStateEnum = require("./SceneObjectStateEnum.js");
const WaiterWidget = require("./WaiterWidget.js");

class Scene {
    constructor() {
        this._zoomMin = 1.0;
        this._zoomMax = 3.0;
        this._zoomSpeed = 0.02;

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

        this._portals = new Array();
        this._hoveredPortal = NaN;
        this._portalTexture = {};
        this._portalTexture[SceneObjectStateEnum.Normal] = "";
        this._portalTexture[SceneObjectStateEnum.Hovered] = "";

        Object.assign( Scene.prototype, THREE.EventDispatcher.prototype );
    }

    setPortalTexture(portalNormalTexture, portalHoveredTexture) {
        this._portalTexture[SceneObjectStateEnum.Normal] = portalNormalTexture;
        this._portalTexture[SceneObjectStateEnum.Hovered] = portalHoveredTexture;
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
        let sceneSize = new THREE.Vector2( 0, 0 );
        this._renderer.getSize(sceneSize);

        this._mouse.x = ( event.clientX / sceneSize.width ) * 2 - 1; 
        this._mouse.y = - ( event.clientY / sceneSize.height ) * 2 + 1; 

        this._raycaster.setFromCamera( this._mouse, this._camera );
        const intersectedObjects = this._raycaster.intersectObjects(this._portals);

        if (intersectedObjects.length > 0) {
            this._hoveredPortal = intersectedObjects[0].object;
            this._setPortalState(this._hoveredPortal, SceneObjectStateEnum.Hovered);
        } else if (this._hoveredPortal) {
            this._setPortalState(this._hoveredPortal, SceneObjectStateEnum.Normal);
            this._hoveredPortal = NaN;
        }
    }

    mouseClick(_event) {
        if (!this._hoveredPortal) {
            return;
        }

        this.dispatchEvent( { type: "portalclicked", uid: this._hoveredPortal.userData.uid } );
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

    _createTransitionPortals() {
        this._portals = [];

        for (let i = 0; i < this._data.transitions.length; i++) {
            const transition = this._data.transitions[i];
            const portalGeometry = new THREE.PlaneGeometry(32, 32);
            const portalMaterial = new THREE.MeshBasicMaterial(
                { color: 0xff0000, transparent: true, side: THREE.DoubleSide }
            );

            let portalMesh = new THREE.Mesh( portalGeometry, portalMaterial);
            portalMesh.position.set(0, 0, -this._cylinderRadius * transition.point.radius);
            portalMesh.userData = {uid: transition.toUid};
            this._setPortalState(portalMesh, SceneObjectStateEnum.Normal);

            let pivot = new THREE.Group();
            this._scene.add( pivot );
            pivot.add( portalMesh );
            pivot.rotateOnAxis(new THREE.Vector3(0, 1, 0), transition.point.angle);

            this._portals.push(portalMesh);
        }
    }

    _setPortalState(portalMesh, state) {
        switch(state) {
            case SceneObjectStateEnum.Hovered:
                document.body.style.cursor = "pointer";
                this._textureLoader.load(this._portalTexture[SceneObjectStateEnum.Hovered], 
                                        (texture) => {
                                            portalMesh.material.map = texture;
                                            portalMesh.material.color = NaN;
                                        });
                break;

            default:
                document.body.style.cursor = "auto";
                this._textureLoader.load(this._portalTexture[SceneObjectStateEnum.Normal], 
                                        (texture) => {
                                            portalMesh.material.map = texture;
                                            portalMesh.material.color = NaN;
                                        });
        }
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

    _clear() {
        while(this._scene.children.length > 0){
            this._scene.remove(this._scene.children[0]);
        }

        this._camera.zoom = 1.0;
        this._cylinder = NaN;
        this._data = NaN;
        this._cylinderRadius = 0;
    }
}

module.exports = Scene;
