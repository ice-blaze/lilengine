let canvasPlay = true
let animate = undefined
let firstLoop = 0
const gameObjectHierarchy = []
const elements = []
let selectedGameObject = null

const main = function () {
	const CANVAS = document.getElementById("demo_canvas")
	const COUNTER = document.getElementById("counter")
	CANVAS.width = 320
	CANVAS.height = 240

	let GL
	try {
		GL = CANVAS.getContext("experimental-webgl", {
			antialias: true,
		})
	} catch (e) {
		alert("You are not webgl compatible :(")
		return false
	}

	GL.enable(GL.DEPTH_TEST)
	GL.depthFunc(GL.LESS);

	const MAX_OBJ = 4
	for (let i = 0; i < MAX_OBJ; i++) {
		const cube1 = GameObject.create(GL, "./models/cube.obj", "obja" + i)
		// const cube2 = GameObject.create(GL, "./models/cube.obj", "objb" + i)
		const cube2 = GameObject.create(GL, "./models/bunny.obj", "objb" + i)
		console.log(`generated ${i}/${MAX_OBJ}`)
		cube1.setChild(cube2)

		gameObjectHierarchy.push(cube1)
		elements.push(cube1)
		elements.push(cube2)
		selectedGameObject = cube1

		cube1.position.set([
			(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, -20.0 + (Math.random() - 0.5)
		])
		cube2.position.set([-2.0, 0.0, -0.0])
	}

	const skybox = SkyBox.create(GL, "skybox")
	skybox.scale.set([100000, 100000, 100000])

	const getShader = function (source, type, typeString) {
		const shader = GL.createShader(type)
		GL.shaderSource(shader, source)
		GL.compileShader(shader)
		if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
			console.log(`ERROR IN ${typeString} SHADER : ${GL.getShaderInfoLog(shader)}`)
			return false
		}
		return shader
	}

	const create_framebuffer = function (width, height) {
		// Framebuffer part
		let buffer = GL.createFramebuffer()
		GL.bindFramebuffer(GL.FRAMEBUFFER, buffer)
		buffer.width = width
		buffer.height = height
		let texture = GL.createTexture()
		GL.bindTexture(GL.TEXTURE_2D, texture)
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE)
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE)
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST)
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST)
		GL.texImage2D(
			GL.TEXTURE_2D, 0, GL.RGBA, buffer.width, buffer.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null
		)
		GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture, 0)
		GL.bindTexture(GL.TEXTURE_2D, null)
		GL.bindFramebuffer(GL.FRAMEBUFFER, null)

		return {
			buffer,
			texture,
		}
	}

	for (let cube of elements) {
		cube.initBuffers()
	}
	skybox.initBuffers()

	// TODO acreate an object shader and link it to the GameObject
	// Link the vertex and fragment shader
	const shaderVertex = getShader(shaderVertexSource, GL.VERTEX_SHADER, "VERTEX")
	const shaderFragment = getShader(shaderFragmentSource, GL.FRAGMENT_SHADER, "FRAGMENT")
	const MANDELBOX_PROGRAM = GL.createProgram()
	GL.attachShader(MANDELBOX_PROGRAM, shaderVertex)
	GL.attachShader(MANDELBOX_PROGRAM, shaderFragment)
	GL.linkProgram(MANDELBOX_PROGRAM)
	// TODO put it in the skybox part
	// skybox shader
	const skyboxVs = getShader(skyboxVsSource, GL.VERTEX_SHADER, "SKYBOX VERTEX")
	const skyboxFs = getShader(skyboxFsSource, GL.FRAGMENT_SHADER, "SKYBOX FRAGMENT")
	const SKYBOX_PROGRAM = GL.createProgram()
	GL.attachShader(SKYBOX_PROGRAM, skyboxVs)
	GL.attachShader(SKYBOX_PROGRAM, skyboxFs)
	GL.linkProgram(SKYBOX_PROGRAM)

	let bufftex = create_framebuffer(CANVAS.width, CANVAS.height)

	//MVP Matrix
	let pMatrix = mat4.create()
	mat4.perspective(pMatrix, 80, CANVAS.width / CANVAS.height, 0.1, 100.0)
	// TODO put it in the skybox object
	let p_skybox_matrix = mat4.create()
	mat4.perspective(p_skybox_matrix, 80, CANVAS.width / CANVAS.height, 0.1, 1000000.0)

	//global lightning
	let globalLight = vec3.fromValues(1, -1, 1)
	vec3.normalize(globalLight, globalLight)

	let screenSizeIn
	let globalTime
	let pMatrixIn
	let globalLightIn

	let timeOld = 0
	const counterList = []
	let lastMean = 0

	animate = function (time) {
		window.requestAnimationFrame(animate)
		if (!canvasPlay && firstLoop > 1) { // need to do two times the loop for an image
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

		GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height)
		GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT)

		const draw_mandlebox = function () {
			GL.useProgram(MANDELBOX_PROGRAM)
			// Pass the screen size to the shaders as uniform and quad coordinates as attribute
			screenSizeIn = GL.getUniformLocation(MANDELBOX_PROGRAM, "screenSizeIn")
			GL.uniform2f(screenSizeIn, CANVAS.width, CANVAS.height)
			globalLightIn = GL.getUniformLocation(MANDELBOX_PROGRAM, "globalLightIn")
			GL.uniform3fv(globalLightIn, globalLight)
			globalTime = GL.getUniformLocation(MANDELBOX_PROGRAM, "globalTimeIn")
			GL.uniform1f(globalTime, time / 1000)
			pMatrixIn = GL.getUniformLocation(MANDELBOX_PROGRAM, "pMatrix")
			GL.uniformMatrix4fv(pMatrixIn, false, pMatrix)

			for (let game_object of elements) {
				game_object.setShaderProgram(MANDELBOX_PROGRAM)
			}

			for (let parent of gameObjectHierarchy) {
				// position could shift because of floating precision errors
				parent.position[0] += Math.sin(time / 1000) / 100
				parent.rotate[0] = 4 * Math.sin(time / 1000)
				parent.rotate[1] = 4 * Math.sin(time / 1000)
				// cube1.scale[0] = 4 * Math.sin(time/1000)
				parent.children[0].scale[1] = 4 * Math.sin(time / 1000)
			}

			for (let game_object of elements) {
				game_object.draw()
			}

			GL.flush()
		}

		GL.bindFramebuffer(GL.FRAMEBUFFER, null)

		draw_mandlebox()

		const draw_skybox = function () {
			GL.useProgram(SKYBOX_PROGRAM)
			skybox.setShaderProgram(SKYBOX_PROGRAM)

			pMatrixIn = GL.getUniformLocation(SKYBOX_PROGRAM, "pMatrix")
			GL.uniformMatrix4fv(pMatrixIn, false, p_skybox_matrix)
			skybox.rotate[1] = 4 * Math.sin(time / 1000)

			skybox.draw()
		}
		draw_skybox()

		firstLoop += 1
	}
	animate(0)
}
