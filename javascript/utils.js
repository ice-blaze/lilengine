export function removeArray(array, object) {
	const i = array.indexOf(object)
	if (i !== -1) {
		array.splice(i, 1)
	}
}

// Load synchronously the shaders. It's slower(0.5s) but code is more readable
export function loadTextFile(url) {
	const request = new XMLHttpRequest()
	request.open("GET", url, false)
	request.send()
	return request.responseText
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
