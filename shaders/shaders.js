import { loadTextFile } from "../javascript/utils"

export const shaderFragmentSource = loadTextFile("shaders/fragment_shader.glsl")
export const shaderVertexSource = loadTextFile("shaders/vertex_shader.glsl")
export const skyboxFsSource = loadTextFile("shaders/skybox_fs.glsl")
export const skyboxVsSource = loadTextFile("shaders/skybox_vs.glsl")

export const chromaticAberrationVsSource = loadTextFile("shaders/chromatic_abberation_vs.glsl")
export const chromaticAberrationFsSource = loadTextFile("shaders/chromatic_abberation_fs.glsl")
