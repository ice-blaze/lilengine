precision highp float;

attribute vec3 coordinate;
attribute vec3 normal;

uniform mat4 mvMatrix;
uniform mat4 normalMatrix;
uniform mat4 pMatrix;
uniform vec3 globalLightIn;

varying vec3 vNormal;
varying vec3 vLighting;

void main() {
	gl_Position = pMatrix * mvMatrix * vec4(coordinate, 1.0);
	vNormal = normal;
	vec3 ambientLight = vec3(0.6, 0.6, 0.6);
	vec3 directionalLightColor = vec3(0.5, 0.5, 0.75);
	vec3 directionalVector = globalLightIn;

	vec4 transformedNormal = normalMatrix * vec4(normal, 1.0);
	float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
	vLighting = ambientLight + (directionalLightColor * directional);
}
