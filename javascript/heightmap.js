import { vec3, mat4 } from "gl-matrix"
import getPixels from "get-pixels"
import assets from "./assets"
import { createProgram } from "./utils"

// TODO Inherit of gameobject
export default class Heightmap {
	constructor(gl, name = "GameObject", canvas, imageUrl) {
		this.position = vec3.fromValues(0.0, 0.0, 0.0)
		this.rotate = vec3.fromValues(0.0, 0.0, 0.0)
		this.scale = vec3.fromValues(1.0, 1.0, 1.0)
		this.loaded = false

		this.name = name

		this.children = []
		this.parent = null
		this.texture = gl.createTexture()

		this.verticesBuffer = gl.createBuffer()
		this.normals_buffer = gl.createBuffer()
		this.indicesBuffer = gl.createBuffer()

		this.gl = gl

		this.program = createProgram(gl, assets.shaders.mainShader)

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

		getPixels(imageUrl, (err, pixels) => {
			// after the image is loaded create the heightmap 3D model
			if (err) {
				console.log("Bad image path")
				return
			}

			const pix = pixels.data
			const lineCount = pixels.shape.slice()[0]
			const columnCount = pixels.shape.slice()[1]
			const colorCount = pixels.shape.slice()[2]

			const indicesMax = (columnCount - 1) * (lineCount - 1) * 6
			this.vertices = new Float32Array(indicesMax * 3)
			this.normals = new Float32Array(indicesMax * 3)
			this.indices = new Uint16Array(indicesMax)

			const sub1 = vec3.fromValues()
			const sub2 = vec3.fromValues()
			const n1 = vec3.fromValues()
			const n2 = vec3.fromValues()
			let i = 0
			let v = 0
			// loop over line
			for (let line = 0; line < lineCount - 1; line += 1) {
				// loop over column
				for (let column = 0; column < columnCount - 1; column += 1) {
					// 1-2
					// | |
					// 3-4
					const pt1 = pix[((line * columnCount) + column) * colorCount]
					const v1 = vec3.fromValues(column, pt1, line)
					const pt2 = pix[((line * columnCount) + column + 1) * colorCount]
					const v2 = vec3.fromValues(column + 1, pt2, line)
					const pt3 = pix[(((line + 1) * columnCount) + column) * colorCount]
					const v3 = vec3.fromValues(column, pt3, line + 1)
					const pt4 = pix[(((line + 1) * columnCount) + column + 1) * colorCount]
					const v4 = vec3.fromValues(column + 1, pt4, line + 1)

					// first triangle
					this.vertices[v] = v1[0]
					this.vertices[v + 1] = v1[1]
					this.vertices[v + 2] = v1[2]
					this.vertices[v + 3] = v2[0]
					this.vertices[v + 4] = v2[1]
					this.vertices[v + 5] = v2[2]
					this.vertices[v + 6] = v3[0]
					this.vertices[v + 7] = v3[1]
					this.vertices[v + 8] = v3[2]
					vec3.sub(sub1, v1, v3)
					vec3.sub(sub2, v2, v3)
					vec3.cross(n1, sub1, sub2)
					this.normals[v] = n1[0]
					this.normals[v + 1] = n1[1]
					this.normals[v + 2] = n1[2]
					this.normals[v + 3] = n1[0]
					this.normals[v + 4] = n1[1]
					this.normals[v + 5] = n1[2]
					this.normals[v + 6] = n1[0]
					this.normals[v + 7] = n1[1]
					this.normals[v + 8] = n1[2]
					v += 9

					// second triangle
					this.vertices[v] = v2[0]
					this.vertices[v + 1] = v2[1]
					this.vertices[v + 2] = v2[2]
					this.vertices[v + 3] = v3[0]
					this.vertices[v + 4] = v3[1]
					this.vertices[v + 5] = v3[2]
					this.vertices[v + 6] = v4[0]
					this.vertices[v + 7] = v4[1]
					this.vertices[v + 8] = v4[2]
					vec3.sub(sub1, v2, v3)
					vec3.sub(sub2, v4, v3)
					vec3.cross(n2, sub1, sub2)
					this.normals[v] = n2[0]
					this.normals[v + 1] = n2[1]
					this.normals[v + 2] = n2[2]
					this.normals[v + 3] = n2[0]
					this.normals[v + 4] = n2[1]
					this.normals[v + 5] = n2[2]
					this.normals[v + 6] = n2[0]
					this.normals[v + 7] = n2[1]
					this.normals[v + 8] = n2[2]
					v += 9

					// push the indices of both triangle
					this.indices[i] = i
					this.indices[i + 1] = i + 1
					this.indices[i + 2] = i + 2
					this.indices[i + 3] = i + 3
					this.indices[i + 4] = i + 4
					this.indices[i + 5] = i + 5
					i += 6

					// if (line === lineCount / 2 && column === columnCount / 2) {
					//     console.log(v1)
					//     console.log("test2")
					// }
				}
			}

			this.loaded = true
		})
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
		if (this.loaded === true) {
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
	}
}
