import { vec3, mat4 } from "gl-matrix"
import view from "./view"
import { removeArray, loadTextFile, createProgram } from "./utils"
import {
	shaderSource,
} from "../shaders/shaders"

const OBJ = require("webgl-obj-loader")  // import are not availble

export default class GameObject {
	constructor(gl, path, name = "name", canvas) {
		this.name = name
		this.children = []
		this.parent = null
		this.texture = null // the image texture
		this.position = vec3.fromValues(0.0, 0.0, 0.0)
		this.rotate = vec3.fromValues(0.0, 0.0, 0.0)
		this.scale = vec3.fromValues(1.0, 1.0, 1.0)

		this.verticesBuffer = gl.createBuffer()
		this.normals_buffer = gl.createBuffer()
		this.indicesBuffer = gl.createBuffer()

		const file = loadTextFile(path)
		const objMesh = new OBJ.Mesh(file)

		this.vertices = new Float32Array(objMesh.vertices)
		this.textures = objMesh.textures
		this.indices = new Uint16Array(objMesh.indices)
		this.normals = new Float32Array(objMesh.vertexNormals)

		this.gl = gl

		this.program = createProgram(gl, shaderSource)

		// MVP Matrix
		this.pMatrix = mat4.create()
		mat4.perspective(this.pMatrix, 80, canvas.width / canvas.height, 0.1, 100.0)

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

	modelMatrix() {
		let model = mat4.create()
		if (this.parent) {
			model = this.parent.modelMatrix()
		}
		mat4.translate(model, model, this.position)
		mat4.rotateX(model, model, this.rotate[0])
		mat4.rotateY(model, model, this.rotate[1])
		mat4.rotateZ(model, model, this.rotate[2])
		mat4.scale(model, model, this.scale)

		return model
	}

	draw(canvas, time) {
		const gl = this.gl
		gl.useProgram(this.program)
		// Pass the screen size to the shaders as uniform and quad coordinates as attribute

		gl.uniform2f(this.screenSizeIn, canvas.width, canvas.height)
		gl.uniform3fv(this.globalLightIn, this.globalLight)
		gl.uniform1f(this.globalTime, time / 1000)
		gl.uniformMatrix4fv(this.pMatrixIn, false, this.pMatrix)

		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normals_buffer)
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
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normals_buffer)
		gl.vertexAttribPointer(this.normalIn, 3, gl.FLOAT, false, 0, 0)
		this.coordIn = gl.getAttribLocation(this.program, "coordinate")
		gl.enableVertexAttribArray(this.coordIn)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer)
		gl.vertexAttribPointer(this.coordIn, 3, gl.FLOAT, false, 0, 0)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer)

		gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0)

		gl.flush()
	}

	removeFromChildren(object) {
		removeArray(this.children, object)
	}

	setParent(newParent) {
		if (!(newParent instanceof GameObject)) {
			console.warn("Trying to set a parent that is not a GameObject")
			return
		}
		if (newParent === this) {
			console.warn("Parent can't be the object its self")
			return
		}
		if (newParent === this.parent) {
			console.warn("Already a parent")
			return
		}

		if (newParent.parent) {
			newParent.parent.removeFromChildren(newParent)
		}

		if (this.parent) {
			this.parent.removeFromChildren(this)
			this.parent.children.push(newParent)
		}

		newParent.parent = this.parent
		this.parent = newParent
		newParent.children.push(this)

		view.updateHierarchy()
	}

	setChild(child) {
		if (!(child instanceof GameObject)) {
			console.warn("Trying to add a child that is not a GameObject")
			return
		}
		if (child === this) {
			console.warn("Child can't be the object its self")
			return
		}
		if (this.children.indexOf(child) > -1) {
			console.warn("Child is already children")
			return
		}

		if (child.parent) {
			child.parent.removeFromChildren(child)
		}

		this.children.push(child)
		child.parent = this

		view.updateHierarchy()
	}
}
