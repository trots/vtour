# vtour

## JavaScript Cylindrical Panorama Viewer

The `vtour` is a javascript tool to build and view virtual 3D tours with cylindrical panorams. It is built on top of [three.js](https://github.com/mrdoob/three.js)

Features:
- Create virtual 3D tours with transitions between multiple cylindrical panoramas
- Specify photospots to show additional photos of a panorama image objects

## Usage

Download and unpack the release build

Include `three.min.js`, `OrbitControls.js` and `vtour.min.js`
```
<script src="three.min.js"></script>
<script src="OrbitControls.js"></script>
<script src="vtour.min.js"></script>
```
Start a tour in a script section
```
var tour = VTOUR.start(document.body, {
    entrySceneUid: "scene_0",
    scenes: [{uid: "scene_0", title: "Scene", image: "scene.jpg"}]
});
```
The `VTOUR.start()` method arguments:

1. `document.body` - the HTML element where the panorama will be created
1. `{...}` - the tour configuration JSON

## Build

1. Install Node.js package to provide `npm` command
1. Go to `vtour` project dir and install dependencies:
    ```
    > npm install
    ```
1. Run build:
    ```
    > npm build-release
    ```

1. Check built files in a `dist` directory

## Examples

Look at `examples` folder to learn the demo tour. The demo tour running steps:

1. Place `vtour` files into a some `foo` directory
1. Copy files from `examples` directory to the `foo` directory:
- `examples/demo.html`
- `examples/demo_image_0.png`
- `examples/demo_image_1.png`
- `examples/picture.png`
1. Run an http server on `foo` directory

    Python example:
    ```
    > cd foo
    > python -m http.server 8000
    ```

1. Open browser and go to `localhost:8000/demo.html`