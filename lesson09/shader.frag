precision mediump float;

varying vec2 vTextureCoordinate;

uniform sampler2D uSampler;
uniform vec3 uColor;

void main(void) {
  vec4 textureColor = texture2D(uSampler, vec2(vTextureCoordinate.s, vTextureCoordinate.t));
  gl_FragColor = textureColor * vec4(uColor, 1.0);
}
