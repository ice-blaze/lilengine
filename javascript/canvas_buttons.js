import GLB from "./main"

const demoCanvas = document.getElementById("demoCanvas")

const minWidth = 320
const minHeight = 240
const medWidth = 640
const medHeight = 480

// function play() {
//     GLB.canvasPlay = !GLB.canvasPlay
// }
// document.getElementById("btnPlay").onclick = play

function refreshImage() {
	GLB.firstLoop = 0
	window.requestAnimationFrame(GLB.animate)
}

function smallRes() {
	demoCanvas.width = minWidth
	demoCanvas.height = minHeight
	refreshImage()
}
document.getElementById("btnSmall").onclick = smallRes

function mediumRes() {
	demoCanvas.width = medWidth
	demoCanvas.height = medHeight
	refreshImage()
}
document.getElementById("btnMedium").onclick = mediumRes

document.getElementById("btnFullscreen").onclick = () => {
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
