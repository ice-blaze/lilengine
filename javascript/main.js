import SkyBox from "./skybox"
import Heightmap from "./heightmap"
import GameObject from "./game_object"
import initCanvasButton from "./canvas_buttons"
import ChromaticAberration from "./chromatic_aberration"
import { range, createFramebuffer } from "./utils"
import DepthField from "./depth_field"
import assets from "./assets"

// GLOBALS
const GLB = {
	canvasPlay: true,
	animate: undefined,
	firstLoop: 0,
	gameObjectHierarchy: [],
	selectedGameObject: null,
}
export default GLB

const elements = []

function getGl(canvas) {
	try {
		return canvas.getContext("webgl", {
			antialias: true,
			depth: true,
		})
	} catch (e) {
		alert("You are not webgl compatible :(") // eslint-disable-line no-alert
		return undefined
	}
}

function main() {
	const canvas = document.getElementById("demoCanvas")
	const counter = document.getElementById("counter")
	canvas.width = 320
	canvas.height = 240

	const gl = getGl(canvas)

	// gl.depthFunc(gl.LESS)
	const depthExt = gl.getExtension("WEBGL_depth_texture")
	if (depthExt === null) {
		console.warn("depth texture not supported")
	}

	const MAX_OBJ = 4
	range(MAX_OBJ).forEach((i) => {
		const cube1 = new GameObject(gl, assets.models.cube, `obja${i}`, canvas)
		// const cube2 = GameObject.create(gl, "./models/cube.obj", "objb" + i)
		const cube2 = new GameObject(gl, assets.models.bunny, `objb${i}`, canvas)
		console.log(`generated ${i}/${MAX_OBJ}`)
		cube1.setChild(cube2)

		GLB.gameObjectHierarchy.push(cube1)
		elements.push(cube1)
		elements.push(cube2)
		GLB.selectedGameObject = cube1

		cube1.position.set([
			(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, -20.0 + (Math.random() - 0.5),
		])
		cube2.position.set([-2.0, 0.0, -0.0])
	})

	const skybox = new SkyBox(gl, "skybox", canvas)
	const heightmap = new Heightmap(gl, "heightmap", canvas, "./skyboxes/default.png")
	skybox.scale.set([100000, 100000, 100000])

	const chromatic = new ChromaticAberration(gl)
	const depth = new DepthField(gl)

	const sceneBufftex = createFramebuffer(gl, canvas.width, canvas.height)
	const depthBufftex = createFramebuffer(gl, canvas.width, canvas.height)

	let timeOld = 0
	const counterList = []
	let lastMean = 0

	GLB.animate = (time) => {
		window.requestAnimationFrame(GLB.animate)
		if (!GLB.canvasPlay && GLB.firstLoop > 1) { // need to do two times the loop for an image
			counter.innerHTML = 0
			return
		}

		gl.enable(gl.DEPTH_TEST)
		const dt = time - timeOld
		counterList.push(dt)
		const floorTime = Math.floor(time / 1000)
		if (lastMean < floorTime) {
			const mean = counterList.reduce((a, b) => a + b, 0) / counterList.length
			counter.innerHTML = Math.round(mean * 100) / 100
			lastMean = floorTime
			counterList.length = 0
		}
		timeOld = time

		gl.viewport(0.0, 0.0, canvas.width, canvas.height)

		gl.bindFramebuffer(gl.FRAMEBUFFER, sceneBufftex.buffer)
		gl.clear(gl.COLOR_BUFFER_BIT + gl.DEPTH_BUFFER_BIT) // originally use | bitwise operator

		function drawCubes() {
			GLB.gameObjectHierarchy.forEach((parent) => {
				// position could shift because of floating precision errors
				parent.position[2] = (Math.sin(time / 1000) * 10) - 20
				// parent.rotate[0] = 4 * Math.sin(time / 1000)
				// parent.rotate[1] = 4 * Math.sin(time / 1000)
				// cube1.scale[0] = 4 * Math.sin(time/1000)
				parent.children[0].scale[1] = 4 * Math.sin(time / 1000)
			})

			elements.forEach((gameObject) => {
				gameObject.draw(canvas, time)
			})
		}

		drawCubes()
		skybox.draw()

		gl.bindFramebuffer(gl.FRAMEBUFFER, depthBufftex.buffer)
		gl.clear(gl.COLOR_BUFFER_BIT + gl.DEPTH_BUFFER_BIT) // originally use | bitwise operator

		depth.draw(
			canvas.width, canvas.height, sceneBufftex.colorTexture, sceneBufftex.depthTexture,
			document,
		)

		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
		gl.disable(gl.DEPTH_TEST)

		chromatic.draw(time, canvas.width, canvas.height, depthBufftex.colorTexture, document)

		GLB.firstLoop += 1
	}
	return GLB.animate(0)
}

const assetsWait = setInterval(() => {
	if (assets.ready) {
		main()
		clearInterval(assetsWait)
	}
}, 1)

initCanvasButton()
