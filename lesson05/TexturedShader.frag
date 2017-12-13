precision mediump float;

uniform sampler2D uSampler;

varying vec2 vTextureCoordinate;

void main() {
	gl_FragColor = texture2D(uSampler, vec2(vTextureCoordinate.s, vTextureCoordinate.t));
}
