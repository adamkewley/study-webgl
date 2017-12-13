attribute vec3 aVertex;
attribute vec3 aColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uPerspectiveMatrix;

varying vec3 vColor;

void main() {
	gl_Position = uPerspectiveMatrix * uModelViewMatrix * vec4(aVertex, 1.0);
	vColor = aColor;
}
