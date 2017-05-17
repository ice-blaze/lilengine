import { vec3, mat4 } from "gl-matrix"
import view from "./view"
import { removeArray, loadTextFile } from "./utils"

const OBJ = require("webgl-obj-loader")  // import are not availble

export default class GameObject {
	constructor(name = "GameObject") {
		this.name = name
		this.children = []
		this.parent = null
		this.vertices = []
		this.textures = [] // the texture UV
		this.normals = []
		this.indices = []
		this.texture = null // the image texture
		this.position = vec3.fromValues(0.0, 0.0, 0.0)
		this.rotate = vec3.fromValues(0.0, 0.0, 0.0)
		this.scale = vec3.fromValues(1.0, 1.0, 1.0)
		this.gl = null
	}

	static create(gl, path, name = "name") {
		const object = new GameObject()
		const file = loadTextFile(path)
		const objMesh = new OBJ.Mesh(file)

		object.name = name

		object.vertices = objMesh.vertices
		object.textures = objMesh.textures
		object.indices = objMesh.indices
		object.normals = objMesh.vertexNormals

		object.gl = gl

		return object
	}

	initBuffers() {
		const gl = this.gl
		this.verticesBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)
		this.normals_buffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normals_buffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW)
		this.indicesBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW)
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

	setShaderProgram(program) {
		this.program = program
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

	draw() {
		const gl = this.gl

		const mvMatrix = this.modelMatrix()
		const normalMatrix = mat4.create()
		mat4.invert(normalMatrix, mvMatrix)
		mat4.transpose(normalMatrix, normalMatrix)
		this.normal_matrix_in = gl.getUniformLocation(this.program, "normalMatrix")
		gl.uniformMatrix4fv(this.normal_matrix_in, false, normalMatrix)
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
	}
}
