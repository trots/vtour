class Scene {
    constructor() {
        this._textureLoader = new THREE.TextureLoader();
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera();

        this._renderer = new THREE.WebGLRenderer();
        document.body.appendChild( this._renderer.domElement );

        this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement);
        this._raycaster = new THREE.Raycaster(); 
        this._mouse = new THREE.Vector2();
        this._portals = new Array();
        this._hoveredPortal = NaN;
        this._portalTexture = "";

        Object.assign( Scene.prototype, THREE.EventDispatcher.prototype );
    }

    setPortalTexture(portalTexture) {
        this._portalTexture = portalTexture;
    }

    init(data) {
        this._clear();
        this._data = data;

        this._textureLoader.load(this._data.image, 
            (texture) => {this._onTextureLoaded(texture);},
            undefined,
            (err) => {this._onTextureLoadError(err);});
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
            this._hoveredPortal.material.color.set(0xff0000);
        } else if (this._hoveredPortal) {
            this._hoveredPortal.material.color.set(0xffffff);
            this._hoveredPortal = NaN;
        }
    }

    mouseClick(_event) {
        if (!this._hoveredPortal) {
            return;
        }

        this.dispatchEvent( { type: "portalclicked", uid: this._hoveredPortal.userData.uid } );
    }

    _onTextureLoaded(_texture) {
        throw new Error("No implementation of Scene._onTextureLoaded");
    }

    _onTextureLoadError(err) {
        console.log(err);
    }

    _clear() {
        while(this._scene.children.length > 0){
            this._scene.remove(this._scene.children[0]);
        }

        this._cylinder = NaN;
        this._data = NaN;
        this._cylinderRadius = 0;
    }
}

module.exports = Scene;
