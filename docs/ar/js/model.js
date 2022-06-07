function loadThree() {
    // renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // document.getElementById('playgroundPgTop').appendChild(renderer.domElement);
    $('#playgroundPgTop').append(renderer.domElement)

    // camera
    const camera = new THREE.PerspectiveCamera(30.0, window.innerWidth / window.innerHeight, 0.1, 20.0);
    camera.position.set(0.0, 1.0, 5.0);

    // camera controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.target.set(0.0, 1.0, 0.0);
    controls.update();

    // scene
    const scene = new THREE.Scene();

    // light
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1.0, 1.0, 1.0).normalize();
    scene.add(light);

    

    // gltf and vrm
    const loader = new THREE.GLTFLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(

        // URL of the VRM you want to load
        './img/KenV.vrm',

        // called when the resource is loaded
        (gltf) => {

            // calling these functions greatly improves the performance
            THREE.VRMUtils.removeUnnecessaryVertices(gltf.scene);
            THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);

            // generate VRM instance from gltf
            THREE.VRM.from(gltf).then((vrm) => {

                console.log(vrm);
                scene.add(vrm.scene);

                vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Hips).rotation.y = Math.PI;
                vrm.springBoneManager.reset();

            });

        },

        // called while loading is progressing
        (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),

        // called when loading has errors
        (error) => console.error(error)

    );

    // helpers
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const geometry = new THREE.CylinderGeometry( 50, 50, 50, 32 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const cylinder = new THREE.Mesh( geometry, material );
    scene.add(cylinder);

    return {
        renderer: renderer,
        camera: camera,
        controls: controls,
        light: light,
        scene: scene
    }
}


// function animate(threeObj) {

//     requestAnimationFrame(animate);

//     renderer.render(scene, camera);

// }

// animate();