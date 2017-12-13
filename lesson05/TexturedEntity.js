class TexturedEntity {

  static load(gl, data, pos) {
    const vertexShaderPromise = Helpers.fetchText(data.vertexShader);
    const fragmentShaderPromise = Helpers.fetchText(data.fragmentShader);
    const imagePromise = Helpers.fetchImage(data.textureSrc);

    return Promise.all([vertexShaderPromise, fragmentShaderPromise, imagePromise])
      .then(results => {
        return this._handleLoadedData(gl, data, pos, results);
      });
  }

  static _handleLoadedData(gl, data, pos, [vertexShaderSrc, fragmentShaderSrc, image]) {
    const program = Helpers.compileShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc);

    const aEntityVertex = gl.getAttribLocation(program, "aEntityVertex");
    gl.enableVertexAttribArray(aEntityVertex);

    const aTextureCoordinate = gl.getAttribLocation(program, "aTextureCoordinate");
    gl.enableVertexAttribArray(aTextureCoordinate);

    const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
    const uPerspectiveMatrix = gl.getUniformLocation(program, "uPerspectiveMatrix");
    const uSampler = gl.getUniformLocation(program, "uSampler");

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertices), gl.STATIC_DRAW);

    const textureCoordinatesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinatesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.textureCoords), gl.STATIC_DRAW);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    let elementBuffer = undefined;
    if (data.elements !== undefined) {
      elementBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.elements), gl.STATIC_DRAW);
    }

    const entityData = {
      program: program,
      data: data,
      attributes: {
        aEntityVertex,
        aTextureCoordinate
      },
      uniforms: {
        uModelViewMatrix,
        uPerspectiveMatrix,
        uSampler,
      },
      buffers: {
        vertexBuffer,
        textureCoordinatesBuffer,
        elementBuffer,
      },
      pos: pos,
      texture: texture,
    };

    return new TexturedEntity(entityData);
  }

  constructor(entityData) {
    this.entityData = entityData;
    this.rot = 0;
    this.rotationsPerSecond = Helpers.degToRad(90);
  }

  draw(gl, mvMatrix, perspectiveMatrix) {
    gl.useProgram(this.entityData.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.entityData.buffers.vertexBuffer);
    gl.vertexAttribPointer(this.entityData.attributes.aEntityVertex, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.entityData.buffers.textureCoordinatesBuffer);
    gl.vertexAttribPointer(this.entityData.attributes.aTextureCoordinate, 2, gl.FLOAT, false, 0, 0);


    gl.uniform1i(this.entityData.uniforms.uSampler, 0);
    gl.uniformMatrix4fv(this.entityData.uniforms.uPerspectiveMatrix, false, perspectiveMatrix);

    const elementPos = mat4.create();
    mat4.multiply(elementPos, mvMatrix, elementPos);
    mat4.translate(elementPos, elementPos, this.entityData.pos);
    mat4.rotate(elementPos, elementPos, this.rot, [1.0, 0.5, 0.25]);

    gl.uniformMatrix4fv(this.entityData.uniforms.uModelViewMatrix, false, elementPos);


    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.entityData.texture);


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.entityData.buffers.elementBuffer);
    gl.drawElements(gl.TRIANGLES, this.entityData.data.elements.length, gl.UNSIGNED_SHORT, 0);
  }

  tick(dt) {
    this.rot += (dt/1000) * this.rotationsPerSecond;
  }
}