precision highp float;

attribute vec3 coordinate;
attribute vec2 uv;

uniform sampler2D sampler_in;
uniform mat4 mvMatrix;
uniform mat4 p_matrix;

varying vec2 texture_coord;

void main() {
	texture_coord = uv;
	gl_Position = p_matrix * mvMatrix * vec4(coordinate, 1.0);
}
