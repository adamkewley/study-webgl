class ColoredEntity {

  static load(gl, data, pos) {
    const vertexShaderPromise = Helpers.fetchText(data.vertexShader);
    const fragmentShaderPromise = Helpers.fetchText(data.fragmentShader);

    return Promise.all([vertexShaderPromise, fragmentShaderPromise])
      .then(([vertexShaderSrc, fragmentShaderSrc]) => {
        const program = Helpers.compileShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc);
        const aVertex = gl.getAttribLocation(program, "aVertex");
        gl.enableVertexAttribArray(aVertex);

        const aColor = gl.getAttribLocation(program, "aColor");
        gl.enableVertexAttribArray(aColor);

        const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
        const uPerspectiveMatrix = gl.getUniformLocation(program, "uPerspectiveMatrix");

        const vertBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertices), gl.STATIC_DRAW);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.colors), gl.STATIC_DRAW);

        let elementBuffer = undefined;
        if (data.elements !== undefined) {
          elementBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.elements), gl.STATIC_DRAW);
        }

        return new ColoredEntity(
          program,
          aVertex,
          aColor,
          uModelViewMatrix,
          uPerspectiveMatrix,
          vertBuffer,
          data.vertices.length,
          colorBuffer,
          elementBuffer,
          data.elements ? data.elements.length : 0,
          pos);
      });
  }

  constructor(
    program,
    aVertex,
    aColor,
    uModelViewMatrix,
    uPerspectiveMatrix,
    vertBuffer,
    numVertices,
    colorBuffer,
    elementBuffer,
    numElements,
    pos) {

    this.program = program;
    this.aVertex = aVertex;
    this.aColor = aColor;
    this.uModelViewMatrix = uModelViewMatrix;
    this.uPerspectiveMatrix = uPerspectiveMatrix;
    this.vertBuffer = vertBuffer;
    this.numVertices = numVertices;
    this.colorBuffer = colorBuffer;
    this.elementBuffer = elementBuffer;
    this.numElements = numElements;
    this.pos = pos;
    this.rot = 0;
    this.rotationsPerSecond = Helpers.degToRad(90);
  }

  draw(gl, mvMatrix, perspectiveMatrix) {
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.vertexAttribPointer(this.aVertex, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.vertexAttribPointer(this.aColor, 4, gl.FLOAT, false, 0, 0);

    const elementPosition = mat4.create();
    mat4.multiply(elementPosition, mvMatrix, elementPosition);
    mat4.translate(elementPosition, elementPosition, this.pos);
    mat4.rotate(elementPosition, elementPosition, this.rot, [1.0, 0.5, 0.25]);

    gl.uniformMatrix4fv(this.uModelViewMatrix, false, elementPosition);
    gl.uniformMatrix4fv(this.uPerspectiveMatrix, false, perspectiveMatrix);

    if (this.elementBuffer === undefined) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
      gl.drawArrays(gl.TRIANGLES, 0, this.numVertices/3);
    } else {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
      gl.drawElements(gl.TRIANGLES, this.numElements, gl.UNSIGNED_SHORT, 0);
    }
  }

  tick(dt) {
    this.rot += (dt/1000) * this.rotationsPerSecond;
  }
}