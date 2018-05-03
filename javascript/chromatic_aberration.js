import assets from "./assets"
import { createProgram, getValue } from "./utils"

class Quad {
	constructor() {
		this.vertices = new Float32Array([
			-1, -1, 0,
			1, -1, 0,
			1, 1, 0,
			-1, -1, 0,
			-1, 1, 0,
			1, 1, 0,
		])
		this.indices = new Uint16Array([0, 1, 2, 3, 4, 5])
	}
}

export default class ChromaticAberration extends Quad {
	constructor(gl/* , shaderProgram */) {
		super()

		this.gl = gl
		// this.program = shaderProgram

		this.program = createProgram(gl, assets.shaders.chromatic)

		this.vertexBuffer = gl.createBuffer()
		this.indexBuffer = gl.createBuffer()

		this.coordIn = gl.getAttribLocation(this.program, "coordinate")
		this.screenSizeIn = gl.getUniformLocation(this.program, "screenSizeIn")

		this.rOffset = gl.getUniformLocation(this.program, "urOffset")
		this.gOffset = gl.getUniformLocation(this.program, "ugOffset")
		this.bOffset = gl.getUniformLocation(this.program, "ubOffset")
	}

	draw(time, width, height, texture, document) {
		const gl = this.gl

		gl.useProgram(this.program)

		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.uniform1i(gl.getUniformLocation(this.program, "samplerIn"), 0)

		gl.uniform2f(this.screenSizeIn, width, height)

		const rHori = getValue(document, "r_horizontal")
		const rVert = getValue(document, "r_vertical")
		const rSpeed = getValue(document, "r_speed")
		const gHori = getValue(document, "g_horizontal")
		const gVert = getValue(document, "g_vertical")
		const gSpeed = getValue(document, "g_speed")
		const bHori = getValue(document, "b_horizontal")
		const bVert = getValue(document, "b_vertical")
		const bSpeed = getValue(document, "b_speed")

		gl.uniform2f(this.rOffset, rHori * Math.sin(time * rSpeed), rVert * Math.sin(time * rSpeed))
		gl.uniform2f(this.gOffset, gHori * Math.sin(time * gSpeed), gVert * Math.sin(time * gSpeed))
		gl.uniform2f(this.bOffset, bHori * Math.sin(time * bSpeed), bVert * Math.sin(time * bSpeed))

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW)

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW)

		gl.enableVertexAttribArray(this.coordIn)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.vertexAttribPointer(this.coordIn, 3, gl.FLOAT, false, 0, 0)

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)

		gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0)
	}
}
