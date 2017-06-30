import { vec3, mat4 } from "gl-matrix"
import getPixels from "get-pixels"
import assets from "./assets"
import { createProgram } from "./utils"

const OBJ = require("webgl-obj-loader")  // import are not availble

export default class Heightmap {
	constructor(gl, name = "GameObject", canvas, imageUrl) {
		this.position = vec3.fromValues(0.0, 0.0, 0.0)
		this.rotate = vec3.fromValues(0.0, 0.0, 0.0)
		this.scale = vec3.fromValues(1.0, 1.0, 1.0)
		this.loaded = false

		this.name = name

		this.gl = gl

		this.children = []
		this.parent = null
		this.texture = gl.createTexture()

		this.verticesBuffer = gl.createBuffer()
		this.normals_buffer = gl.createBuffer()
		this.indicesBuffer = gl.createBuffer()

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

		// this.image = new Image()
		// this.image.onload = () => {
		//     console.log(this.image.getImageData(1,1,1,1)) // gl.bindTexture(gl.TEXTURE_2D, this.texture)
		//     // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image)
		//     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		//     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		//     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		//     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		//     // gl.bindTexture(gl.TEXTURE_2D, null)
		// }
		// this.image.src = imageUrl

		// getPixels(imageUrl, (err, pixels) => {
		//     // after the image is loaded create the heightmap 3D model
		//     if (err) {
		//         console.log("Bad image path")
		//         return
		//     }

		//     const pix = pixels.data
		//     const lineCount = pixels.shape.slice()[0]
		//     const columnCount = pixels.shape.slice()[1]
		//     const colorCount = pixels.shape.slice()[2]

		//     // TODO would be better to no use push
		//     // const indicesMax = (columnCount - 1) * (lineCount - 1) * 6
		//     // this.vertices = new Float32Array(indicesMax * 3)
		//     // this.normals = new Float32Array(indicesMax * 3)
		//     // this.indices = new Uint16Array(indicesMax)
		//     this.vertices = []
		//     this.normals = []
		//     this.indices = []

		//     // TODO iterate two lines by two lines
		//     console.log("got pixels", pixels.shape.slice())
		//     // for (let i = 0; i < pix.length; i += 1) {


		//     // }
		//     let i = 0
		//     // loop over line
		//     for (let line = 0; line < lineCount - 1; line += 1) {
		//         // loop over column
		//         for (let column = 0; column < columnCount - 1; column += 1) {
		//             // 1-2
		//             // | |
		//             // 3-4
		//             const pt1 = pix[((line * columnCount) + column) * colorCount]
		//             const v1 = vec3.fromValues(column, 0 [> pt1 <], line)
		//             const pt2 = pix[((line * columnCount) + column + 1) * colorCount]
		//             const v2 = vec3.fromValues(column + 1, 0 [> pt2 <], line)
		//             const pt3 = pix[(((line + 1) * columnCount) + column) * colorCount]
		//             const v3 = vec3.fromValues(column, 0 [> pt3 <], line + 1)
		//             const pt4 = pix[(((line + 1) * columnCount) + column + 1) * colorCount]
		//             const v4 = vec3.fromValues(column + 1, 0 [> pt4 <], line + 1)

		//             // first triangle
		//             this.vertices.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z)
		//             const n1 = vec3.fromValues()
		//             const sub1 = vec3.fromValues()
		//             const sub2 = vec3.fromValues()
		//             vec3.sub(sub1, v2, v3)
		//             vec3.sub(sub2, v1, v3)
		//             vec3.cross(n1, sub1, sub2)
		//             this.normals.push(n1.x, n1.y, n1.z, n1.x, n1.y, n1.z, n1.x, n1.y, n1.z)

		//             // second triangle
		//             this.vertices.push(v2.x, v2.y, v2.z, v3.x, v3.y, v3.z, v4.x, v4.y, v4.z)
		//             const n2 = vec3.fromValues()
		//             vec3.sub(sub1, v4, v3)
		//             vec3.sub(sub2, v2, v3)
		//             vec3.cross(n2, sub1, sub2)
		//             this.normals.push(n2.x, n2.y, n2.z, n2.x, n2.y, n2.z, n2.x, n2.y, n2.z)

		//             // push the indices of both triangle
		//             this.indices.push(i, i + 1, i + 2, i + 3, i + 4, i + 5)
		//             i += 6

		//             if (line === lineCount / 2 && column === columnCount / 2) {
		//                 console.log(v1)
		//                 console.log("test2")
		//             }
		//         }
		//     }
		//     console.log("loop finished")

		//     // TODO remove when Float32Array are used as default
		//     this.vertices = new Float32Array(this.vertices)
		//     this.normals = new Float32Array(this.normals)
		//     this.indices = new Uint16Array(this.indices)

		//     this.loaded = true
		// })
		const objMesh = new OBJ.Mesh(assets.models.cube)

		this.vertices = new Float32Array(objMesh.vertices)
		this.indices = new Uint16Array(objMesh.indices)
		this.normals = new Float32Array(objMesh.vertexNormals)
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

			console.log(this.normals.length)

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
