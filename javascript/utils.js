export function removeArray(array, object) {
	const i = array.indexOf(object)
	if (i !== -1) {
		array.splice(i, 1)
	}
}

// Compile shaders and if not send an error
function getShader(gl, source, type, typeString) {
	if (gl.VERTEX_SHADER !== type && gl.FRAGMENT_SHADER !== type) {
		console.err("Only manage fragment or vertex shader !!")
		return undefined
	}
	const shader = gl.createShader(type)
	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log(`ERROR IN ${typeString} SHADER : ${gl.getShaderInfoLog(shader)}`)
		return false
	}
	return shader
}

// Create program
export function createProgram(gl, shaders) {
	const vs = getShader(gl, shaders.vsSource, gl.VERTEX_SHADER, `${shaders.name} vertex`)
	const fs = getShader(gl, shaders.fsSource, gl.FRAGMENT_SHADER, `${shaders.name} fragment`)
	const program = gl.createProgram()
	gl.attachShader(program, vs)
	gl.attachShader(program, fs)
	gl.linkProgram(program)

	return program
}

// return value of an element with an id
export function getValue(document, id) {
	return document.getElementById(id).value
}

// return a list of indices from 0 to n
export function range(n) {
	return [...Array(n)].map((_, i) => i)
}

// create framebuffer with texture, renderbuffer, and buffer
export function createFramebuffer(gl, width, height) {
	// Framebuffer part
	const colorTexture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, colorTexture)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
		null,
	)

	// Create the depth texture
	const depthTexture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, depthTexture)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0,
		gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null,
	)

	const buffer = gl.createFramebuffer()
	gl.bindFramebuffer(gl.FRAMEBUFFER, buffer)
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0)
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0)

	gl.bindTexture(gl.TEXTURE_2D, null)
	gl.bindFramebuffer(gl.FRAMEBUFFER, null)

	return {
		buffer,
		colorTexture,
		depthTexture,
	}
}
