import {
	// chromaticAberrationFsSource,
	// chromaticAberrationVsSource,
	chromaticSource,
} from "../shaders/shaders"
import { getShader } from "./utils"

class Quad {
	constructor() {
		this.vertices = [
			-1, -1, 0,
			1, -1, 0,
			1, 1, 0,
			-1, -1, 0,
			-1, 1, 0,
			1, 1, 0,
		]
		this.indices = [0, 1, 2, 3, 4, 5]
	}
}

export default class ChromaticAberration extends Quad {
	constructor(GL/* , shaderProgram*/) {
		super()

		this.GL = GL
		// this.program = shaderProgram

		const chromaticVs = getShader(GL, chromaticSource.vsSource, GL.VERTEX_SHADER, `${chromaticSource.name} VERTEX`)
		const chromaticFs = getShader(GL, chromaticSource.fsSource, GL.FRAGMENT_SHADER, `${chromaticSource.name} FRAGMENT`)
		this.program = GL.createProgram()
		GL.attachShader(this.program, chromaticVs)
		GL.attachShader(this.program, chromaticFs)
		GL.linkProgram(this.program)

		this.vertexBuffer = GL.createBuffer()
		this.indexBuffer = GL.createBuffer()
		this.coordIn = GL.getAttribLocation(this.program, "coordinate")

		this.rOffset = GL.getUniformLocation(this.program, "urOffset")
		this.gOffset = GL.getUniformLocation(this.program, "ugOffset")
		this.bOffset = GL.getUniformLocation(this.program, "ubOffset")
	}

	// init() {
	// }

	draw(time, width, height, texture) {
		const GL = this.GL

		GL.useProgram(this.program)

		GL.activeTexture(GL.TEXTURE0)
		GL.bindTexture(GL.TEXTURE_2D, texture)
		GL.uniform1i(GL.getUniformLocation(this.program, "samplerIn"), 0)

		// TODO could put it in init
		const screenSizeIn = GL.getUniformLocation(this.program, "screenSizeIn")
		GL.uniform2f(screenSizeIn, width, height)

		GL.uniform2f(this.rOffset, Math.sin(0.01 * time) * 4.0, 0.0)
		GL.uniform2f(this.gOffset, 0.0, 0.0)
		GL.uniform2f(this.bOffset, Math.cos(0.01 * time) * -4.0, 0.0)

		// const vertexBuffer = GL.createBuffer()
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer)
		GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.STATIC_DRAW)

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), GL.STATIC_DRAW)

		GL.enableVertexAttribArray(this.coordIn)
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer)
		GL.vertexAttribPointer(this.coordIn, 3, GL.FLOAT, false, 0, 0)

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer)

		GL.drawElements(GL.TRIANGLES, this.indices.length, GL.UNSIGNED_SHORT, 0)
	}
}
