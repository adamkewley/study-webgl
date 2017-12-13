attribute vec3 aVertex;

uniform mat4 uModelViewMatrix;
uniform mat4 uPerspectiveMatrix;

void main() {
	gl_Position = uPerspectiveMatrix * uModelViewMatrix * vec4(aVertex, 1.0);
}
