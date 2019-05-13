const socket = io().connect()
const audio = document.getElementById("audio")
const img = document.getElementById("img")

socket.on('connect', () => {
    
})

socket.on('warning', () => {
    audio.play()
})

socket.on('streamer-data', (data) => {
    img.src = data.dataURL
})