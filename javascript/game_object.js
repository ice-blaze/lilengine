class GameObject {
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
		this.GL = null
	}

	static create(GL, path, name = "name") {
		const object = new GameObject()
		const file = loadTextFile(path)
		const objMesh = new OBJ.Mesh(file)

		object.name = name

		object.vertices = objMesh.vertices
		object.textures = objMesh.textures
		object.indices = objMesh.indices
		object.normals = objMesh.vertexNormals

		object.GL = GL

		return object
	}

	initBuffers() {
		const GL = this.GL
		this.vertices_buffer = GL.createBuffer()
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertices_buffer)
		GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.STATIC_DRAW)
		this.normals_buffer = GL.createBuffer()
		GL.bindBuffer(GL.ARRAY_BUFFER, this.normals_buffer)
		GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.normals), GL.STATIC_DRAW)
		this.indices_buffer = GL.createBuffer()
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indices_buffer)
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), GL.STATIC_DRAW)
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

		view.update_hierarchy()
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

		view.update_hierarchy()
	}

	draw() {
		const GL = this.GL

		const mvMatrix = this.modelMatrix()
		let normal_matrix = mat4.create()
		mat4.invert(normal_matrix, mvMatrix)
		mat4.transpose(normal_matrix, normal_matrix)
		this.normal_matrix_in = GL.getUniformLocation(this.program, "normal_matrix")
		GL.uniformMatrix4fv(this.normal_matrix_in, false, normal_matrix)
		this.mv_matrix_in = GL.getUniformLocation(this.program, "mvMatrix")
		GL.uniformMatrix4fv(this.mv_matrix_in, false, mvMatrix)
		this.normal_in = GL.getAttribLocation(this.program, "normal")
		GL.enableVertexAttribArray(this.normal_in)
		GL.bindBuffer(GL.ARRAY_BUFFER, this.normals_buffer)
		GL.vertexAttribPointer(this.normal_in, 3, GL.FLOAT, false, 0, 0)
		this.coord_in = GL.getAttribLocation(this.program, "coordinate")
		GL.enableVertexAttribArray(this.coord_in)
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertices_buffer)
		GL.vertexAttribPointer(this.coord_in, 3, GL.FLOAT, false, 0, 0)
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indices_buffer)

		GL.drawElements(GL.TRIANGLES, this.indices.length, GL.UNSIGNED_SHORT, 0)
	}
}
