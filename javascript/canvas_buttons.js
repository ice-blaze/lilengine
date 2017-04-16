const demoCanvas = document.getElementById("demo_canvas")

const minWidth = 320
const minHeight = 240
const medWidth = 640
const medHeight = 480

// function play(){
// 	canvas_play = !canvas_play
// }
// document.getElementById("btn_play").onclick = play

function refreshImage() {
	firstLoop = 0
	window.requestAnimationFrame(animate)
}

function smallRes() {
	demoCanvas.width = minWidth
	demoCanvas.height = minHeight
	refreshImage()
}
document.getElementById("btn_small").onclick = smallRes

function mediumRes() {
	demoCanvas.width = medWidth
	demoCanvas.height = medHeight
	refreshImage()
}
document.getElementById("btn_medium").onclick = mediumRes

document.getElementById("btn_fullscreen").onclick = function () {
	demoCanvas.width = screen.width
	demoCanvas.height = screen.height
	if (navigator.userAgent.search("Firefox") > -1) {
		demoCanvas.mozRequestFullScreen()
	} else {
		demoCanvas.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
	}
	refreshImage()
}

function onFullScreenChange() {
	if (!(
		document.fullscreenElement ||
		document.webkitFullscreenElement ||
		document.mozFullScreenElement ||
		document.msFullscreenElement
	)) {
		smallRes()
	}
}

document.addEventListener("fullscreenchange", onFullScreenChange)
document.addEventListener("webkitfullscreenchange", onFullScreenChange)
document.addEventListener("mozfullscreenchange", onFullScreenChange)
document.addEventListener("MSFullscreenChange", onFullScreenChange)
