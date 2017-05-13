import { loadTextFile } from "../javascript/utils"

class ShaderSource {
	constructor(name, vsSourcePath, fsSourcePath) {
		this.name = name
		this.vsSource = loadTextFile(vsSourcePath)
		this.fsSource = loadTextFile(fsSourcePath)
	}
}

export const shaderSource = new ShaderSource("mainShader", "shaders/vertex_shader.glsl", "shaders/fragment_shader.glsl")

export const skyboxSource = new ShaderSource("skybox", "shaders/skybox_vs.glsl", "shaders/skybox_fs.glsl")

export const chromaticSource = new ShaderSource("chromatic", "shaders/chromatic_abberation_vs.glsl", "shaders/chromatic_abberation_fs.glsl")
