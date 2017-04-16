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
		const skyboxMesh = new OBJ.Mesh(file)

		skybox.name = name

		skybox.vertices = skyboxMesh.vertices
		skybox.textures = skyboxMesh.textures
		skybox.indices = skyboxMesh.indices

		skybox.GL = GL

		skybox.texture = GL.createTexture()
		skybox.image = new Image()
		skybox.image.onload = function () {
			GL.bindTexture(GL.TEXTURE_2D, skybox.texture)
			GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, skybox.image)
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR)
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR)
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE)
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE)
			GL.bindTexture(GL.TEXTURE_2D, null)
		}
		skybox.image.src = "./skyboxes/default.png"

		return skybox
	}

	initBuffers() {
		const GL = this.GL
		this.vertices_buffer = GL.createBuffer()
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertices_buffer)
		GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.STATIC_DRAW)
		this.textureBuffer = GL.createBuffer()
		GL.bindBuffer(GL.ARRAY_BUFFER, this.textureBuffer)
		GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.textures), GL.STATIC_DRAW)
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

	draw() {
		const GL = this.GL

		GL.activeTexture(GL.TEXTURE0)
		GL.bindTexture(GL.TEXTURE_2D, this.texture)
		GL.uniform1i(GL.getUniformLocation(this.program, "samplerIn"), 0)

		this.mvMatrix = GL.getUniformLocation(this.program, "mvMatrix")
		GL.uniformMatrix4fv(this.mvMatrix, false, this.modelMatrix())

		this.coordIn = GL.getAttribLocation(this.program, "coordinate")
		GL.enableVertexAttribArray(this.coordIn)
		GL.bindBuffer(GL.ARRAY_BUFFER, this.vertices_buffer)
		GL.vertexAttribPointer(this.coordIn, 3, GL.FLOAT, false, 0, 0)

		this.textureIn = GL.getAttribLocation(this.program, "uv")
		GL.enableVertexAttribArray(this.textureIn)
		GL.bindBuffer(GL.ARRAY_BUFFER, this.textureBuffer)
		GL.vertexAttribPointer(this.textureIn, 2, GL.FLOAT, false, 0, 0)

		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indices_buffer)

		GL.drawElements(GL.TRIANGLES, this.indices.length, GL.UNSIGNED_SHORT, 0)
	}
}
