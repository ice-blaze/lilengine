import $ from "jquery"
import ShaderSource from "../shaders/shaders"

const keys = Object.keys

const urls = {
	shaders: {
		mainShader: ["shaders/vertex_shader.glsl", "shaders/fragment_shader.glsl"],
		skybox: ["shaders/skybox_vs.glsl", "shaders/skybox_fs.glsl"],
		chromatic: ["shaders/chromatic_abberation_vs.glsl", "shaders/chromatic_abberation_fs.glsl"],
		depth: ["shaders/depth_vs.glsl", "shaders/depth_fs.glsl"],
	},
	models: {
		cube: "./models/cube.obj",
		bunny: "./models/bunny.obj",
		skybox: "./skyboxes/skybox.obj",
	},
	textures: [],
}

const assets = {
	ready: false,
}
export default assets

function checkIfAssetIsReady() {
	let result = true
	keys(urls).forEach((type) => {
		keys(urls[type]).forEach((objName) => {
			if (assets[type][objName] === null) {
				result = false
			}
		})
	})
	assets.ready = result
	return result
}

// initialize assets to ensure the waiting until each asset is loaded
keys(urls).forEach((type) => {
	keys(urls[type]).forEach((objName) => {
		if (!assets[type]) {
			assets[type] = {}
		}
		assets[type][objName] = null
	})
})

function loadShader(shaderName, shaderUrls) {
	let vertex
	let fragment

	const vRequest = $.get(shaderUrls[0], (res) => {
		vertex = res
	})
	const fRequest = $.get(shaderUrls[1], (res) => {
		fragment = res
	})
	$.when(vRequest, fRequest).done(() => {
		assets.shaders[shaderName] = new ShaderSource(shaderName, vertex, fragment)
	})
}

function loadModel(modelName, modelUrl) {
	let model

	const request = $.get(modelUrl, (res) => {
		model = res
	})
	$.when(request).done(() => {
		assets.models[modelName] = model
		checkIfAssetIsReady()
	})
}

// load shaders
keys(urls.shaders).forEach((shaderName) => {
	loadShader(shaderName, urls.shaders[shaderName])
})

// load model
keys(urls.models).forEach((modelName) => {
	loadModel(modelName, urls.models[modelName])
})
