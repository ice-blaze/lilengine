precision highp float;

uniform float global_time_in;
uniform vec2 screen_size_in;

varying vec3 v_lighting;
varying vec3 v_normal;

void main(void) {
	// gl_FragColor = vec4((vec3(1.) + v_normal) /vec3(2.), 1.);
	gl_FragColor = vec4(v_lighting, 1.);
}
