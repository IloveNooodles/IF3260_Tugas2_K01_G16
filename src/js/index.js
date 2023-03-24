/* ======= Global object ======= */
var state;
setDefaultState();

function setDefaultState() {
  /* Setup default state for webgl canvas */
  state = {
    model: cubes,
    transform: {
      translate: [0, 0, 0], // x, y, z
      rotate: [0, 0, 0], // x, y, z
      scale: [1, 1, 1], // x, y, z
    },
    viewMatrix: {
      camera: [0, 0, 0], // x, y, z
      lookAt: [0, 0, 0], // x, y, z
      up: [0, 1, 0], // x, y, z
      near: 0.1,
      far: 25,
    },
    projection: "perspective", // orthographic, oblique, or perspective
    fudgeFactor: 0.0, // perspective projection
    lighting: false,
    theta: 15.0, // 15 - 75
    phi: 75.0, // 15 - 75
    pickedColor: [0.0, 0.0, 0.0], // r, g, b, a
  };

  if (state.projection === "perspective") {
    state.transform.translate[2] = -5 + 100 / 100;
  }
}

/* ======= Get Document Object Model ======= */
const canvas = document.getElementById("canvas");
const projectionRadio = document.getElementsByName("projection");
const modelInput = document.getElementById("objFile");
const buttonSave = document.getElementById("save");
const colorPicker = document.getElementById("color-picker");
const lightingCheckbox = document.getElementById("lighting");
const reset = document.getElementById("reset");
const resetTransform = document.getElementById("reset-transform");
const resetCamera = document.getElementById("reset-camera");

/* ======= Transform Sliders ======= */
const rangeTranslateX = document.getElementById("translate-x");
const rangeTranslateY = document.getElementById("translate-y");
const rangeTranslateZ = document.getElementById("translate-z");

const rangeRotateX = document.getElementById("rotate-x");
const rangeRotateY = document.getElementById("rotate-y");
const rangeRotateZ = document.getElementById("rotate-z");

const scaleX = document.getElementById("scale-x");
const scaleY = document.getElementById("scale-y");
const scaleZ = document.getElementById("scale-z");

const rangeFOV = document.getElementById("fov");
const rangeCameraX = document.getElementById("camera-x");
const rangeCameraY = document.getElementById("camera-y");
const rangeCameraZ = document.getElementById("camera-z");

const rangeLookAtX = document.getElementById("look-at-x");
const rangeLookAtY = document.getElementById("look-at-y");
const rangeLookAtZ = document.getElementById("look-at-z");

const theta = document.getElementById("theta");
const phi = document.getElementById("phi");

/* ======= Event Listener ======= */
projectionRadio.forEach((radio) => {
  radio.addEventListener("change", () => {
    state.projection = radio.value;
    render();
  });
});

modelInput.addEventListener("change", () => {
  const file = modelInput.files[0];
  if (file.type !== "application/json") {
    alert("Please upload correct JSON file!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const color = state.pickedColor;
    setDefaultState();
    clear();
    state.model = loadObject(text);
    state.pickedColor = color;
    render();
  };
  reader.readAsText(file);
});

buttonSave.addEventListener("click", () => {
  const obj = createObjFile(state.model);
  const blob = new Blob([obj], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  // TODO change this
  link.download = "model.obj";
  link.click();
});

colorPicker.addEventListener("change", () => {
  const color = colorPicker.value;
  /* convert hex to rgb, normalize */
  state.pickedColor = [
    parseInt(color.substring(1, 3), 16) / 255,
    parseInt(color.substring(3, 5), 16) / 255,
    parseInt(color.substring(5, 7), 16) / 255,
  ];
  render();
});

lightingCheckbox.addEventListener("change", () => {
  state.lighting = lightingCheckbox.checked;
  if (state.lighting) {
    program = createShaderProgram(gl, vertex_shader_3d, fragment_shader_3d);
  } else {
    program = createShaderProgram(gl, vertex_shader_3d, fragment_shader_3d_no_lighting);
  }
  render();
});

reset.addEventListener("click", () => {
  setDefaultState();
  modelInput.value = "";
  clear();
});

resetCamera.addEventListener("click", () => {
  state.viewMatrix.camera = [0, 0, 0];
  state.viewMatrix.lookAt = [0, 0, 0];
  state.viewMatrix.up = [0, 1, 0];
  state.viewMatrix.near = 0.1;
  state.viewMatrix.far = 25;
  state.fudgeFactor = 0.0;
  state.theta = 15.0;
  state.phi = 75.0;
  render();
});

rangeTranslateX.addEventListener("input", () => {
  state.transform.translate[0] = -1 + (2 * rangeTranslateX.value) / 100;
  render();
});

rangeTranslateY.addEventListener("input", () => {
  state.transform.translate[1] = -1 + (2 * rangeTranslateY.value) / 100;
  render();
});

rangeTranslateZ.addEventListener("input", () => {
  if (state.projection === "perspective") {
    state.transform.translate[2] = -5 + (2 * rangeTranslateZ.value) / 100;
  } else {
    state.transform.translate[2] = -1 + (2 * rangeTranslateZ.value) / 100;
  }
  render();
});

/* rotate from -360 to 360 */
rangeRotateX.addEventListener("input", () => {
  // rotate -360 to 360
  state.transform.rotate[0] = (2 * rangeRotateX.value * 2 * Math.PI) / 100;
  render();
});

rangeRotateY.addEventListener("input", () => {
  state.transform.rotate[1] = (2 * rangeRotateY.value * 2 * Math.PI) / 100;
  render();
});

rangeRotateZ.addEventListener("input", () => {
  state.transform.rotate[2] = (2 * rangeRotateZ.value * 2 * Math.PI) / 100;
  render();
});

/* scale from -5 to 5 */
scaleX.addEventListener("input", () => {
  state.transform.scale[0] = scaleX.value / 20;
  render();
});

scaleY.addEventListener("input", () => {
  state.transform.scale[1] = scaleY.value / 20;
  render();
});

scaleZ.addEventListener("input", () => {
  state.transform.scale[2] = scaleZ.value / 20;
  render();
});

rangeFOV.addEventListener("input", () => {
  state.fudgeFactor = rangeFOV.value / 100;
  // console.log(state.fudgeFactor);
  render();
});

rangeCameraX.addEventListener("input", () => {
  state.viewMatrix.camera[0] = -1 + (2 * rangeCameraX.value) / 100;
  render();
});

rangeCameraY.addEventListener("input", () => {
  state.viewMatrix.camera[1] = -1 + (2 * rangeCameraY.value) / 100;
  render();
});

rangeCameraZ.addEventListener("input", () => {
  state.viewMatrix.camera[2] = -1 + (2 * rangeCameraZ.value) / 100;
  render();
});

rangeLookAtX.addEventListener("input", () => {
  state.viewMatrix.lookAt[0] = (2 * rangeLookAtX.value * 2 * Math.PI) / 100;
  render();
});

rangeLookAtY.addEventListener("input", () => {
  state.viewMatrix.lookAt[1] = (2 * rangeLookAtY.value * 2 * Math.PI) / 100;
  render();
});

rangeLookAtZ.addEventListener("input", () => {
  state.viewMatrix.lookAt[2] = (2 * rangeLookAtZ.value * 2 * Math.PI) / 100;
  render();
});

theta.addEventListener("input", () => {
  state.theta = parseInt(theta.value);
  render();
});

phi.addEventListener("input", () => {
  state.phi = parseInt(phi.value);
  render();
});

/* ======= WebGL Functions ======= */
const gl = canvas.getContext("webgl");
var program = createShaderProgram(gl, vertex_shader_3d, fragment_shader_3d_no_lighting);

window.onload = function () {
  if (!gl) {
    alert("WebGL not supported");
  }
  rangeFOV.value = 0;
  colorPicker.value = "#808080";
  state.pickedColor = [0.5, 0.5, 0.5];
  render();
};

function clear() {
  /* Setup black screen for webgl canvas */
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function render() {
  /* Render loop for webgl canvas */
  /* Setup */
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  clear();
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(program);

  const view = setView(state.viewMatrix.camera, state.viewMatrix.lookAt);
  const geometry = setGeometry(gl, state.model);
  const transform = setTransform(state.model, state.transform);
  const projection = setProjection(
    state.projection,
    state.viewMatrix.far,
    state.viewMatrix.near,
    state.theta,
    state.phi
  );

  // console.log(projection);

  // console.log(state.viewMatrix.far, state.viewMatrix.near);
  var aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

  var fudgeFactor = gl.getUniformLocation(program, "fudgeFactor");
  gl.uniform1f(fudgeFactor, state.fudgeFactor);

  var transformationMatrix = gl.getUniformLocation(program, "uTransformationMatrix");

  var viewMatrix = gl.getUniformLocation(program, "uViewMatrix");

  gl.uniformMatrix4fv(transformationMatrix, false, transform);

  var uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
  gl.uniformMatrix4fv(uProjectionMatrix, false, matrices.multiply(projection, view));

  if (state.lighting) {
    var userColor = gl.getUniformLocation(program, "userColor");
    gl.uniform3fv(userColor, state.pickedColor);
  } else {
    setColor(gl, state.model);
    var vertColor = gl.getAttribLocation(program, "aColor");
    gl.enableVertexAttribArray(vertColor);
    gl.vertexAttribPointer(vertColor, 3, gl.FLOAT, false, 0, 0);
  }

  gl.drawElements(gl.TRIANGLES, geometry.numFaces, gl.UNSIGNED_SHORT, 0);

  // requestAnimationFrame(render);
}

function setView(camera, lookAt) {
  /* Setup view for webgl canvas */
  // console.log(lookAt);
  var cameraMatrix = matrices.translate(camera[0], camera[1], camera[2]);
  cameraMatrix = matrices.multiply(cameraMatrix, matrices.xRotate(lookAt[0]));
  cameraMatrix = matrices.multiply(cameraMatrix, matrices.yRotate(lookAt[1]));
  cameraMatrix = matrices.multiply(cameraMatrix, matrices.zRotate(lookAt[2]));
  var viewMatrix = matrices.inverse(cameraMatrix);
  return viewMatrix;
}

function setGeometry(gl, model) {
  /* Setup geometry for webgl canvas */
  const vertices = new Float32Array(model.vertices.flat(1));
  // all faces are 1 based index. add elements -1 to convert to 0 index
  const faces = new Uint16Array(model.faces.flat(1).map((x) => x - 1));

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const faceBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faces, gl.STATIC_DRAW);

  // console.log(vertices, faces);
  return {
    vertexBuffer,
    faceBuffer,
    numFaces: faces.length,
  };
}

function setColor(gl, model) {
  const colorBuffer = gl.createBuffer();
  const colors = new Float32Array(model.colors.flat(1));
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
}

function setTransform(model, transform) {
  /* Setup transform for webgl canvas */
  /* Translate back to center point */
  let centroid = locateCentroid(model.vertices);

  var matrixTransform = matrices.identity();

  matrixTransform = matrices.multiply(
    matrixTransform,
    matrices.translate(transform.translate[0], transform.translate[1], transform.translate[2])
  );

  matrixTransform = matrices.multiply(
    matrixTransform,
    matrices.translate(centroid[0], centroid[1], centroid[2])
  );

  matrixTransform = matrices.multiply(matrixTransform, matrices.xRotate(transform.rotate[0]));
  matrixTransform = matrices.multiply(matrixTransform, matrices.yRotate(transform.rotate[1]));
  matrixTransform = matrices.multiply(matrixTransform, matrices.zRotate(transform.rotate[2]));

  matrixTransform = matrices.multiply(
    matrixTransform,
    matrices.scale(transform.scale[0], transform.scale[1], transform.scale[2])
  );

  matrixTransform = matrices.multiply(
    matrixTransform,
    matrices.translate(-centroid[0], -centroid[1], -centroid[2])
  );

  return matrixTransform;
}

function setProjection(projection, far, near, theta, phi) {
  /* Setup projection for webgl canvas */
  const aspect = canvas.width / canvas.height;
  const fovy = (Math.PI / 180) * 45;
  const left = -2;
  const top = 2;
  const right = 2;
  const bottom = -2;
  let farOrtho = far * 1;
  let nearOrtho = Math.max(near * -10000, -farOrtho);
  // console.log(theta, phi, nearOrtho, farOrtho);

  if (projection === "orthographic") {
    return matrices.orthographic(left, right, bottom, top, nearOrtho, farOrtho);
  } else if (projection === "oblique") {
    return matrices.multiply(
      matrices.oblique(theta, phi),
      matrices.orthographic(left, right, bottom, top, nearOrtho, farOrtho)
    );
  } else if (projection === "perspective") {
    return matrices.perspective(fovy, aspect, near, far);
  }
}

// create3d(state.model, cubesVert);

// console.log(JSON.stringify(state.model));

// let len = vert.length / 4;
// for (let i = 0; i < len; i++) {
//   let a = vert.slice(i * 4, (i + 1) * 4);
//   b = createSides(state.model, a);

//   state.model.vertices.push(...b.vertices);
//   state.model.faces.push(...b.faces);
//   state.model.colors.push(...b.colors);
//   state.model.normals.push(...b.normals);
// }

// console.log(state.model);
