precision highp float;

attribute vec3 coordinate;
attribute vec2 uv;

uniform sampler2D samplerIn;
uniform mat4 mvMatrix;
uniform mat4 pMatrix;

varying vec2 textureCoord;

void main() {
	textureCoord = uv;
	gl_Position = pMatrix * mvMatrix * vec4(coordinate, 1.0);
}
