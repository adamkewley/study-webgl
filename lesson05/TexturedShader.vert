attribute vec3 aEntityVertex;
attribute vec2 aTextureCoordinate;

uniform mat4 uPerspectiveMatrix;
uniform mat4 uModelViewMatrix;

varying vec2 vTextureCoordinate;

void main() {
	gl_Position = uPerspectiveMatrix * uModelViewMatrix * vec4(aEntityVertex, 1.0);
	vTextureCoordinate = aTextureCoordinate;
}
