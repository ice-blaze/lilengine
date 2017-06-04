precision highp float;

uniform sampler2D colorTextureIn;
uniform sampler2D depthTextureIn;
uniform vec2 screenSizeIn;

// TODO thoses variable are not used yet
uniform float uNear;
uniform float uFar;

void main(void) {
	vec2 frac = vec2(1.) / screenSizeIn;

	vec2 position = gl_FragCoord.xy / screenSizeIn;

	float depth = texture2D(depthTextureIn, position).x;
	// TODO world near and world far
	float n = 1.0;
	float f = 2000.0;
	float dist = (2.0 * n) / (f + n - depth * (f - n));

	float k00 = mix(0.0, 0.1, dist); float k01 = mix(0.0, 0.1, dist); float k02 = mix(0.0, 0.1, dist);
	float k10 = mix(0.0, 0.1, dist); float k11 = mix(1.0, 0.2, dist); float k12 = mix(0.0, 0.1, dist);
	float k20 = mix(0.0, 0.1, dist); float k21 = mix(0.0, 0.1, dist); float k22 = mix(0.0, 0.1, dist);

	vec4 color = texture2D(colorTextureIn, position);
	vec3 c00 = texture2D(colorTextureIn, position + vec2(-1., -1.) * frac).xyz;
	vec3 c01 = texture2D(colorTextureIn, position + vec2( 0., -1.) * frac).xyz;
	vec3 c02 = texture2D(colorTextureIn, position + vec2( 1., -1.) * frac).xyz;
	vec3 c10 = texture2D(colorTextureIn, position + vec2(-1.,  0.) * frac).xyz;
	vec3 c11 = texture2D(colorTextureIn, position + vec2( 0.,  0.) * frac).xyz;
	vec3 c12 = texture2D(colorTextureIn, position + vec2( 1.,  0.) * frac).xyz;
	vec3 c20 = texture2D(colorTextureIn, position + vec2(-1.,  1.) * frac).xyz;
	vec3 c21 = texture2D(colorTextureIn, position + vec2( 0.,  1.) * frac).xyz;
	vec3 c22 = texture2D(colorTextureIn, position + vec2( 1.,  1.) * frac).xyz;
	vec3 finalColor = vec3(0.0);
	finalColor += c00 * k00;
	finalColor += c01 * k01;
	finalColor += c02 * k02;
	finalColor += c10 * k10;
	finalColor += c11 * k11;
	finalColor += c12 * k12;
	finalColor += c20 * k20;
	finalColor += c21 * k21;
	finalColor += c22 * k22;

	gl_FragColor = vec4(finalColor, 1.0);
}
