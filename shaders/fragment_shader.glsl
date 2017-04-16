precision highp float;

uniform float globalTimeIn;
uniform vec2 screenSizeIn;

varying vec3 vLighting;
varying vec3 vNormal;

void main(void) {
	gl_FragColor = vec4(vLighting, 1.);
}
