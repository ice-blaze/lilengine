// Load synchronously the shaders. It's slower(0.5s) but code is more readable

function loadTextFile(url) {
	const request = new XMLHttpRequest()
	request.open("GET", url, false)
	request.send()
	return request.responseText
}

const shaderFragmentSource = loadTextFile("shaders/fragment_shader.glsl")
const shaderVertexSource = loadTextFile("shaders/vertex_shader.glsl")
const skyboxFsSource = loadTextFile("shaders/skybox_fs.glsl")
const skyboxVsSource = loadTextFile("shaders/skybox_vs.glsl")
