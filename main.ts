radio.setGroup(11)
radio.setTransmitSerialNumber(true)

let y = 0
let x = 0
let turn = 0
let speed = 0
let direction = "" // levá nebo pravá
let flashIndex = 0

//NeoPixel strip
let strip = neopixel.create(DigitalPin.P0, 9, NeoPixelMode.RGB)

function updateNeoPixelEffect() {
    strip.clear()
    if (direction == "leva") {
        strip.setPixelColor(flashIndex % strip.length(), neopixel.colors(NeoPixelColors.Red))
        flashIndex++
    } else if (direction == "prava") {
        strip.setPixelColor((strip.length() - 1 - flashIndex % strip.length()), neopixel.colors(NeoPixelColors.Blue))
        flashIndex++
    }
    strip.show()
}

//Motor a tilt
function controlServo(xTilt: number, yTilt: number) {
    speed = Math.map(yTilt, -1023, 1023, -200, 200)
    speed = Math.constrain(speed, 0, 200)
    turn = Math.map(xTilt, -1023, 1023, -200, 200)
    turn = Math.constrain(turn, 0, 200)

    //směr animace
    if (xTilt > 200) {
        direction = "prava"
    } else if (xTilt < -200) {
        direction = "leva"
    } else {
        direction = ""
        strip.clear()
        strip.show()
    }

    if (yTilt < -10) {
        //Vpřed
        PCAmotor.MotorRun(PCAmotor.Motors.M4, yTilt + xTilt / 3)
        PCAmotor.MotorRun(PCAmotor.Motors.M1, yTilt - xTilt / 3)
    } else if (yTilt > 10) {
        //Pozpátku
        PCAmotor.MotorRun(PCAmotor.Motors.M1, yTilt)
        PCAmotor.MotorRun(PCAmotor.Motors.M4, yTilt)
    } else {
        // Stop
        PCAmotor.MotorStopAll()
    }
}

radio.onReceivedValue(function (name, value) {
    if (name == "x") {
        x = value
    } else if (name == "y") {
        y = value
    }
    controlServo(x, y)
})

radio.onReceivedString(function (string) {
    if (string == "Stop") {
        PCAmotor.MotorStopAll()
        basic.pause(1000)
    }
})

basic.forever(function () {
    updateNeoPixelEffect()
    basic.pause(100)
})
