const STAR_GIF = "star.gif";
const VERTEX_SHADER = "shader.vert";
const FRAGMENT_SHADER = "shader.frag";
const mainEl = document.getElementById("main");
const FOV_IN_RADIANS = 40/180 * Math.PI;
const FRUSTRUM_LOWER_LIM = 0.1;
const FRUSTRUM_UPPER_LIM = 100;

const asyncActions = new Rx.Subject();

function degToRad(d) {
  return (d/360) * 2 * Math.PI;
}

function compileProgram(gl, fragShaderSrc, vertShaderSrc) {
  const program = gl.createProgram();

  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertShaderSrc);
  gl.compileShader(vertShader);

  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(vertShader);
    throw `Could not compile vertex shader ${info}`;
  } else {
    gl.attachShader(program, vertShader);
  }


  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragShaderSrc);
  gl.compileShader(fragShader);

  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(fragShader);
    throw `Could not compile fragment shader ${info}`;
  } else {
    gl.attachShader(program, fragShader);
  }

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    throw `Could not link GL program ${info}`;
  } else {
    program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(program.aVertexPosition);

    program.aTextureCoordinate = gl.getAttribLocation(program, "aTextureCoordinate");
    gl.enableVertexAttribArray(program.aTextureCoordinate);

    program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
    program.uPerspectiveMatrix = gl.getUniformLocation(program, "uPerspectiveMatrix");
    program.uSampler = gl.getUniformLocation(program, "uSampler");
    program.uColor = gl.getUniformLocation(program, "uColor");

    return program;
  }
}

function generateRandomColor() {
  const ret = {};
  ret.r = Math.random();
  ret.g = Math.random();
  ret.b = Math.random();
  return ret;
}

function bodyKeydownObservable() {
  return Rx.Observable.fromEvent(document.body, "keydown");
}

function bodyKeyupObservable() {
  return Rx.Observable.fromEvent(document.body, "keyup");
}

function loadStarTexture(gl, starImg) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, starImg);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

function renderUi(starImg, fragShaderSrc, vertShaderSrc) {
  const canvasEl = document.createElement("canvas");
  canvasEl.classList.add("canvas");
  const gl = canvasEl.getContext("webgl");
  gl.clearColor(0, 0, 0, 1);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.enable(gl.BLEND);

  const vertices = [
    -1.0, -1.0,  0.0,
    1.0, -1.0,  0.0,
    -1.0,  1.0,  0.0,
    1.0,  1.0,  0.0,
  ];

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const textureCoords = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 1.0
  ];

  const textureCoordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

  const starTexture = loadStarTexture(gl, starImg);

  const prog = compileProgram(gl, fragShaderSrc, vertShaderSrc);

  const perspMatrix = mat4.create();
  const aspectRatio = canvasEl.width / canvasEl.height;
  mat4.perspective(perspMatrix, FOV_IN_RADIANS, aspectRatio, FRUSTRUM_LOWER_LIM, FRUSTRUM_UPPER_LIM);

  const mvMatrix = mat4.create();
  mat4.identity(mvMatrix);

  const stars = [];

  for (let i = 0; i < 100; i++) {
    stars.push(new Star(i * 0.05, 5 + i * 0.05, generateRandomColor()));
  }

  let lastElapsed = 0;
  let spin = 0;
  let tilt = 0;

  function resize() {
    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    if (gl.canvas.width != width ||
      gl.canvas.height != height) {
      gl.canvas.width = width;
      gl.canvas.height = height;
    }
  }

  let keyStates = {};

  const bodyKeydown = bodyKeydownObservable();
  const bodyKeyup = bodyKeyupObservable();

  bodyKeydown.subscribe(e => {
    keyStates[e.key] = true;
  });

  bodyKeyup.subscribe(e => {
    keyStates[e.key] = undefined;
  });

  const tick = (elapsed) => {
    const dt = elapsed - lastElapsed;
    lastElapsed = elapsed;

    resize();

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    stars.forEach(star => {
      star.animate(dt);
      star.draw(gl, prog, perspMatrix, mvMatrix, vertexBuffer, textureCoordsBuffer, starTexture, spin, tilt);
      spin += degToRad(0.05);
    });

    if (keyStates["f"]) {
      tilt += degToRad(dt/11);
      console.log(tilt);
    }

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -20.0]);
    mat4.rotate(mvMatrix, mvMatrix, tilt, [0.0, 1.0, 0.0]);


    window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);

  return canvasEl;
}

function renderLoadingMessages(ongoingActions) {
  const uiEl = document.createElement("ul");
  ongoingActions.map(renderLoadingMessage).forEach(el => uiEl.appendChild(el));
  return uiEl;
}

function renderLoadingMessage(msg) {
  const liEl = document.createElement("li");
  liEl.innerText = msg;
  return liEl;
}

function renderErrorMessage(msg) {
  return document.createTextNode(msg);
}

function performAction(title, p) {
  return p;
}

function renderInMainEl(el) {
  mainEl.appendChild(el);
}

function main() {
  const actions = asyncActions.startWith([]);

  actions.subscribe(ongoingActions => {
    if (ongoingActions.length > 0) {
      renderLoadingMessages(ongoingActions);
    }
  });

  const starsPromise = performAction("Loading stars", fetchImage(STAR_GIF));
  const fragShaderPromise = performAction("Loading fragment shader", fetchText(FRAGMENT_SHADER));
  const vertShaderPromise = performAction("Loading vertex shader", fetchText(VERTEX_SHADER));

  Promise.all([starsPromise, fragShaderPromise, vertShaderPromise])
    .then(([starsImg, fragShaderSrc, vertShaderSrc]) => {
      renderInMainEl(renderUi(starsImg, fragShaderSrc, vertShaderSrc));
    })
    .catch(errMsg => {
      console.log(errMsg);
      renderInMainEl(renderErrorMessage(errMsg));
    });
}

main();
