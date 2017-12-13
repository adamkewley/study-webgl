function main() {
  const canvasEl = insertDrawTargetInto("main");
  const glContext = initializeGlContext(canvasEl);

  loadEntities(glContext, ["colored-cube.json", "colored-pyramid.json", "textured-cube.json"])
    .then(entities => setupWindowTick(canvasEl, glContext, entities));
}

function insertDrawTargetInto(elementId) {
  const mainEl = document.getElementById(elementId);
  const canvasEl = document.createElement("canvas");
  canvasEl.classList.add("maincanvas");
  Helpers.removeAllChildrenFrom(mainEl);
  mainEl.appendChild(canvasEl);
  return canvasEl;
}

function initializeGlContext(canvasEl) {
  const gl = canvasEl.getContext("webgl");
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [3.0, 0.0, -7.0]);

  const perspectiveMatrix = mat4.create();
  mat4.perspective(perspectiveMatrix, Helpers.degToRad(90), canvasEl.clientWidth/canvasEl.clientHeight, 0.1, 100.0);

  return {gl, modelViewMatrix, perspectiveMatrix};
}

function loadEntities(glContext, entityDataPaths) {
  const dataPromises = entityDataPaths.map(path => Helpers.fetchText(path));
  return Promise
    .all(dataPromises)
    .then(entitiesJSON => {
      const entityPromises = entitiesJSON.map((entityJSON, i) => {
        const entityData = JSON.parse(entityJSON);
        return Entity.load(glContext.gl, entityData, [i*-3.0,0,0]);
      });
      return Promise.all(entityPromises);
    });
}

function setupWindowTick(canvasEl, glContext, entities) {
  let prevTime = 0;

  const tick = (t) => {
    const dt = t - prevTime;
    prevTime = t;

    tickEntities(dt, entities);
    Helpers.resizeIfNecessary(canvasEl);
    drawFrame(glContext, entities);

    window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);
}

function tickEntities(dt, entities) {
  entities.forEach(entity => entity.tick(dt));
}

function drawFrame({gl, modelViewMatrix, perspectiveMatrix}, entities) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  entities.forEach(entity => {
    entity.draw(gl, modelViewMatrix, perspectiveMatrix);
  });
}

main();
