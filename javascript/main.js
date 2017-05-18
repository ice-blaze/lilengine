import { vec3, mat4 } from "gl-matrix"
import {
	shaderSource,
	skyboxSource,
} from "../shaders/shaders"
import SkyBox from "./skybox"
import GameObject from "./game_object"
import initCanvasButton from "./canvas_buttons"
import { createProgram } from "./utils"
import ChromaticAberration from "./chromatic_aberration"

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
		return canvas.getContext("experimental-webgl", {
			antialias: true,
		})
	} catch (e) {
		alert("You are not webgl compatible :(") // eslint-disable-line no-alert
		return undefined
	}
}

function main() {
	const canvas = document.getElementById("demoCanvas")
	const COUNTER = document.getElementById("counter")
	canvas.width = 320
	canvas.height = 240

	const gl = getGl(canvas)

	gl.enable(gl.DEPTH_TEST)
	gl.depthFunc(gl.LESS)

	const MAX_OBJ = 4
	for (let i = 0; i < MAX_OBJ; i += 1) {
		const cube1 = GameObject.create(gl, "./models/cube.obj", `obja${i}`)
		// const cube2 = GameObject.create(gl, "./models/cube.obj", "objb" + i)
		const cube2 = GameObject.create(gl, "./models/bunny.obj", `objb${i}`)
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
	}

	const skybox = SkyBox.create(gl, "skybox")
	skybox.scale.set([100000, 100000, 100000])


	function createFramebuffer(width, height) {
		// Framebuffer part
		const buffer = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, buffer)
		buffer.width = width
		buffer.height = height
		const texture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
		gl.texImage2D(
			gl.TEXTURE_2D, 0, gl.RGBA, buffer.width, buffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
			null,
		)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

		const render = gl.createRenderbuffer()
		gl.bindRenderbuffer(gl.RENDERBUFFER, render)
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, render)

		gl.bindTexture(gl.TEXTURE_2D, null)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
		gl.bindRenderbuffer(gl.RENDERBUFFER, null)
		return {
			buffer,
			texture,
			render,
		}
	}

	elements.forEach((cube) => {
		cube.initBuffers()
	})
	skybox.initBuffers()

	// TODO acreate an object shader and link it to the GameObject
	const CUBES_PROGRAM = createProgram(gl, shaderSource)
	// TODO put it in the skybox part
	const SKYBOX_PROGRAM = createProgram(gl, skyboxSource)

	const chromatic = new ChromaticAberration(gl)

	const bufftex = createFramebuffer(canvas.width, canvas.height)

	// MVP Matrix
	const pMatrix = mat4.create()
	mat4.perspective(pMatrix, 80, canvas.width / canvas.height, 0.1, 100.0)
	// TODO put it in the skybox object
	const pSkyboxMatrix = mat4.create()
	mat4.perspective(pSkyboxMatrix, 80, canvas.width / canvas.height, 0.1, 1000000.0)

	// global lightning
	const globalLight = vec3.fromValues(1, -1, 1)
	vec3.normalize(globalLight, globalLight)

	let screenSizeIn
	let globalTime
	let pMatrixIn
	let globalLightIn

	let timeOld = 0
	const counterList = []
	let lastMean = 0

	GLB.animate = (time) => {
		window.requestAnimationFrame(GLB.animate)
		if (!GLB.canvasPlay && GLB.firstLoop > 1) { // need to do two times the loop for an image
			COUNTER.innerHTML = 0
			return
		}

		const dt = time - timeOld
		counterList.push(dt)
		const floorTime = Math.floor(time / 1000)
		if (lastMean < floorTime) {
			const mean = counterList.reduce((a, b) => a + b, 0) / counterList.length
			COUNTER.innerHTML = Math.round(mean * 100) / 100
			lastMean = floorTime
			counterList.length = 0
		}
		timeOld = time

		gl.viewport(0.0, 0.0, canvas.width, canvas.height)

		gl.bindFramebuffer(gl.FRAMEBUFFER, bufftex.buffer)
		gl.bindRenderbuffer(gl.RENDERBUFFER, bufftex.render)

		gl.clear(gl.COLOR_BUFFER_BIT + gl.DEPTH_BUFFER_BIT) // originally use | bitwise operator

		function drawMandlebox() {
			gl.useProgram(CUBES_PROGRAM)
			// Pass the screen size to the shaders as uniform and quad coordinates as attribute
			screenSizeIn = gl.getUniformLocation(CUBES_PROGRAM, "screenSizeIn")
			gl.uniform2f(screenSizeIn, canvas.width, canvas.height)
			globalLightIn = gl.getUniformLocation(CUBES_PROGRAM, "globalLightIn")
			gl.uniform3fv(globalLightIn, globalLight)
			globalTime = gl.getUniformLocation(CUBES_PROGRAM, "globalTimeIn")
			gl.uniform1f(globalTime, time / 1000)
			pMatrixIn = gl.getUniformLocation(CUBES_PROGRAM, "pMatrix")
			gl.uniformMatrix4fv(pMatrixIn, false, pMatrix)

			elements.forEach((gameObject) => {
				gameObject.setShaderProgram(CUBES_PROGRAM)
			})

			GLB.gameObjectHierarchy.forEach((parent) => {
				// position could shift because of floating precision errors
				parent.position[0] += Math.sin(time / 1000) / 100
				parent.rotate[0] = 4 * Math.sin(time / 1000)
				parent.rotate[1] = 4 * Math.sin(time / 1000)
				// cube1.scale[0] = 4 * Math.sin(time/1000)
				parent.children[0].scale[1] = 4 * Math.sin(time / 1000)
			})

			elements.forEach((gameObject) => {
				gameObject.draw()
			})

			gl.flush()
		}


		function drawSkybox() {
			gl.useProgram(SKYBOX_PROGRAM)
			skybox.setShaderProgram(SKYBOX_PROGRAM)

			pMatrixIn = gl.getUniformLocation(SKYBOX_PROGRAM, "pMatrix")
			gl.uniformMatrix4fv(pMatrixIn, false, pSkyboxMatrix)
			// skybox.rotate[1] = 4 * Math.sin(time / 1000)

			skybox.draw()
		}
		drawMandlebox()
		drawSkybox()

		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
		gl.bindRenderbuffer(gl.RENDERBUFFER, null)

		chromatic.draw(time, canvas.width, canvas.height, bufftex.texture, document)

		GLB.firstLoop += 1
	}
	return GLB.animate(0)
}
main()

initCanvasButton()
