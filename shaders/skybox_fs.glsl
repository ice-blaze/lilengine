precision highp float;

uniform sampler2D samplerIn;

varying vec2 textureCoord;

void main(void) {
	gl_FragColor = texture2D(samplerIn, textureCoord);
}
