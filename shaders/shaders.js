import { loadTextFile } from "../javascript/utils"

export const shaderFragmentSource = loadTextFile("shaders/fragment_shader.glsl")
export const shaderVertexSource = loadTextFile("shaders/vertex_shader.glsl")
export const skyboxFsSource = loadTextFile("shaders/skybox_fs.glsl")
export const skyboxVsSource = loadTextFile("shaders/skybox_vs.glsl")
