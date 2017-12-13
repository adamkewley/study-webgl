class Star {
  constructor(zAngle, distanceFromOrigin, color) {
    this.zAngle = zAngle;
    this.distanceFromOrigin = distanceFromOrigin;
    this.color = color;
  }

  draw(gl, prog, perspMatrix, mvMatrix, vertexBuffer, textureCoordsBuffer, starTexture, spin, tilt) {
    const pos = mat4.create();
    mat4.identity(pos);
    mat4.multiply(pos, pos, mvMatrix);


    mat4.rotate(pos, pos, this.zAngle, [0.0, 0.0, 1.0]);
    mat4.translate(pos, pos, [this.distanceFromOrigin, 0.0, 0.0]);
    mat4.rotate(pos, pos, -this.zAngle, [0.0, 0.0, 1.0]);
    mat4.rotate(pos, pos, -tilt, [0.0, 1.0, 0.0]);
    mat4.rotate(pos, pos, spin, [0.0, 0.0, 1.0]);


    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(prog.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);
    gl.vertexAttribPointer(prog.aTextureCoordinate, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, starTexture);

    gl.uniform1i(prog.uSampler, 0);
    gl.uniformMatrix4fv(prog.uPerspectiveMatrix, false, perspMatrix);
    gl.uniformMatrix4fv(prog.uModelViewMatrix, false, pos);
    gl.uniform3f(prog.uColor, this.color.r, this.color.g, this.color.b);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  animate(dtInMilliseconds) {
    this.zAngle += (dtInMilliseconds * this.distanceFromOrigin * 0.001);

    this.distanceFromOrigin =
      this.distanceFromOrigin < 0.0 ? this.distanceFromOrigin + 10.0 : this.distanceFromOrigin - (0.0001 * dtInMilliseconds);
  }
}