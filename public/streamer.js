const socket = io().connect()
const video = document.getElementById("video")
const audio = document.getElementById("audio")
const canvas = document.createElement("canvas")
canvas.width = 426
canvas.height = 240
const ctx = canvas.getContext("2d")

let videoLoaded = false

navigator.mediaDevices.getUserMedia({video: {width: 426, height: 240}}).then((stream) => {
    video.srcObject = stream
    videoLoaded = true
})

// socket.on('warning', () => {
//     audio.play()
// })
const ms = 1000 / 60

socket.on('connect', () => {
    console.log("connected success to server")
    setInterval(() => {
        if(videoLoaded === true){
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            socket.emit("streamer", {
                dataURL : canvas.toDataURL('image/jpeg')
            })
        }
    }, 100)
})