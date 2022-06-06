let globalCanvas
let globalVideo
let startStream = false
let constraints = {
    audio: false,
    // video: {
    //     facingMode: "user"
    //     // facingMode: { exact: "environment" }
    // }
    video: true
};

const createVideo = (id, width, height) => {
    let video
    if (document.getElementById(id)) {
        video = document.getElementById(id);
    } else {
        video = document.createElement("video");
        video.id = id;
        video.autoplay = true;
        video.controls = false;
        video.playsinline = true;
        video.WebKitPlaysInline = true;
    }
    video.width = width;
    video.height = height;

    return video;
};
const createCanvas = (id, width, height) => {
    let canvas
    if (document.getElementById(id)) {
        canvas = document.getElementById(id);
    } else {
        canvas = document.createElement("canvas");
        canvas.id = id;
    }
    canvas.width = width;
    canvas.height = height;
    return canvas;
};
const getFrameFromVideo = (video, canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    // ctx.translate(video.videoWidth, 0);
    // ctx.scale(-1, 1);
    const wRate = canvas.width / video.videoWidth
    const hRate = canvas.height / video.videoHeight
    const minRate = Math.min(wRate, hRate)
    // console.log('minRate', minRate, video.videoWidth, video.videoHeight, video.width, video.height, canvas.width, canvas.height)
    ctx.drawImage(video, 0, 0, video.videoWidth * minRate, video.videoHeight * minRate);
    if (processor.video) {
        if (!processor.video.paused && !processor.video.ended) {
            processor.computeFrameCtx(canvas, ctx)
        }
    }
    ctx.restore();
    document.getElementById('v1').src = canvas.toDataURL()
    if (ar1 && ar1.process) {
        // console.log('*')
        // ar1.process(document.getElementById('v1'));
        ar1.process(document.getElementById('vid'));

    }



    requestAnimationFrame(() => getFrameFromVideo(video, canvas));
};


document.getElementById('b1').addEventListener('click', function () {
    // getCameraStream(document.getElementById('v1'))
    document.getElementById('vid').play()
    // setTimeout(function(){
    //     document.getElementById('v1').pause()
    //     document.getElementById('v1').webkitExitFullscreen();
    // },2000)
})
document.getElementById('stopz').addEventListener('click', function () {
    document.getElementById('vid').pause()
    document.getElementById('vid').webkitExitFullscreen();
})

var ar1, ar2, ar3, ar4, ar5;

function controlARToolkip() {
    var cameraParam = new ARCameraParam();
    cameraParam.onload = function () {

        ar1 = new ARController(v1, cameraParam);
        // ar1.setPatternDetectionMode(artoolkit.AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX);
        ar1.setPatternDetectionMode(artoolkit.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX);
        // ar1.debugSetup();

        ar1.detectMarker();
        // ar1.debugDraw();


        ar1.addEventListener('markerNum', function (ev) {
            console.log('got markers', markerNum);
        });
        ar1.addEventListener('getMarker', function (ev, idx) {
            // console.log('found marker idx:', arguments);
            console.log('found marker?', ev);
            readImageMarker(ev.data.marker)
        });
        ar1.loadMarker('patt.hiro', function (marker) {
            console.log('loaded marker hiro', marker);
        });
        ar1.loadMarker('patt.kanji', function (markerId) {
            console.log('loaded marker kanji', markerId);
        });
        ar1.loadMarker('patt.yek', function (markerId) {
            console.log('loaded marker yek', markerId);
        });

        console.log("Setter/Getter tests run successfully.");

    };
    cameraParam.load('camera_para.dat');

    function readImageMarker(marker) {
        if (marker.idPatt === -1) {
            if (marker.idMatrix !== -1) {
                console.log('%c number ' + marker.idMatrix, 'color: blue;')
                document.getElementById('t1').style.color = 'blue'
                document.getElementById('chromaVideo').pause()
            } else {
                console.log('%c number ' + marker.idMatrix, 'color: blue;')
            }
        } else {
            console.log('%c pattern ' + marker.idPatt, 'color: red;')
            document.getElementById('t1').style.color = 'red'
            if (document.getElementById('chromaVideo').paused || document.getElementById('chromaVideo').ended) {
                document.getElementById('chromaVideo').play()
            }
        }
    }
}


function deviceList() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
        return;
    }

    // List cameras and microphones.

    navigator.mediaDevices.enumerateDevices()
        .then(function (devices) {
            var min = 12,
                max = 100,
                select = document.getElementById('s1');

            for (var i = min; i <= max; i++) {

            }
            devices.forEach(function (device) {
                // console.log(device.kind + ": " + device.label +
                //     " id = " + device.deviceId);
                // if(device.kind === 'videoinput') {
                var opt = document.createElement('option');
                opt.value = device.deviceId;
                opt.innerHTML = device.kind + ": " + device.label + " id = " + device.deviceId;
                select.appendChild(opt);
                // }
            });
            select.addEventListener('change', function (e) {
                const v = e.target.value
                if (v === 'user') {
                    constraints.video = {
                        facingMode: "user"
                    }
                } else if (v === 'environment') {
                    // constraints.video = { facingMode: { exact: "environment" } } 
                    constraints.video = {
                        facingMode: "environment"
                    }
                } else {
                    constraints.video = {
                        deviceId: v
                    }
                }
                const video = document.getElementById('vid');
                globalMethod.getCameraStream(video);
            })
        })
        .catch(function (err) {
            console.log(err.name + ": " + err.message);
        });
}


// var tick = function () {
//     requestAnimationFrame(tick);
//     if (ar1 && ar1.process) {
//         console.log('*')
//         ar1.process(document.getElementById('v1'));
//     }

// };
// tick();

// const getCameraStream = video => {
//     navigator.mediaDevices
//         .getUserMedia(constraints)
//         .then(function success(stream) {
//             console.log('stream')
//             startStream = true
//             video.srcObject = stream;
//             video.play();
//         }).catch(function (e) {
//             console.log(e)
//         });
// };

const globalMethod = {
    resizeCanvas: function () {
        if (globalCanvas && globalVideo) {
            const wRate = $('#scanPgTop').width() / globalVideo.videoWidth;
            const hRate = $('#scanPgTop').height() / globalVideo.videoHeight;
            const minRate = Math.min(wRate, hRate)
            globalCanvas.width = globalVideo.videoWidth * minRate
            globalCanvas.height = globalVideo.videoHeight * minRate
        }
    },
    getCameraStream: function (video) {
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(function success(stream) {
                console.log('stream')
                startStream = true
                video.srcObject = stream;
                video.play();
            }).catch(function (e) {
                console.log(e)
            });
    }
}
$(document).ready(function () {
    $('.viewPg').hide()
    $('#startPg').show()
    $('#debugPg').show()
    $('#toStartPg').on('click', function () {
        $('.viewPg').hide()
        $('#startPg').show()
        $('#debugPg').show()
    })
    $('#startBtn').on('click', function () {
        if (startStream) {
            $('.viewPg').hide()
            $('#scanPg').show()
            $('#debugPg').show()
            globalMethod.resizeCanvas()
        }
    })
    $('#changeDeviceView').on('click', function () {
        const videoElem = document.getElementById('vid')
        const stream = videoElem.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(function (track) {
            const constraints = track.getConstraints();
            if(constraints.video){
                if(typeof constraints.video === 'boolean' || typeof constraints.video.facingMode === 'undefined') {
                    constraints.video = { facingMode: 'user' }
                }
                if (constraints.video.facingMode === 'user') {
                    constraints.video.facingMode = 'environment'
                } else {
                    constraints.video.facingMode = 'user'
                }
                track.applyConstraints(constraints);
            }
        })
        // tracks.forEach(function (track) {
        //     track.stop();
        // });
        // videoElem.pause()
        // videoElem.srcObject = null;
        // if(constraints.facingMode !== 'environment') {

        // }
    })
    $('#toggleCamera').on('click', function () {
        const videoElem = document.getElementById('vid')
        if (!videoElem.paused && !videoElem.ended) {
            const stream = videoElem.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(function (track) {
                track.stop();
            });
            videoElem.pause()
            videoElem.srcObject = null;
            startStream = false
        } else {
            globalMethod.getCameraStream(videoElem);
        }
    })
    $('#toPlayground').on('click', function () {
        $('.viewPg').hide()
        $('#playgroundPg').show()
        $('#debugPg').show()
    })
    $('#toScan').on('click', function () {
        $('.viewPg').hide()
        $('#scanPg').show()
        $('#debugPg').show()
        setTimeout(function () {
            globalMethod.resizeCanvas()
        }, 1000)
    })
    $('#stopChromaKey').on('click', function () {
        const chromaKeyVideo = document.getElementById('chromaVideo')
        if (!chromaKeyVideo.paused && !chromaKeyVideo.ended) {
            chromaKeyVideo.pause()
            if (chromaKeyVideo.webkitExitFullscreen) {
                chromaKeyVideo.webkitExitFullscreen();
            }
        } else {
            chromaKeyVideo.play()
        }
    })
    $(window).on('resize', function () {
        globalMethod.resizeCanvas()
    })
    init()
})

function init() {
    const video = createVideo("vid", 480, 360);
    const canvas = createCanvas("canvas", 480, 360);
    globalCanvas = canvas
    globalVideo = video
    $(video).on('playing', function(){
        globalMethod.resizeCanvas()
    })
    const app = document.getElementById("app");
    globalMethod.getCameraStream(video);
    getFrameFromVideo(video, canvas);
    app.appendChild(video);
    // app.appendChild(canvas);
    controlARToolkip()
    deviceList()
    processor.doLoad()
};