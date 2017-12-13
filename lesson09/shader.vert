attribute vec3 aVertexPosition;
attribute vec2 aTextureCoordinate;

uniform mat4 uModelViewMatrix;
uniform mat4 uPerspectiveMatrix;

varying vec2 vTextureCoordinate;

void main(void) {
  gl_Position = uPerspectiveMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vTextureCoordinate = aTextureCoordinate;
}
