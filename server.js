const express = require("express")
const app = express()
const http = require('http').Server(app)
const io = require("socket.io")(http)
const fs = require("fs")
const path = require("path")

const jpeg = require('jpeg-js')

let prevImg = null

io.on('connection', function(socket){
    console.log(`conn :  ${socket.id}`)
    socket.on("streamer", (data) => {
        const { dataURL } = data
        const buffer = new Buffer(dataURL.split(",")[1], 'base64')
        // console.log(jpeg.decode(buffer))
        if(prevImg === null){
            prevImg = buffer
        } else {
            fs.writeFileSync("test.jpg", buffer)
            fs.writeFileSync("tes1.jpg", prevImg)
            // console.log(prevImg)
            // console.log(buffer)
            const changeRate = calculateJpgChangeRate({
                jpgBufs : [prevImg, buffer]
            })
            console.log(changeRate)
            if(changeRate >= 0.12){
                io.emit("warning")
            }
            prevImg = buffer
        }
    })
})

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))
app.use("/public", express.static(path.join(__dirname, "public")))
app.get("*", (req, res) => {
    res.render("streamer")
})

http.listen(80, () => {
    console.log(80)
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
        // if(decodedJpg1.data[i] !== decodedJpg2.data[i]){
        //     // console.log(decodedJpg1.data[i])
        //     // console.log(decodedJpg2.data[i])

        // }
    }   
    return count / Uint8ArrayLength
}