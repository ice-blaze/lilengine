import {
	chromaticSource,
} from "../shaders/shaders"
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
	constructor(GL/* , shaderProgram*/) {
		super()

		this.GL = GL
		// this.program = shaderProgram

		this.program = createProgram(GL, chromaticSource)

		this.vertexBuffer = GL.createBuffer()
		this.indexBuffer = GL.createBuffer()
		this.coordIn = GL.getAttribLocation(this.program, "coordinate")

		this.rOffset = GL.getUniformLocation(this.program, "urOffset")
		this.gOffset = GL.getUniformLocation(this.program, "ugOffset")
		this.bOffset = GL.getUniformLocation(this.program, "ubOffset")

		this.screenSizeIn = GL.getUniformLocation(this.program, "screenSizeIn")
	}

	draw(time, width, height, texture, document) {
		const GL = this.GL

		GL.useProgram(this.program)

		GL.activeTexture(GL.TEXTURE0)
		GL.bindTexture(GL.TEXTURE_2D, texture)
		GL.uniform1i(GL.getUniformLocation(this.program, "samplerIn"), 0)

		GL.uniform2f(this.screenSizeIn, width, height)

		const rHori = getValue(document, "r_horizontal")
		const rVert = getValue(document, "r_vertical")
		const gHori = getValue(document, "g_horizontal")
		const gVert = getValue(document, "g_vertical")
		const bHori = getValue(document, "b_horizontal")
		const bVert = getValue(document, "b_vertical")
		// GL.uniform2f(this.rOffset, Math.sin(0.01 * time) * rHori, rVerti)
		GL.uniform2f(this.rOffset, rHori, rVert)
		GL.uniform2f(this.gOffset, gHori, gVert)
		GL.uniform2f(this.bOffset, bHori, bVert)

		// const vertexBuffer = GL.createBuffer()
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer)
		GL.bufferData(GL.ARRAY_BUFFER, this.vertices, GL.STATIC_DRAW)

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.indices, GL.STATIC_DRAW)

		GL.enableVertexAttribArray(this.coordIn)
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer)
		GL.vertexAttribPointer(this.coordIn, 3, GL.FLOAT, false, 0, 0)

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer)

		GL.drawElements(GL.TRIANGLES, this.indices.length, GL.UNSIGNED_SHORT, 0)
	}
}
