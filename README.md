# vtour

## JavaScript Cylindrical Panorama Viewer
The `vtour` is a javascript tool to build and view virtual 3D tours with cylindrical panorams. It is built on top of [three.js](https://github.com/mrdoob/three.js).

Features:
- Create virtual 3D tours with transitions between multiple cylindrical panoramas.
- Specify photospots to show additional photos of a panorama image objects.

## Usage

Include `three.min.js`, `OrbitControls.js` and `vtour.min.js`.
```
<script src="three.js"></script>
<script src="OrbitControls.js"></script>
<script src="vtour.js"></script>
```
Start a tour in a script section.
```
var tour = TourFactory.start(document.body, {
    entrySceneUid: "scene_0",
    scenes: [{uid: "scene_0", title: "Scene", image: "scene.jpg"}]
});
```
The `TourFactory.start()` method arguments:

1. `document.body` - the element where the panorama will be created;
1. `{...}` - the tour configuration JSON.

## Build

1. Install Node.js package to provide `npm` command.
1. Go to `vtour` project dir and install dependencies:
    ```
    > npm install
    ```
1. Build `vtour.min.js`:
    ```
    > npm build-release
    ```
