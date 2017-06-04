import assets from "./assets"
import { createProgram, getValue } from "./utils"

// Put it in another file
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

export default class DepthField extends Quad {
	constructor(gl) {
		super()

		this.gl = gl

		this.program = createProgram(gl, assets.shaders.depth)

		this.vertexBuffer = gl.createBuffer()
		this.indexBuffer = gl.createBuffer()

		this.coordIn = gl.getAttribLocation(this.program, "coordinate")
		this.screenSizeIn = gl.getUniformLocation(this.program, "screenSizeIn")

		this.near = gl.getUniformLocation(this.program, "uNear")
		this.far = gl.getUniformLocation(this.program, "uFar")
	}

	draw(width, height, colorTexture, depthTexture, document) {
		const gl = this.gl

		gl.useProgram(this.program)

		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, colorTexture)
		gl.uniform1i(gl.getUniformLocation(this.program, "colorTextureIn"), 0)

		gl.activeTexture(gl.TEXTURE1)
		gl.bindTexture(gl.TEXTURE_2D, depthTexture)
		gl.uniform1i(gl.getUniformLocation(this.program, "depthTextureIn"), 1)

		gl.uniform2f(this.screenSizeIn, width, height)

		const near = getValue(document, "depth_near")
		const far = getValue(document, "depth_far")

		gl.uniform1f(this.near, near)
		gl.uniform1f(this.far, far)

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
