import { vec3, mat4 } from "gl-matrix"
import { createProgram } from "./utils"
import assets from "./assets"
import Hierarchy from "./hierarchy"

const OBJ = require("webgl-obj-loader") // import are not availble

export default class GameObject extends Hierarchy {
	constructor(gl, name = "name", canvas, camera, model = undefined, tag = undefined) {
		super(name)
		this.texture = null // the image texture

		this.camera = camera

		this.verticesBuffer = gl.createBuffer()
		this.normalsBuffer = gl.createBuffer()
		this.indicesBuffer = gl.createBuffer()

		this.tag = tag

		if (model) {
			const objMesh = new OBJ.Mesh(model)

			this.vertices = new Float32Array(objMesh.vertices)
			this.textures = objMesh.textures
			this.indices = new Uint16Array(objMesh.indices)
			this.normals = new Float32Array(objMesh.vertexNormals)
		}

		this.gl = gl

		this.program = createProgram(gl, assets.shaders.mainShader)

		// MVP Matrix
		this.pMatrix = mat4.create()
		mat4.perspective(this.pMatrix, this.camera.yFov, canvas.width / canvas.height, 0.1, 100.0)

		// global lightning
		this.globalLight = vec3.fromValues(1, -1, 1)
		// maybe should be moved to the draw part
		vec3.normalize(this.globalLight, this.globalLight)

		this.screenSizeIn = gl.getUniformLocation(this.program, "screenSizeIn")
		this.globalTime = gl.getUniformLocation(this.program, "globalTimeIn")
		this.pMatrixIn = gl.getUniformLocation(this.program, "pMatrix")
		this.globalLightIn = gl.getUniformLocation(this.program, "globalLightIn")

		this.normalMatrix = mat4.create()
	}

	draw(canvas, time) {
		// if there is no model, don't draw
		if (!this.indices) {
			return
		}
		const gl = this.gl
		gl.useProgram(this.program)
		// Pass the screen size to the shaders as uniform and quad coordinates as attribute

		gl.uniform2f(this.screenSizeIn, canvas.width, canvas.height)
		gl.uniform3fv(this.globalLightIn, this.globalLight)
		gl.uniform1f(this.globalTime, time / 1000)
		gl.uniformMatrix4fv(this.pMatrixIn, false, this.pMatrix)

		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW)

		const mvMatrix = this.modelMatrix()
		mat4.invert(this.normalMatrix, mvMatrix)
		mat4.transpose(this.normalMatrix, this.normalMatrix)
		this.normal_matrix_in = gl.getUniformLocation(this.program, "normalMatrix")
		gl.uniformMatrix4fv(this.normal_matrix_in, false, this.normalMatrix)
		this.mvMatrixIn = gl.getUniformLocation(this.program, "mvMatrix")
		gl.uniformMatrix4fv(this.mvMatrixIn, false, mvMatrix)
		this.normalIn = gl.getAttribLocation(this.program, "normal")
		gl.enableVertexAttribArray(this.normalIn)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer)
		gl.vertexAttribPointer(this.normalIn, 3, gl.FLOAT, false, 0, 0)
		this.coordIn = gl.getAttribLocation(this.program, "coordinate")
		gl.enableVertexAttribArray(this.coordIn)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer)
		gl.vertexAttribPointer(this.coordIn, 3, gl.FLOAT, false, 0, 0)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer)

		gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0)

		gl.flush()
	}
}
