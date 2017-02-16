attribute vec3 coordinate;
attribute vec3 normal;

uniform mat4 mv_matrix;
uniform mat4 p_matrix;

varying vec3 v_normal;

void main() {
  v_normal = normal;
  gl_Position = p_matrix * mv_matrix * vec4(coordinate, 1.0);
}
