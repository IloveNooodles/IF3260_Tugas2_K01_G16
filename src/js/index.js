/* ======= Global object ======= */
var state;
setDefaultState();

function setDefaultState() {
  /* Setup default state for webgl canvas */
  state = {
    // model: octahedron,
    model: emptyModel,
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
      far: 50,
      radius: 1,
    },
    projection: "perspective", // orthographic, oblique, or perspective
    fudgeFactor: 0.0, // perspective projection
    lighting: false,
    theta: 15.0, // 15 - 165
    phi: 75.0, // 15 - 165
    pickedColor: [1, 0, 0], // r, g, b, a
    isObjectAnimate: false,
    degAnimate: 0.1,
  };

  if (state.projection === "perspective") {
    state.transform.translate[2] = -5;
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
const startAnim = document.getElementById("animation");
const stopAnim = document.getElementById("stop-anim");

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
const radius = document.getElementById("radius");

const rangeLookAtX = document.getElementById("look-at-x");
const rangeLookAtY = document.getElementById("look-at-y");
const rangeLookAtZ = document.getElementById("look-at-z");

const theta = document.getElementById("theta");
const phi = document.getElementById("phi");

/* ======= Event Listener ======= */
projectionRadio.forEach((radio) => {
  radio.addEventListener("change", () => {
    state.projection = radio.value;
    if (state.projection === "perspective") {
      state.transform.translate[2] = -5;
    }
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
  };
  reader.readAsText(file);
});

buttonSave.addEventListener("click", () => {
  const transform = setTransform(state.model, state.transform);
  // console.table(transform[1][0]);
  // console.table(state.model.vertices);
  const appliedtransform = state.model.vertices.map((x) =>
    matrices.applyTransform(transform, x)
  );
  // console.table(appliedtransform);
  state.model.vertices = appliedtransform;
  const obj = saveObject(state.model);
  const blob = new Blob([obj], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "model.json";
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
});

lightingCheckbox.addEventListener("change", () => {
  state.lighting = lightingCheckbox.checked;
  if (state.lighting) {
    program = createShaderProgram(gl, vertex_shader_3d, fragment_shader_3d);
  } else {
    program = createShaderProgram(
      gl,
      vertex_shader_3d,
      fragment_shader_3d_no_lighting
    );
  }
});

reset.addEventListener("click", () => {
  // setDefaultState();

  resetTransf();
  resetCam();
  state.projection = "orthographic";
  state.lighting = false;
  state.pickedColor = [0, 0, 0];
  state.isObjectAnimate = false;
  state.degAnimate = 0.1;
  // TODO: solve reset projectionRadio, lighting, colorPicker
  modelInput.value = "";
  projectionRadio[0].checked = true;
  projectionRadio[1].checked = false;
  projectionRadio[2].checked = false;
  lightingCheckbox.checked = false;
  colorPicker.value = "#FF0000";
  stopAnim.classList.add("hidden");
  startAnim.classList.remove("hidden");

  program = createShaderProgram(
    gl,
    vertex_shader_3d,
    fragment_shader_3d_no_lighting
  );
});

resetTransform.addEventListener("click", () => {
  resetTransf();
});

function resetTransf() {
  state.transform.translate = [0, 0, 0];
  state.transform.rotate = [0, 0, 0];
  state.transform.scale = [1, 1, 1];
  if (state.projection === "perspective") {
    state.transform.translate[2] = -5;
  }

  rangeTranslateX.value = 50;
  rangeTranslateY.value = 50;
  rangeTranslateZ.value = 50;
  rangeRotateX.value = 50;
  rangeRotateY.value = 50;
  rangeRotateZ.value = 50;
  scaleX.value = state.transform.scale[0];
  scaleY.value = state.transform.scale[1];
  scaleZ.value = state.transform.scale[2];
}

resetCamera.addEventListener("click", () => {
  resetCam();
});

function resetCam() {
  state.viewMatrix.camera = [0, 0, 0];
  state.viewMatrix.lookAt = [0, 0, 0];
  state.viewMatrix.up = [0, 1, 0];
  state.viewMatrix.near = 0.1;
  state.viewMatrix.far = 25;
  state.fudgeFactor = 0.0;
  state.theta = 15.0;
  state.phi = 75.0;

  rangeCameraX.value = 50;
  rangeCameraY.value = 50;
  rangeCameraZ.value = 50;
  rangeLookAtX.value = 50;
  rangeLookAtY.value = 50;
  rangeLookAtZ.value = 50;
  rangeFOV.value = 0.0;
  theta.value = 15.0;
  phi.value = 75.0;
}

startAnim.addEventListener("click", () => {
  state.isObjectAnimate = true;
  startAnim.classList.add("hidden");
  stopAnim.classList.remove("hidden");
});

stopAnim.addEventListener("click", () => {
  state.isObjectAnimate = false;
  stopAnim.classList.add("hidden");
  startAnim.classList.remove("hidden");
});

rangeTranslateX.addEventListener("input", () => {
  state.transform.translate[0] = -1 + (2 * rangeTranslateX.value) / 100;
});

rangeTranslateY.addEventListener("input", () => {
  state.transform.translate[1] = -1 + (2 * rangeTranslateY.value) / 100;
});

rangeTranslateZ.addEventListener("input", () => {
  if (state.projection === "perspective") {
    state.transform.translate[2] = -5 + (2 * rangeTranslateZ.value) / 100;
  } else {
    state.transform.translate[2] = -1 + (2 * rangeTranslateZ.value) / 100;
  }
});

/* rotate from -360 to 360 */
rangeRotateX.addEventListener("input", () => {
  // rotate -360 to 360
  state.transform.rotate[0] = (2 * rangeRotateX.value * 2 * Math.PI) / 100;
});

rangeRotateY.addEventListener("input", () => {
  state.transform.rotate[1] = (2 * rangeRotateY.value * 2 * Math.PI) / 100;
});

rangeRotateZ.addEventListener("input", () => {
  state.transform.rotate[2] = (2 * rangeRotateZ.value * 2 * Math.PI) / 100;
});

/* scale from -5 to 5 */
scaleX.addEventListener("input", () => {
  state.transform.scale[0] = scaleX.value / 20;
});

scaleY.addEventListener("input", () => {
  state.transform.scale[1] = scaleY.value / 20;
});

scaleZ.addEventListener("input", () => {
  state.transform.scale[2] = scaleZ.value / 20;
});

rangeFOV.addEventListener("input", () => {
  state.fudgeFactor = rangeFOV.value / 100;
  // console.log(state.fudgeFactor);
});

radius.addEventListener("input", () => {
  state.viewMatrix.radius = parseInt(radius.value);
});

rangeLookAtX.addEventListener("input", () => {
  state.viewMatrix.lookAt[0] = (2 * rangeLookAtX.value * 2 * Math.PI) / 100;
});

rangeLookAtY.addEventListener("input", () => {
  state.viewMatrix.lookAt[1] = (2 * rangeLookAtY.value * 2 * Math.PI) / 100;
});

rangeLookAtZ.addEventListener("input", () => {
  state.viewMatrix.lookAt[2] = (2 * rangeLookAtZ.value * 2 * Math.PI) / 100;
});

theta.addEventListener("input", () => {
  state.theta = parseInt(theta.value);
});

phi.addEventListener("input", () => {
  state.phi = parseInt(phi.value);
});

/* ======= WebGL Functions ======= */
const gl = canvas.getContext("webgl");
var program = createShaderProgram(
  gl,
  vertex_shader_3d,
  fragment_shader_3d_no_lighting
);

window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

window.onload = function () {
  if (!gl) {
    alert("WebGL not supported");
  }
  rangeFOV.value = 0;
  colorPicker.value = "#FF0000";
  state.pickedColor = [1, 0, 0];
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

  const view = setView(state.viewMatrix);
  const geometry = setGeometry(gl, state.model, view);
  const transform = setTransform(state.model, state.transform);
  const projection = setProjection(
    state.projection,
    state.viewMatrix.far,
    state.viewMatrix.near,
    state.theta,
    state.phi
  );

  if (state.isObjectAnimate) {
    state.transform.rotate[0] = (2 * state.degAnimate * 2 * Math.PI) / 100;
    state.degAnimate += 0.1;
  }

  var fudgeFactor = gl.getUniformLocation(program, "fudgeFactor");
  gl.uniform1f(fudgeFactor, state.fudgeFactor);

  var transformationMatrix = gl.getUniformLocation(
    program,
    "uTransformationMatrix"
  );
  gl.uniformMatrix4fv(transformationMatrix, false, transform);

  var uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
  gl.uniformMatrix4fv(
    uProjectionMatrix,
    false,
    matrices.multiply(projection, view)
  );

  /* Caclulate normal matrix */
  var normalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
  let modelMatrix = matrices.multiply(view, transform);
  let nMatrix = matrices.inverse(modelMatrix);
  nMatrix = matrices.transpose(nMatrix);

  gl.uniformMatrix4fv(normalMatrix, false, nMatrix);

  if (state.lighting) {
    var userColor = gl.getUniformLocation(program, "userColor");
    gl.uniform3fv(userColor, state.pickedColor);

    var reverseLightDirectionLocation = gl.getUniformLocation(
      program,
      "uReverseLightDirection"
    );

    normalizeLight = matrices.normalize([0.5, 0.7, 1]);

    gl.uniform3fv(
      reverseLightDirectionLocation,
      matrices.normalize(normalizeLight)
    );
  } else {
    setColor(gl, state.model);
    var vertColor = gl.getAttribLocation(program, "aColor");
    gl.enableVertexAttribArray(vertColor);
    gl.vertexAttribPointer(vertColor, 3, gl.FLOAT, false, 0, 0);
  }

  // gl.drawArrays(gl.TRIANGLES, 0, state.model.vertices.length);
  gl.drawElements(gl.TRIANGLES, geometry.numFaces, gl.UNSIGNED_SHORT, 0);

  window.requestAnimFrame(render);
}

function setView(vm) {
  /* Setup view for webgl canvas */
  var cameraMatrix = matrices.identity();
  cameraMatrix = matrices.multiply(
    cameraMatrix,
    matrices.translate(0, 0, vm.radius)
  );

  let deg = vm.lookAt.map((x) => degToRad(x));
  // console.log(deg);
  cameraMatrix = matrices.multiply(cameraMatrix, matrices.xRotate(deg[0]));
  cameraMatrix = matrices.multiply(cameraMatrix, matrices.yRotate(deg[1]));
  cameraMatrix = matrices.multiply(cameraMatrix, matrices.zRotate(deg[2]));

  let cameraPosition = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];

  let newCameraMatrix = matrices.lookAt(cameraPosition, [0, 0, 0], vm.up);
  var viewMatrix = matrices.inverse(newCameraMatrix);
  // viewMatrix = matrices.translate(0, 0, vm.radius);
  // console.log(cameraMatrix)
  // var cameraMatrix = matrices.translate(vm.camera[0], vm.camera[1], vm.radius);
  // cameraMatrix = matrices.multiply(cameraMatrix, matrices.xRotate(vm.lookAt[0]));
  // cameraMatrix = matrices.multiply(cameraMatrix, matrices.yRotate(vm.lookAt[1]));
  // cameraMatrix = matrices.multiply(cameraMatrix, matrices.zRotate(vm.lookAt[2]));
  // var viewMatrix = matrices.inverse(cameraMatrix);
  return viewMatrix;
}

function setGeometry(gl, model, view = []) {
  /* Setup geometry for webgl canvas */
  const vertices = new Float32Array(model.vertices.flat(1));
  // all faces are 1 based index. add elements -1 to convert to 0 index
  const faces = new Uint16Array(model.faces.flat(1).map((x) => x - 1));
  const normals = new Float32Array(model.normals.flat(1));

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

  const normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

  var aNormal = gl.getAttribLocation(program, "aNormal");
  gl.enableVertexAttribArray(aNormal);
  gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

  const faceBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faces, gl.STATIC_DRAW);

  // console.log(vertices, faces);
  return {
    vertexBuffer,
    faceBuffer,
    numFaces: faces.length,
    normalsBuffer,
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
    matrices.translate(
      transform.translate[0],
      transform.translate[1],
      transform.translate[2]
    )
  );

  matrixTransform = matrices.multiply(
    matrixTransform,
    matrices.translate(centroid[0], centroid[1], centroid[2])
  );

  matrixTransform = matrices.multiply(
    matrixTransform,
    matrices.xRotate(transform.rotate[0])
  );
  matrixTransform = matrices.multiply(
    matrixTransform,
    matrices.yRotate(transform.rotate[1])
  );
  matrixTransform = matrices.multiply(
    matrixTransform,
    matrices.zRotate(transform.rotate[2])
  );

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
  let nearOrtho = -farOrtho;
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

create3d(state.model, cubesVert);
console.log(state.model);
// console.log(JSON.stringify(state.model));
