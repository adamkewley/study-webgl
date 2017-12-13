function main() {
  const mainEl = document.getElementById("main");
  const vertexShaderSrcPromise = fetchText("shader.vert");
  const fragmentShaderSrcPromise = fetchText("shader.frag");

  Promise.all([vertexShaderSrcPromise, fragmentShaderSrcPromise])
    .then(([vertexShaderSrc, fragmentShaderSrc]) => {
      const canvasEl = document.createElement("canvas");
      canvasEl.classList.add("maincanvas");
      clearEl(mainEl);
      mainEl.appendChild(canvasEl);

      const drawingContext = initializeDrawing(canvasEl, vertexShaderSrc, fragmentShaderSrc);

      window.onresize = () => {
        draw(drawingContext);
      };
      draw(drawingContext);
    });
}

function initializeDrawing(canvasEl, vertexShaderSrc, fragmentShaderSrc) {
  const gl = canvasEl.getContext("webgl");
  const shaderProgram = compileShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc);

  const triangleVerts = [
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0,
    0.0, 1.0, 0.0,
  ];

  const triangleColors = [
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0,
  ];

  const squareVerts = [
    -1.0, -1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    1.0, 1.0, 0.0,
  ];

  const squareColors = [
    0.5, 0.5, 1.0,
    0.5, 0.5, 1.0,
    0.5, 0.5, 1.0,
    0.5, 0.5, 1.0,
  ];

  const triangleVertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerts), gl.STATIC_DRAW);

  const triangleColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleColors), gl.STATIC_DRAW);


  const squareVertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareVerts), gl.STATIC_DRAW);

  const squareColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareColors), gl.STATIC_DRAW);


  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -7.0]);

  const perspectiveMatrix = mat4.create();
  mat4.perspective(perspectiveMatrix, degToRad(90), canvasEl.clientWidth/canvasEl.clientHeight, 0.1, 100.0);

  return {
    canvasEl: canvasEl,
    gl: gl,
    shaderProgram: shaderProgram,
    triangleVertBuffer: triangleVertBuffer,
    triangleColorBuffer: triangleColorBuffer,
    squareVertBuffer: squareVertBuffer,
    squareColorBuffer: squareColorBuffer,
    modelViewMatrix: modelViewMatrix,
    perspectiveMatrix: perspectiveMatrix,
  };
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function compileShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc) {
  const program = gl.createProgram();

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSrc);
  gl.compileShader(vertexShader);

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    const msg = gl.getShaderInfoLog(vertexShader);
    throw `Cannot compile vertex shader: ${msg}`;
  } else {
    gl.attachShader(program, vertexShader);
  }


  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSrc);
  gl.compileShader(fragmentShader);

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    const msg = gl.getShaderInfoLog(fragmentShader);
    throw `Cannot compile fragment shader: ${msg}`;
  } else {
    gl.attachShader(program, fragmentShader);
  }


  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const msg = gl.getProgramInfoLog(program);
    throw `Cannot link program: ${msg}`;
  }

  const aVertex = gl.getAttribLocation(program, "aVertex");
  gl.enableVertexAttribArray(aVertex);

  const aColor = gl.getAttribLocation(program, "aColor");
  gl.enableVertexAttribArray(aColor);

  const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  const uPerspectiveMatrix = gl.getUniformLocation(program, "uPerspectiveMatrix");

  return {
    program: program,
    aVertex: aVertex,
    aColor: aColor,
    uModelViewMatrix: uModelViewMatrix,
    uPerspectiveMatrix: uPerspectiveMatrix,
  };
}

function clearEl(el) {
  while(el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

function draw(drawingContext) {
  const gl = drawingContext.gl;

  resize(drawingContext.canvasEl);

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawSquare(drawingContext);
  drawTriangle(drawingContext);
}


function resize(canvas) {
  const visibleWidth = canvas.clientWidth;
  const visibleHeight = canvas.clientHeight;
  if (canvas.width != visibleWidth || canvas.height != visibleHeight) {
    canvas.width = visibleWidth;
    canvas.height = visibleHeight;
  }
}

function drawSquare(drawingContext) {
  const gl = drawingContext.gl;
  const squareVerts = drawingContext.squareVertBuffer;
  const squareColorBuffer = drawingContext.squareColorBuffer;
  const glProg = drawingContext.shaderProgram.program;
  const aVertex = drawingContext.shaderProgram.aVertex;
  const aColor = drawingContext.shaderProgram.aColor;
  const uModelViewMatrix = drawingContext.shaderProgram.uModelViewMatrix;
  const uPerspectiveMatrix = drawingContext.shaderProgram.uPerspectiveMatrix;

  gl.useProgram(glProg);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerts);
  gl.vertexAttribPointer(aVertex, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareColorBuffer);
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

  const pos = mat4.create();
  mat4.identity(pos);
  mat4.multiply(pos, drawingContext.modelViewMatrix, pos);
  mat4.translate(pos, pos, [-1.5, 0.0, 0.0]);

  gl.uniformMatrix4fv(uModelViewMatrix, false, pos);
  gl.uniformMatrix4fv(uPerspectiveMatrix, false, drawingContext.perspectiveMatrix);
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerts);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function drawTriangle(drawingContext) {
  const gl = drawingContext.gl;
  const triangleVerts = drawingContext.triangleVertBuffer;
  const triangleColorBuffer = drawingContext.triangleColorBuffer;
  const glProg = drawingContext.shaderProgram.program;
  const aVertex = drawingContext.shaderProgram.aVertex;
  const aColor = drawingContext.shaderProgram.aColor;
  const uModelViewMatrix = drawingContext.shaderProgram.uModelViewMatrix;
  const uPerspectiveMatrix = drawingContext.shaderProgram.uPerspectiveMatrix;

  gl.useProgram(glProg);
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerts);
  gl.vertexAttribPointer(aVertex, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

  const pos = mat4.create();
  mat4.identity(pos);
  mat4.multiply(pos, drawingContext.modelViewMatrix, pos);
  mat4.translate(pos, pos, [1.5, 0.0, 0.0]);


  gl.uniformMatrix4fv(uModelViewMatrix, false, pos);
  gl.uniformMatrix4fv(uPerspectiveMatrix, false, drawingContext.perspectiveMatrix);
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerts);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

main();
