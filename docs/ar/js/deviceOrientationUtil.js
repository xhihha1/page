if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function (event) {
        const alpha = event.alpha * Math.PI / 180;
        const beta = event.beta * Math.PI / 180;
        const gamma = event.gamma * Math.PI / 180;
        console.log(alpha, beta, gamma)
        if(threeObj){
            const x=0+5 * Math.sin(beta)* Math.cos(gamma)
            const y=0+5 * Math.sin(beta) * Math.sin(gamma)
            const z=0+5 * Math.cos(beta)
            threeObj.camera.position.set(0.0, 1.0, 5.0);
        }
    }, false);
} else {
    console.log('你的瀏覽器不支援喔');
}