precision highp float;

attribute vec3 coordinate;
attribute vec3 normal;

uniform mat4 mv_matrix;
uniform mat4 normal_matrix;
uniform mat4 p_matrix;
uniform vec3 global_light_in;

varying vec3 v_normal;
varying vec3 v_lighting;

void main() {
	gl_Position = p_matrix * mv_matrix * vec4(coordinate, 1.0);
	v_normal = normal;
	vec3 ambientLight = vec3(0.6, 0.6, 0.6);
	vec3 directionalLightColor = vec3(0.5, 0.5, 0.75);
	vec3 directionalVector = global_light_in;

	vec4 transformedNormal = normal_matrix * vec4(normal, 1.0);
	float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
	v_lighting = ambientLight + (directionalLightColor * directional);
}
