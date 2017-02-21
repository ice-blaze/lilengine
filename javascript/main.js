var canvas_play = true
var animate = undefined
var first_loop = 0

const main = function () {
	const CANVAS = document.getElementById("demo_canvas")
	const COUNTER = document.getElementById("counter")
	CANVAS.width = 320
	CANVAS.height = 240

	let GL
	try {
		GL = CANVAS.getContext("experimental-webgl", {
			antialias: true
		})
	} catch (e) {
		alert("You are not webgl compatible :(")
		return false
	}

	GL.enable(GL.DEPTH_TEST)
	GL.depthFunc(GL.LESS);

	const cubes = []
	const elements = []
	for (var i = 0; i < 5; i++) {
		const cube1 = GameObject.create(GL, "./models/cube.obj", "obja" + i)
		const cube2 = GameObject.create(GL, "./models/cube.obj", "objb" + i)
		cube1.set_child(cube2)
		cubes.push(cube1)
		cubes.push(cube2)
		elements.push(cube1)

		cube1.position.set([(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, -20.0 + (Math.random() - 0.5)])
		cube2.position.set([-2.0, 0.0, -0.0])
	}

	const skybox = SkyBox.create(GL, "skybox")
	skybox.scale.set([100000, 100000, 100000])

	const get_shader = function (source, type, typeString) {
		const shader = GL.createShader(type)
		GL.shaderSource(shader, source)
		GL.compileShader(shader)
		if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
			console.log("ERROR IN " + typeString + " SHADER : " + GL.getShaderInfoLog(shader))
			return false
		}
		return shader
	}

	const create_framebuffer = function (width, height) {
		// Framebuffer part
		let buffer = GL.createFramebuffer();
		GL.bindFramebuffer(GL.FRAMEBUFFER, buffer);
		buffer.width = width;
		buffer.height = height;
		let texture = GL.createTexture();
		GL.bindTexture(GL.TEXTURE_2D, texture);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
		GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, buffer.width, buffer.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
		GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture, 0);
		GL.bindTexture(GL.TEXTURE_2D, null);
		GL.bindFramebuffer(GL.FRAMEBUFFER, null);

		return {
			buffer: buffer,
			texture: texture
		}
	}

	for (let cube of cubes) {
		cube.init_buffers()
	}
	skybox.init_buffers()

	// TODO acreate an object shader and link it to the GameObject
	// Link the vertex and fragment shader
	const shader_vertex = get_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX")
	const shader_fragment = get_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT")
	const MANDELBOX_PROGRAM = GL.createProgram()
	GL.attachShader(MANDELBOX_PROGRAM, shader_vertex)
	GL.attachShader(MANDELBOX_PROGRAM, shader_fragment)
	GL.linkProgram(MANDELBOX_PROGRAM)
	//TODO put it in the skybox part
	//skybox shader
	const skybox_vs = get_shader(skybox_vs_source, GL.VERTEX_SHADER, "SKYBOX VERTEX")
	const skybox_fs = get_shader(skybox_fs_source, GL.FRAGMENT_SHADER, "SKYBOX FRAGMENT")
	const SKYBOX_PROGRAM = GL.createProgram()
	GL.attachShader(SKYBOX_PROGRAM, skybox_vs)
	GL.attachShader(SKYBOX_PROGRAM, skybox_fs)
	GL.linkProgram(SKYBOX_PROGRAM)

	let bufftex = create_framebuffer(CANVAS.width, CANVAS.height)

	//MVP Matrix
	let p_matrix = mat4.create()
	mat4.perspective(p_matrix, 80, CANVAS.width / CANVAS.height, 0.1, 100.0)
	// TODO put it in the skybox object
	let p_skybox_matrix = mat4.create()
	mat4.perspective(p_skybox_matrix, 80, CANVAS.width / CANVAS.height, 0.1, 1000000.0)

	//global lightning
	let global_light = vec3.fromValues(1, -1, 1)
	vec3.normalize(global_light, global_light)

	let screen_size_in
	let global_time
	let p_matrix_in
	let global_light_in

	let time_old = 0
	let counter_list = []
	let last_mean = 0

	let temp_var

	animate = function (time) {
		window.requestAnimationFrame(animate)
		if (!canvas_play && first_loop > 1) { //need to do two times the loop for an image
			COUNTER.innerHTML = 0
			return
		}

		let dt = time - time_old
		counter_list.push(dt)
		floor_time = Math.floor(time / 1000)
		if (last_mean < floor_time) {
			mean = counter_list.reduce((a, b) => a + b, 0) / counter_list.length;
			COUNTER.innerHTML = Math.round(mean * 100) / 100
			last_mean = floor_time
			counter_list.length = 0
		}
		time_old = time

		GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height)
		GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT)

		const draw_mandlebox = function () {
			GL.useProgram(MANDELBOX_PROGRAM)
			// Pass the screen size to the shaders as uniform and quad coordinates as attribute
			screen_size_in = GL.getUniformLocation(MANDELBOX_PROGRAM, "screen_size_in")
			GL.uniform2f(screen_size_in, CANVAS.width, CANVAS.height)
			global_light_in = GL.getUniformLocation(MANDELBOX_PROGRAM, "global_light_in")
			GL.uniform3fv(global_light_in, global_light)
			global_time = GL.getUniformLocation(MANDELBOX_PROGRAM, "global_time_in")
			GL.uniform1f(global_time, time / 1000)
			p_matrix_in = GL.getUniformLocation(MANDELBOX_PROGRAM, "p_matrix")
			GL.uniformMatrix4fv(p_matrix_in, false, p_matrix)

			for (let cube of cubes) {
				cube.set_shader_program(MANDELBOX_PROGRAM)
			}

			for (let element of elements) {
				// position could shift because of floating precision errors
				element.position[0] += Math.sin(time / 1000) / 100
				element.rotate[0] = 4 * Math.sin(time / 1000)
				element.rotate[1] = 4 * Math.sin(time / 1000)
				// cube1.scale[0] = 4 * Math.sin(time/1000)
				element.children[0].scale[1] = 4 * Math.sin(time / 1000)
			}

			for (let cube of cubes) {
				cube.draw()
			}

			GL.flush()
		}

		GL.bindFramebuffer(GL.FRAMEBUFFER, null)

		draw_mandlebox()

		const draw_skybox = function () {
			GL.useProgram(SKYBOX_PROGRAM)
			skybox.set_shader_program(SKYBOX_PROGRAM)

			p_matrix_in = GL.getUniformLocation(SKYBOX_PROGRAM, "p_matrix")
			GL.uniformMatrix4fv(p_matrix_in, false, p_skybox_matrix)
			skybox.rotate[1] = 4 * Math.sin(time / 1000)

			skybox.draw()
		}
		draw_skybox()

		first_loop++;
	}
	animate(0)
}