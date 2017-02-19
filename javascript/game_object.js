class GameObject {
	constructor(name="GameObject") {
		this.name = name
		this.children = []
		this.parent = null
		this.vertices = []
		this.textures = [] // the texture UV
		this.normals = []
		this.indices = []
		this.texture = null // the image texture
		this.transpose = vec3.fromValues(0.0, 0.0, 0.0)
		this.rotate = vec3.fromValues(0.0, 0.0, 0.0)
		this.scale = vec3.fromValues(1.0, 1.0, 1.0)
		this.GL = null
	}

	static create(GL, path, name="name") {
		const object = new GameObject()
		const file = loadTextFile("./models/cube.obj")
		const obj_mesh = new OBJ.Mesh(file)

		object.name = name

		object.vertices = obj_mesh.vertices
		object.textures = obj_mesh.textures
		object.indices = obj_mesh.indices
		object.normals = obj_mesh.vertexNormals

		object.GL = GL

		return object
	}

	init_buffers() {
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

	model_matrix() {
		let model = mat4.create()
		if (this.parent) {
			model = this.parent.model_matrix()
		}
		mat4.translate(model, model, this.transpose)
		mat4.rotateX(model, model, this.rotate[0])
		mat4.rotateY(model, model, this.rotate[1])
		mat4.rotateZ(model, model, this.rotate[2])
		mat4.scale(model, model, this.scale)

		return model
	}

	set_shader_program(program) {
		this.program = program
	}

	remove_from_children(object) {
		remove_array(this.children, object)
	}

	set_parent(new_parent) {
		if (!new_parent instanceof GameObject) {
			console.warn('Trying to set a parent that is not a GameObject')
			return
		}
		if (new_parent === this) {
			console.warn("Parent can't be the object its self")
			return
		}
		if (new_parent === this.parent) {
			console.warn("Already a parent")
			return
		}

		if (new_parent.parent) {
			new_parent.parent.remove_from_children(new_parent)
		}

		if (this.parent) {
			this.parent.remove_from_children(this)
			this.parent.children.push(new_parent)
		}

		new_parent.parent = this.parent
		this.parent = new_parent
		new_parent.children.push(this)
	}

	set_child(child) {
		if (!child instanceof GameObject) {
			console.warn('Trying to add a child that is not a GameObject')
			return
		}
		if (child === this) {
			console.warn("Child can't be the object its self")
			return
		}
		if (this.children.indexOf(child) > -1) {
			console.log(this.children.indexOf(child))
			console.warn("Child is already children")
			return
		}

		if (child.parent) {
			child.parent.remove_from_children(child)
		}

		this.children.push(child)
		child.parent = this
	}

	draw() {
		const GL = this.GL

		this.mv_matrix_in = GL.getUniformLocation(this.program, "mv_matrix")
		GL.uniformMatrix4fv(this.mv_matrix_in, false, this.model_matrix())
		this.normal_in = GL.getAttribLocation(this.program, "normal")
		GL.enableVertexAttribArray(this.normal_in)
		GL.bindBuffer(GL.ARRAY_BUFFER, this.normals_buffer);
		GL.vertexAttribPointer(this.normal_in, 3, GL.FLOAT, false, 0, 0);
		this.coord_in = GL.getAttribLocation(this.program, "coordinate")
		GL.enableVertexAttribArray(this.coord_in)
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertices_buffer)
		GL.vertexAttribPointer(this.coord_in, 3, GL.FLOAT, false, 0, 0)
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indices_buffer)

		GL.drawElements(GL.TRIANGLES, this.indices.length, GL.UNSIGNED_SHORT, 0)

	}
}