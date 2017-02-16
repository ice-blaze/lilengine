attribute vec3 coordinates;

uniform mat4 mv_matrix;
uniform mat4 p_matrix;

void main() {
  gl_Position = p_matrix * mv_matrix * vec4(coordinates, 1.0);
}
