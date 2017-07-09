import { vec3, mat4 } from "gl-matrix"
import getPixels from "get-pixels"
import assets from "./assets"
import { createProgram } from "./utils"
import Hierarchy from "./hierarchy"

export default class Heightmap extends Hierarchy {
	constructor(gl, name = "GameObject", canvas, imageUrl, camera) {
		super(name)
		this.loaded = false

		this.camera = camera

		this.children = []
		this.parent = null
		this.texture = gl.createTexture()

		this.verticesBuffer = gl.createBuffer()
		this.normalsBuffer = gl.createBuffer()
		this.indicesBuffer = gl.createBuffer()

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
		this.normalIn = gl.getAttribLocation(this.program, "normal")
		this.coordIn = gl.getAttribLocation(this.program, "coordinate")
		this.normalMatrixIn = gl.getUniformLocation(this.program, "normalMatrix")
		this.mvMatrixIn = gl.getUniformLocation(this.program, "mvMatrix")

		this.normalMatrix = mat4.create()

		getPixels(imageUrl, (err, pixels) => {
			// after the image is loaded create the heightmap 3D model
			if (err) {
				console.log("Bad image path")
				return
			}

			const pix = pixels.data
			const columnCount = pixels.shape.slice()[0]
			const lineCount = pixels.shape.slice()[1]
			const colorCount = pixels.shape.slice()[2]
			const halfColumn = columnCount / 2
			const halfLine = lineCount / 2
			const maxVerticesArray = 65536

			const indicesMax = (columnCount - 1) * (lineCount - 1) * 6
			this.verticesPack = []
			this.normalsPack = []
			this.indicesPack = []

			// because an height map have a lot of vertices, we have to split it into multiple vertices
			// objects
			for (let i = 0; i < Math.ceil((indicesMax * 3) / maxVerticesArray); i += 1) {
				this.verticesPack.push(new Float32Array(indicesMax * 3))
				this.normalsPack.push(new Float32Array(indicesMax * 3))
				this.indicesPack.push(new Uint16Array(indicesMax))
			}

			const sub1 = vec3.fromValues()
			const sub2 = vec3.fromValues()
			const n1 = vec3.fromValues()
			const n2 = vec3.fromValues()
			let i = 0  // indices index
			let v = 0  // vertices index
			let packIdx = 0  // current "pack" of the height map
			// loop over line
			for (let line = 0; line < lineCount - 1; line += 1) {
				// loop over column
				for (let column = 0; column < columnCount - 1; column += 1) {
					if (v + 18 > maxVerticesArray - 1) {
						packIdx += 1
						i = 0
						v = 0
					}
					// 1-2
					// | |
					// 3-4
					const pt1 = pix[((line * columnCount) + column) * colorCount]
					const v1 = vec3.fromValues(column - halfColumn, pt1, line - halfColumn)
					const pt2 = pix[((line * columnCount) + column + 1) * colorCount]
					const v2 = vec3.fromValues((column - halfColumn) + 1, pt2, line - halfLine)
					const pt3 = pix[(((line + 1) * columnCount) + column) * colorCount]
					const v3 = vec3.fromValues(column - halfColumn, pt3, (line - halfLine) + 1)
					const pt4 = pix[(((line + 1) * columnCount) + column + 1) * colorCount]
					const v4 = vec3.fromValues((column - halfColumn) + 1, pt4, (line - halfLine) + 1)

					// first triangle
					this.verticesPack[packIdx][v] = v1[0]
					this.verticesPack[packIdx][v + 1] = v1[1]
					this.verticesPack[packIdx][v + 2] = v1[2]
					this.verticesPack[packIdx][v + 3] = v2[0]
					this.verticesPack[packIdx][v + 4] = v2[1]
					this.verticesPack[packIdx][v + 5] = v2[2]
					this.verticesPack[packIdx][v + 6] = v3[0]
					this.verticesPack[packIdx][v + 7] = v3[1]
					this.verticesPack[packIdx][v + 8] = v3[2]
					vec3.sub(sub1, v1, v3)
					vec3.sub(sub2, v2, v3)
					vec3.cross(n1, sub1, sub2)
					this.normalsPack[packIdx][v] = n1[0]
					this.normalsPack[packIdx][v + 1] = n1[1]
					this.normalsPack[packIdx][v + 2] = n1[2]
					this.normalsPack[packIdx][v + 3] = n1[0]
					this.normalsPack[packIdx][v + 4] = n1[1]
					this.normalsPack[packIdx][v + 5] = n1[2]
					this.normalsPack[packIdx][v + 6] = n1[0]
					this.normalsPack[packIdx][v + 7] = n1[1]
					this.normalsPack[packIdx][v + 8] = n1[2]
					v += 9

					// second triangle
					this.verticesPack[packIdx][v] = v2[0]
					this.verticesPack[packIdx][v + 1] = v2[1]
					this.verticesPack[packIdx][v + 2] = v2[2]
					this.verticesPack[packIdx][v + 3] = v3[0]
					this.verticesPack[packIdx][v + 4] = v3[1]
					this.verticesPack[packIdx][v + 5] = v3[2]
					this.verticesPack[packIdx][v + 6] = v4[0]
					this.verticesPack[packIdx][v + 7] = v4[1]
					this.verticesPack[packIdx][v + 8] = v4[2]
					vec3.sub(sub1, v2, v3)
					vec3.sub(sub2, v4, v3)
					vec3.cross(n2, sub1, sub2)
					this.normalsPack[packIdx][v] = n2[0]
					this.normalsPack[packIdx][v + 1] = n2[1]
					this.normalsPack[packIdx][v + 2] = n2[2]
					this.normalsPack[packIdx][v + 3] = n2[0]
					this.normalsPack[packIdx][v + 4] = n2[1]
					this.normalsPack[packIdx][v + 5] = n2[2]
					this.normalsPack[packIdx][v + 6] = n2[0]
					this.normalsPack[packIdx][v + 7] = n2[1]
					this.normalsPack[packIdx][v + 8] = n2[2]
					v += 9

					// push the indices of both triangle
					this.indicesPack[packIdx][i] = i
					this.indicesPack[packIdx][i + 1] = i + 1
					this.indicesPack[packIdx][i + 2] = i + 2
					i += 3
					this.indicesPack[packIdx][i] = i
					this.indicesPack[packIdx][i + 1] = i + 1
					this.indicesPack[packIdx][i + 2] = i + 2
					i += 3
				}
			}

			this.loaded = true
		})
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

			const mvMatrix = this.modelMatrix()
			mat4.invert(this.normalMatrix, mvMatrix)
			mat4.transpose(this.normalMatrix, this.normalMatrix)
			gl.uniformMatrix4fv(this.normalMatrixIn, false, this.normalMatrix)
			gl.uniformMatrix4fv(this.mvMatrixIn, false, mvMatrix)

			// loop over packs to draw each part of the height map
			for (let i = 0; i < this.verticesPack.length - 1; i += 1) {
				gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer)
				gl.bufferData(gl.ARRAY_BUFFER, this.verticesPack[i], gl.STATIC_DRAW)
				gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer)
				gl.bufferData(gl.ARRAY_BUFFER, this.normalsPack[i], gl.STATIC_DRAW)
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer)
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indicesPack[i], gl.STATIC_DRAW)

				gl.enableVertexAttribArray(this.normalIn)
				gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer)
				gl.vertexAttribPointer(this.normalIn, 3, gl.FLOAT, false, 0, 0)
				gl.enableVertexAttribArray(this.coordIn)
				gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer)
				gl.vertexAttribPointer(this.coordIn, 3, gl.FLOAT, false, 0, 0)
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer)

				gl.drawElements(gl.TRIANGLES, this.indicesPack[i].length, gl.UNSIGNED_SHORT, 0)
			}

			gl.flush()
		}
	}
}
