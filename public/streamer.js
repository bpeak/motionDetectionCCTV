const socket = io().connect()

var audio = new Audio('warning.mp3');
// console.log(audio.play())/

const cc = document.getElementById("audio")
var playPromise = cc.play();

if (playPromise !== undefined) {
  playPromise.then(_ => {
    // Automatic playback started!
    // Show playing UI.
  })
  .catch(error => {
    // Auto-play was prevented
    // Show paused UI.
  });
}

// var foo = new Sound("/public/warning.mp3", 100, true);
// const a = new Audio("/public/warning.mp3")
// a.addEventListener("click", () => {
//     a.play()
// })
//.play()

const canvas = document.createElement("canvas")
canvas.width = 426
canvas.height = 240
const ctx = canvas.getContext("2d")
const video = document.getElementById("video")

let videoLoaded = false

navigator.mediaDevices.getUserMedia({video: {width: 426, height: 240}}).then((stream) => {
    video.srcObject = stream
    videoLoaded = true
})

socket.on('warning', () => {
    console.log("waring 이래")
    cc.play()
})

socket.on('connect', () => {
    console.log("connected success to server")
    setInterval(() => {
        // console.log("보냄")
        if(videoLoaded === true){
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            socket.emit("streamer", {
                dataURL : canvas.toDataURL('image/jpeg')
            })
        }
    }, 100)
    // setTimeout(() => {
    //     console.log("보냄")
    //     if(videoLoaded === true){
    //         ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    //         socket.emit("streamer", {
    //             dataURL : canvas.toDataURL('image/jpeg')
    //         })
    //     }
    // }, 4000)
})