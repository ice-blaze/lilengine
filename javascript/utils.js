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
export function getShader(GL, source, type, typeString) {
	if (GL.VERTEX_SHADER !== type && GL.FRAGMENT_SHADER !== type) {
		console.err("Only manage fragment or vertex shader !!")
		return undefined
	}
	const shader = GL.createShader(type)
	GL.shaderSource(shader, source)
	GL.compileShader(shader)
	if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
		console.log(`ERROR IN ${typeString} SHADER : ${GL.getShaderInfoLog(shader)}`)
		return false
	}
	return shader
}

export function getShaders(GL, shader) {
	const vs = getShader(GL, shader.vsSource, GL.VERTEX_SHADER, `${shader.name} VERTEX`)
	const fs = getShader(GL, shader.fsSource, GL.FRAGMENT_SHADER, `${shader.name} FRAGMENT`)
	return { vs, fs }
}
