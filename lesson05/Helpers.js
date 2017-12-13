class Helpers {
  static degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  static removeAllChildrenFrom(domNode) {
    let firstChild;
    while((firstChild = domNode.firstChild) !== null) {
      domNode.removeChild(firstChild);
    }
  }

  static fetchImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = src;
    });
  }

  static fetchText(url) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open("GET", url);

      req.onload = () => {
        if (200 <= req.status && req.status < 300) {
          resolve(req.response);
        } else {
          reject(req.response);
        }
      };

      req.onerror = () => {
        reject(req.response);
      };

      req.send();
    });
  }

  static compileShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc) {
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

    return program;
  }

  static resizeIfNecessary(canvasEl) {
    const visibleWidth = canvasEl.clientWidth;
    const visibleHeight = canvasEl.clientHeight;
    if (canvasEl.width != visibleWidth || canvasEl.height != visibleHeight) {
      canvasEl.width = visibleWidth;
      canvasEl.height = visibleHeight;
    }
  }
}
