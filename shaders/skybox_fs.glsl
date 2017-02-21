precision highp float;

uniform sampler2D sampler_in;

varying vec2 texture_coord;

void main(void) {
	gl_FragColor = texture2D(sampler_in, texture_coord);
}
