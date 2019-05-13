const express = require("express")
const app = express()
const http = require('http').Server(app)
const io = require("socket.io")(http)
const path = require("path")
const fs = require("fs")
const PORT = process.env.PORT || 80
const jpeg = require('jpeg-js')

let prevImgBuffer = null
let fsSwitch = false

io.on('connection', function(socket){
    console.log(`conn :  ${socket.id}`)
    socket.on("streamer", (data) => {
        const { dataURL } = data
        const buffer = new Buffer(dataURL.split(",")[1], 'base64')
        if(prevImgBuffer === null){
            prevImgBuffer = buffer
        } else {
            const changeRate = calculateJpgChangeRate({
                jpgBufs : [prevImgBuffer, buffer]
            })
            // console.log(changeRate)
            if(changeRate >= 0.12){
                //motion detected
                if(fsSwitch === false){
                    let fileName = Number(new Date()) + ".jpg"
                    fs.writeFileSync(path.join(__dirname, 'detected', fileName), buffer)
                    fsSwitch = true
                    setTimeout(() => {
                        fsSwitch = false
                    }, 1000)
                }
                io.emit("warning")
            }
            prevImgBuffer = buffer
        }
        io.emit("streamer-data", {
            dataURL
        })
    })
})

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))
app.use("/public", express.static(path.join(__dirname, "public")))
app.get("/streamer", (req, res) => {
    res.render("streamer")
})
app.get("/client", (req, res) => {
    res.render("client")
})

http.listen(PORT, () => {
    console.log(`litening on PORT ${PORT}`)
})

function calculateJpgChangeRate({
    jpgBufs,
}){
    let [jpgBuf1, jpgBuf2] = jpgBufs
    const decodedJpg1 = jpeg.decode(jpgBuf1, true)
    const decodedJpg2 = jpeg.decode(jpgBuf2, true)
    const Uint8ArrayLength = decodedJpg1.data.length
    let count = 0
    for(let i = 0; i < Uint8ArrayLength; i++){
        const sub = Math.abs(decodedJpg1.data[i] - decodedJpg2.data[i])
        if(sub > 5){
            count ++
        }
    }   
    return count / Uint8ArrayLength
}