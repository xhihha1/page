let currentVrm = undefined;
let currentMixer = undefined;

function loadThree() {
    // renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // document.getElementById('playgroundPgTop').appendChild(renderer.domElement);
    $('#playgroundPgTop').append(renderer.domElement)

    // camera
    const camera = new THREE.PerspectiveCamera(30.0, window.innerWidth / window.innerHeight, 0.1, 100.0);
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
                // console.log(vrm);
                scene.add(vrm.scene);
                currentVrm = vrm;
                vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Hips).rotation.y = Math.PI;
                vrm.springBoneManager.reset();
                prepareAnimation(vrm);
            });

        },

        // called while loading is progressing
        (progress) => {
            console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%')
            document.getElementById('loadNum').innerHTML = (100.0 * (progress.loaded / progress.total)) + '%';
        },

        // called when loading has errors
        (error) => console.error(error)

    );

    // helpers
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // const geometry = new THREE.CylinderGeometry(5, 5, 10, 32);
    // const material = new THREE.MeshBasicMaterial({
    //     color: 0xffff00,
    //     side: THREE.DoubleSide
    // });
    // const cylinder = new THREE.Mesh(geometry, material);
    // scene.add(cylinder);

    // var canvas = document.getElementById("canvas");
    // var planttexture = new THREE.CanvasTexture(canvas);
    // var planttexture = new THREE.TextureLoader().load( "textures/water.jpg" );
    const video = document.getElementById('vid');
    const planttexture = new THREE.VideoTexture(video);
    var plantgeometry = new THREE.PlaneGeometry(2, 2);
    var plantmaterial = new THREE.MeshBasicMaterial({
        map: planttexture, // 设置纹理贴图
    });
    var plantmesh = new THREE.Mesh(plantgeometry, plantmaterial);
    plantmesh.position.x = 0
    plantmesh.position.y = 1
    plantmesh.position.z = -2
    scene.add(plantmesh);


    return {
        renderer: renderer,
        camera: camera,
        controls: controls,
        light: light,
        scene: scene
    }
}

// animation
function prepareAnimation(vrm) {
    currentMixer = new THREE.AnimationMixer(vrm.scene);
    const quatA = new THREE.Quaternion(0.0, 0.0, 0.0, 1.0);
    const quatB = new THREE.Quaternion(0.0, 0.0, 0.0, 1.0);
    quatB.setFromEuler(new THREE.Euler(0.0, 0.0, 0.25 * Math.PI));
    // const armTrack = new THREE.QuaternionKeyframeTrack(
    //     vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftUpperArm).name + '.quaternion', // name
    //     [0.0, 0.5, 1.0], // times
    //     [...quatA.toArray(), ...quatB.toArray(), ...quatA.toArray()] // values
    // );
    vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftUpperArm).rotation.z = Math.PI / 180 * 85
    vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightUpperArm).rotation.z = Math.PI / 180 * 275
    // const blinkTrack = new THREE.NumberKeyframeTrack(
    //     vrm.blendShapeProxy.getBlendShapeTrackName(THREE.VRMSchema.BlendShapePresetName.Blink), // name
    //     [0.0, 0.5, 1.0], // times
    //     [0.0, 1.0, 0.0] // values
    // );
    // vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Spine).rotation.x = 0.05 - 0.5 * this.waitingValue
    // vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftUpperLeg).rotation.x = vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightUpperLeg).rotation.x = this.waitingValue
    // vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftLowerLeg).rotation.x =
    //     vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightLowerLeg).rotation.x = -2 * this.waitingValue
    // vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftFoot).rotation.x =
    //     vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightFoot).rotation.x = this.waitingValue
    // vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Hips).position.y =
    //     this.basePosition.y +
    //     (vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftLowerLeg).position.y +
    //         vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftFoot).position.y) -
    //     (vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftLowerLeg).position.y * Math.cos(this.waitingValue) +
    //         vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftFoot).position.y * Math.cos(this.waitingValue))
    // const clip = new THREE.AnimationClip('blink', 1.0, [armTrack, blinkTrack]);
    // const clip = new THREE.AnimationClip('blink', 1.0, [blinkTrack]);
    // const action = currentMixer.clipAction(clip);
    // action.play();
}


// function animate(threeObj) {

//     requestAnimationFrame(animate);

//     renderer.render(scene, camera);

// }

// animate();