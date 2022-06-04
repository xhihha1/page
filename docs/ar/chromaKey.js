var processor = {
  timerCallback: function() {
    if (this.video.paused || this.video.ended) {
      return;
    }
    this.computeFrame();
    let self = this;
    setTimeout(function () {
        self.timerCallback();
      }, 0);
  },

  doLoad: function() {
    this.video = document.getElementById("chromaVideo");
    this.c1 = document.getElementById("c1");
    this.ctx1 = this.c1.getContext("2d");
    this.c2 = document.getElementById("c2");
    this.ctx2 = this.c2.getContext("2d");
    let self = this;
    this.video.addEventListener("play", function() {
        self.width = self.video.videoWidth / 2;
        self.height = self.video.videoHeight / 2;
        self.c1.width = self.width
        self.c1.height = self.height
        self.c2.width = self.width
        self.c2.height = self.height
        // self.timerCallback();
      }, false);
  },

//   computeFrame: function() {
//     this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
//     let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
// 		let l = frame.data.length / 4;

//     for (let i = 0; i < l; i++) {
//       let r = frame.data[i * 4 + 0];
//       let g = frame.data[i * 4 + 1];
//       let b = frame.data[i * 4 + 2];
//       if (g > 170 && r > 170 && b < 160){
//         frame.data[i * 4 + 3] = 0;
//       }
        
//       // 147 158 75
//       // 162 177 85
//       if (r > 110 && r < 175 && g > 120 && g < 200 && b < 100) {
//         frame.data[i * 4 + 3] = 0;
//       }
//       // if (r > 110 && r <= 140 && g > 120 && g <= 140 && b < 100) {
//       //   frame.data[i * 4 + 3] = 0;
//       // }
        
//     }
//     this.ctx2.putImageData(frame, 0, 0);
//     return;
//   },
  computeFrameCtx: function(canvas, ctx) {
    
    const video = document.getElementById("chromaVideo");
    const c1 = document.getElementById("c1");
    if(video.videoWidth < 1 || video.videoHeight < 1) {
        return
    }
    c1.width = video.videoWidth / 2;
    c1.height = video.videoHeight / 2;
    // const cLeft = canvas.width - c1.width
    const cLeft = 0
    const cTop = canvas.height - c1.height
    const ctx1 = c1.getContext("2d");
    
    ctx1.drawImage(video, 0, 0, c1.width, c1.height);
    let frame = ctx1.getImageData(0, 0, c1.width, c1.height);
	let l = frame.data.length / 4;

    let frameCtx = ctx.getImageData(cLeft, cTop, c1.width, c1.height);

    for (let i = 0; i < l; i++) {
      let r = frame.data[i * 4 + 0];
      let g = frame.data[i * 4 + 1];
      let b = frame.data[i * 4 + 2];
      // if (g > 170 && r > 170 && b < 160){
      //   // frame.data[i * 4 + 3] = frameCtx.data[i * 4 + 3];
      //   frame.data[i * 4 + 0] = frameCtx.data[i * 4 + 0];
      //   frame.data[i * 4 + 1] = frameCtx.data[i * 4 + 1];
      //   frame.data[i * 4 + 2] = frameCtx.data[i * 4 + 2];
      //   frame.data[i * 4 + 3] = 255;
      // }
        

      // if (r > 110 && r < 175 && g > 120 && g < 200 && b < 100) {
      //   // frame.data[i * 4 + 3] = frameCtx.data[i * 4 + 3];
      //   frame.data[i * 4 + 0] = frameCtx.data[i * 4 + 0];
      //   frame.data[i * 4 + 1] = frameCtx.data[i * 4 + 1];
      //   frame.data[i * 4 + 2] = frameCtx.data[i * 4 + 2];
      //   frame.data[i * 4 + 3] = 255;
      // }

      if (g > 100 && r > 100 && b < 43) {
        frame.data[i * 4 + 0] = frameCtx.data[i * 4 + 0];
        frame.data[i * 4 + 1] = frameCtx.data[i * 4 + 1];
        frame.data[i * 4 + 2] = frameCtx.data[i * 4 + 2];
        frame.data[i * 4 + 3] = 255;
      }
        
    }
    ctx.putImageData(frame, cLeft, cTop);
    return;
  }
};
