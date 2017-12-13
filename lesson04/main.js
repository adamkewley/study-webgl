const ANGULAR_VELOCITY = degToRad(90);
let rot = 0;

function main() {
  const mainEl = document.getElementById("main");
  const vertexShaderSrcPromise = fetchText("shader.vert");
  const fragmentShaderSrcPromise = fetchText("shader.frag");
  const cubeDataPromsie = fetchText("cube.json").then(cubeJSON => JSON.parse(cubeJSON));
  const pyramidDataPromise = fetchText("pyramid.json").then(pyramidJSON => JSON.parse(pyramidJSON));

  Promise.all([vertexShaderSrcPromise, fragmentShaderSrcPromise, cubeDataPromsie, pyramidDataPromise])
    .then(([vertexShaderSrc, fragmentShaderSrc, cubeData, pyramidData]) => {
      const canvasEl = document.createElement("canvas");
      canvasEl.classList.add("maincanvas");
      clearEl(mainEl);
      mainEl.appendChild(canvasEl);

      const drawingContext = initializeDrawing(canvasEl, vertexShaderSrc, fragmentShaderSrc, cubeData, pyramidData);

      let prevTime = 0;

      const tick = (t) => {
        const dt = t - prevTime;
        prevTime = t;

        rot += (dt/1000) * ANGULAR_VELOCITY;
        draw(drawingContext);
        window.requestAnimationFrame(tick);
      };

      window.requestAnimationFrame(tick);
    });
}

function initializeDrawing(canvasEl, vertexShaderSrc, fragmentShaderSrc, cubeData, pyramidData) {
  const gl = canvasEl.getContext("webgl");
  const shaderProgram = compileShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc);

  const cubeVertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeData.vertices), gl.STATIC_DRAW);

  const cubeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeData.colors), gl.STATIC_DRAW);

  const cubeElementBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeElementBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeData.elements), gl.STATIC_DRAW);



  const pyramidVertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pyramidData.vertices), gl.STATIC_DRAW);

  const pyramidColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pyramidData.colors), gl.STATIC_DRAW);



  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -7.0]);

  const perspectiveMatrix = mat4.create();
  mat4.perspective(perspectiveMatrix, degToRad(90), canvasEl.clientWidth/canvasEl.clientHeight, 0.1, 100.0);

  return {
    canvasEl: canvasEl,
    gl: gl,
    shaderProgram: shaderProgram,

    cubeVertBuffer: cubeVertBuffer,
    cubeColorBuffer: cubeColorBuffer,
    cubeElementBuffer: cubeElementBuffer,

    pyramidVertBuffer: pyramidVertBuffer,
    pyramidColorBuffer: pyramidColorBuffer,

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

  drawCube(drawingContext);
  drawPyramid(drawingContext);
}


function resize(canvas) {
  const visibleWidth = canvas.clientWidth;
  const visibleHeight = canvas.clientHeight;
  if (canvas.width != visibleWidth || canvas.height != visibleHeight) {
    canvas.width = visibleWidth;
    canvas.height = visibleHeight;
  }
}

function drawCube(drawingContext) {
  const gl = drawingContext.gl;

  const glProg = drawingContext.shaderProgram.program;
  const aVertex = drawingContext.shaderProgram.aVertex;
  const aColor = drawingContext.shaderProgram.aColor;
  const uModelViewMatrix = drawingContext.shaderProgram.uModelViewMatrix;
  const uPerspectiveMatrix = drawingContext.shaderProgram.uPerspectiveMatrix;

  const cubeVerts = drawingContext.cubeVertBuffer;
  const cubeColors = drawingContext.cubeColorBuffer;
  const cubeElements = drawingContext.cubeElementBuffer;

  gl.useProgram(glProg);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerts);
  gl.vertexAttribPointer(aVertex, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColors);
  gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);

  const pos = mat4.create();
  mat4.identity(pos);
  mat4.multiply(pos, drawingContext.modelViewMatrix, pos);
  mat4.translate(pos, pos, [-1.5, 0.0, 0.0]);
  mat4.rotate(pos, pos, rot, [1.0, 0.5, 0.0]);

  gl.uniformMatrix4fv(uModelViewMatrix, false, pos);
  gl.uniformMatrix4fv(uPerspectiveMatrix, false, drawingContext.perspectiveMatrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeElements);
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

function drawPyramid(drawingContext) {
  const gl = drawingContext.gl;

  const glProg = drawingContext.shaderProgram.program;
  const aVertex = drawingContext.shaderProgram.aVertex;
  const aColor = drawingContext.shaderProgram.aColor;
  const uModelViewMatrix = drawingContext.shaderProgram.uModelViewMatrix;
  const uPerspectiveMatrix = drawingContext.shaderProgram.uPerspectiveMatrix;

  const pyramidVerts = drawingContext.pyramidVertBuffer;
  const pyramidColors = drawingContext.pyramidColorBuffer;

  gl.useProgram(glProg);
  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVerts);
  gl.vertexAttribPointer(aVertex, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidColors);
  gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);

  const pos = mat4.create();
  mat4.identity(pos);
  mat4.multiply(pos, drawingContext.modelViewMatrix, pos);
  mat4.translate(pos, pos, [1.5, 0.0, 0.0]);
  mat4.rotate(pos, pos, rot, [0.0, 1.0, 0.0]);


  gl.uniformMatrix4fv(uModelViewMatrix, false, pos);
  gl.uniformMatrix4fv(uPerspectiveMatrix, false, drawingContext.perspectiveMatrix);
  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVerts);
  gl.drawArrays(gl.TRIANGLES, 0, 12);
}

main();
