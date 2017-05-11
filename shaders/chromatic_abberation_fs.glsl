precision highp float;

uniform sampler2D samplerIn;
uniform vec2 screenSizeIn;

void main(void) {
	vec2 frac = vec2(1.) / screenSizeIn;

	vec2 rOffset = vec2(1.0, 0.0) * 2.0 * frac;
	vec2 gOffset = vec2(1.0, 0.0) * 0.0 * frac;
	vec2 bOffset = vec2(1.0, 0.0) * 2.0 * frac;

	vec2 position = gl_FragCoord.xy / screenSizeIn;

	vec4 rValue = texture2D(samplerIn, position - rOffset);
	vec4 gValue = texture2D(samplerIn, position - gOffset);
	vec4 bValue = texture2D(samplerIn, position - bOffset);

	gl_FragColor = vec4(rValue.r, gValue.g, bValue.b, 1.0);
}
