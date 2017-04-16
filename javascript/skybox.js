class SkyBox {
	constructor(name = "GameObject") {
		this.name = name
		this.vertices = []
		this.textures = [] // the texture UV
		this.indices = []
		this.position = vec3.fromValues(0.0, 0.0, 0.0)
		this.rotate = vec3.fromValues(0.0, 0.0, 0.0)
		this.scale = vec3.fromValues(1.0, 1.0, 1.0)
		this.GL = null
	}

	static create(GL, name = "name") {
		const skybox = new SkyBox()
		const file = loadTextFile("./skyboxes/skybox.obj")
		const skybox_mesh = new OBJ.Mesh(file)

		skybox.name = name

		skybox.vertices = skybox_mesh.vertices
		skybox.textures = skybox_mesh.textures
		skybox.indices = skybox_mesh.indices

		skybox.GL = GL

		skybox.texture = GL.createTexture()
		skybox.image = new Image()
		skybox.image.onload = function () {
			GL.bindTexture(GL.TEXTURE_2D, skybox.texture);
			GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, skybox.image);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
			GL.bindTexture(GL.TEXTURE_2D, null);
		}
		skybox.image.src = './skyboxes/default.png'

		return skybox
	}

	init_buffers() {
		const GL = this.GL
		this.vertices_buffer = GL.createBuffer()
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertices_buffer)
		GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.STATIC_DRAW)
		this.texture_buffer = GL.createBuffer()
		GL.bindBuffer(GL.ARRAY_BUFFER, this.texture_buffer)
		GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.textures), GL.STATIC_DRAW)
		this.indices_buffer = GL.createBuffer()
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indices_buffer)
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), GL.STATIC_DRAW)
	}

	model_matrix() {
		let model = mat4.create()
		if (this.parent) {
			model = this.parent.model_matrix()
		}
		mat4.translate(model, model, this.position)
		mat4.rotateX(model, model, this.rotate[0])
		mat4.rotateY(model, model, this.rotate[1])
		mat4.rotateZ(model, model, this.rotate[2])
		mat4.scale(model, model, this.scale)

		return model
	}

	set_shader_program(program) {
		this.program = program
	}

	draw() {
		const GL = this.GL

		GL.activeTexture(GL.TEXTURE0);
		GL.bindTexture(GL.TEXTURE_2D, this.texture);
		GL.uniform1i(GL.getUniformLocation(this.program, 'sampler_in'), 0);

		this.mv_matrix_in = GL.getUniformLocation(this.program, "mv_matrix")
		GL.uniformMatrix4fv(this.mv_matrix_in, false, this.model_matrix())

		this.coord_in = GL.getAttribLocation(this.program, "coordinate")
		GL.enableVertexAttribArray(this.coord_in)
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertices_buffer)
		GL.vertexAttribPointer(this.coord_in, 3, GL.FLOAT, false, 0, 0)

		this.texture_in = GL.getAttribLocation(this.program, "uv")
		GL.enableVertexAttribArray(this.texture_in)
		GL.bindBuffer(GL.ARRAY_BUFFER, this.texture_buffer)
		GL.vertexAttribPointer(this.texture_in, 2, GL.FLOAT, false, 0, 0)

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indices_buffer)

		GL.drawElements(GL.TRIANGLES, this.indices.length, GL.UNSIGNED_SHORT, 0)
	}
}