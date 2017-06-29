import { vec3, mat4 } from "gl-matrix"
import getPixels from "get-pixels"
// import { OBJ } from "webgl-obj-loader"
import assets from "./assets"
import { createProgram } from "./utils"

const OBJ = require("webgl-obj-loader")

export default class Heightmap {
	constructor(gl, name = "GameObject", canvas, imageUrl) {
		this.position = vec3.fromValues(0.0, 0.0, 0.0)
		this.rotate = vec3.fromValues(0.0, 0.0, 0.0)
		this.scale = vec3.fromValues(1.0, 1.0, 1.0)
		this.loaded = false

		// const file = assets.models.skybox
		// const skyboxMesh = new OBJ.Mesh(file)

		this.name = name

		// this.vertices = skyboxMesh.vertices
		// this.textures = skyboxMesh.textures
		// this.indices = skyboxMesh.indices

		this.gl = gl

		this.texture = gl.createTexture()
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
		function getFormattedDate() {
			var date = new Date();

			var month = date.getMonth() + 1;
			var day = date.getDate();
			var hour = date.getHours();
			var min = date.getMinutes();
			var sec = date.getSeconds();

			month = (month < 10 ? "0" : "") + month;
			day = (day < 10 ? "0" : "") + day;
			hour = (hour < 10 ? "0" : "") + hour;
			min = (min < 10 ? "0" : "") + min;
			sec = (sec < 10 ? "0" : "") + sec;

			var str = date.getFullYear() + "-" + month + "-" + day + "_" +  hour + ":" + min + ":" + sec;

			/*alert(str);*/

			return str;
		}
		getPixels(imageUrl, (err, pixels) => {
			if (err) {
				console.log("Bad image path")
				return
			}
			// TODO iterate two lines by two lines
			console.log("got pixels", pixels.shape.slice())
			const pix = pixels.data
			const lineCount = pixels.shape.slice()[0]
			const columnCount = pixels.shape.slice()[1]
			const colorCount = pixels.shape.slice()[2]
			// TODO two line by two line
			for (let line = 0; line < lineCount - 1; line += 1) {
				// TODO 2x2 squares to create 2 triangles and pushing them into the vertices and indices
				for (let column = 0; column < columnCount - 1; column += 1) {
					console.log("test")
				}
			}
		})

		// this.program = createProgram(gl, assets.shaders.skybox)
		// this.pMatrixInSkybox = gl.getUniformLocation(this.program, "pMatrix")
		// this.pSkyboxMatrix = mat4.create()
		// mat4.perspective(this.pSkyboxMatrix, 80, canvas.width / canvas.height, 0.1, 1000000.0)
		// this.verticesBuffer = gl.createBuffer()
		// this.textureBuffer = gl.createBuffer()
		// this.indicesBuffer = gl.createBuffer()
	}

	modelMatrix() {
		// let model = mat4.create()
		// if (this.parent) {
		//     model = this.parent.modelMatrix()
		// }
		// mat4.translate(model, model, this.position)
		// mat4.rotateX(model, model, this.rotate[0])
		// mat4.rotateY(model, model, this.rotate[1])
		// mat4.rotateZ(model, model, this.rotate[2])
		// mat4.scale(model, model, this.scale)

		// return model
	}

	draw() {
		// const gl = this.gl

		// gl.useProgram(this.program)

		// gl.uniformMatrix4fv(this.pMatrixInSkybox, false, this.pSkyboxMatrix)
		// // // this..rotate[1] = 4 * Math.sin(time / 1000)

		// gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer)
		// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)
		// gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer)
		// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textures), gl.STATIC_DRAW)
		// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer)
		// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW)

		// gl.activeTexture(gl.TEXTURE0)
		// gl.bindTexture(gl.TEXTURE_2D, this.texture)
		// gl.uniform1i(gl.getUniformLocation(this.program, "samplerIn"), 0)

		// this.mvMatrix = gl.getUniformLocation(this.program, "mvMatrix")
		// gl.uniformMatrix4fv(this.mvMatrix, false, this.modelMatrix())

		// this.coordIn = gl.getAttribLocation(this.program, "coordinate")
		// gl.enableVertexAttribArray(this.coordIn)
		// gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer)
		// gl.vertexAttribPointer(this.coordIn, 3, gl.FLOAT, false, 0, 0)

		// this.textureIn = gl.getAttribLocation(this.program, "uv")
		// gl.enableVertexAttribArray(this.textureIn)
		// gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer)
		// gl.vertexAttribPointer(this.textureIn, 2, gl.FLOAT, false, 0, 0)

		// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer)

		// gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0)
	}
}
