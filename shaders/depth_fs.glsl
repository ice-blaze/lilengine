precision highp float;

uniform sampler2D colorTextureIn;
uniform sampler2D depthTextureIn;
uniform vec2 screenSizeIn;

uniform float uNear;
uniform float uFar;

void main(void) {
	vec2 frac = vec2(1.) / screenSizeIn;

	float k00 = 0.1; float k01 = 0.1; float k02 = 0.1;
	float k10 = 0.1; float k11 = 0.2; float k12 = 0.1;
	float k20 = 0.1; float k21 = 0.1; float k22 = 0.1;

	vec2 position = gl_FragCoord.xy / screenSizeIn;

	vec4 test = texture2D(depthTextureIn, position);
	/* vec4 test = texture2D(colorTextureIn, position); */
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

	gl_FragColor = vec4(vec3(test.r), 1.0);
}
