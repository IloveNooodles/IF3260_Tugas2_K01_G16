/* ======= Global object ======= */
var state;
setDefaultState();

function setDefaultState() {
  /* Setup default state for webgl canvas */
  state = {
    model: {
      vertices: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
        [1, 1, 0],
      ],
      // Faces are 1 index based
      faces: [
        [1, 2, 3],
        [1, 2, 4],
      ],

      colors: [
        [1, 0.5, 0.2],
        [0.4, 1, 1],
      ],
      normals: [], // not used
      uvs: [], // not used
    },
    transform: {
      translate: [0, 0, 0], // x, y, z
      rotate: [0, 0, 0], // x, y, z
      scale: [1, 1, 1], // x, y, z
    },
    projection: "perspective", // orthographic, oblique, or perspective
    fudgeFactor: 0.0, // perspective projection
    lighting: false,
    pickedColor: [0.0, 0.0, 0.0], // r, g, b, a
  };

  if (state.projection === "perspective") {
    state.transform.translate[2] = -5 + 100 / 100;
  } else if (state.projection == "orthographic") {
    //?
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

/* ======= Event Listener ======= */
projectionRadio.forEach((radio) => {
  radio.addEventListener("change", () => {
    state.projection = radio.value;
    render();
  });
});

modelInput.addEventListener("change", () => {
  const file = modelInput.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const color = state.pickedColor;
    setDefaultState();
    clear();
    state.model = objParser(text);
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
    program = createShaderProgram(
      gl,
      vertex_shader_3d,
      fragment_shader_3d_no_lighting
    );
  }
  render();
});

reset.addEventListener("click", () => {
  setDefaultState();
  modelInput.value = "";
  clear();
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
  state.transform.rotate[0] = -1 + (2 * rangeRotateX.value * 2 * Math.PI) / 100;
  render();
});

rangeRotateY.addEventListener("input", () => {
  state.transform.rotate[1] = -1 + (2 * rangeRotateY.value * 2 * Math.PI) / 100;
  render();
});

rangeRotateZ.addEventListener("input", () => {
  state.transform.rotate[2] = -1 + (2 * rangeRotateZ.value * 2 * Math.PI) / 100;
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
  console.log(state.fudgeFactor);
  render();
});

/* ======= WebGL Functions ======= */
const gl = canvas.getContext("webgl");
var program = createShaderProgram(
  gl,
  vertex_shader_3d,
  fragment_shader_3d_no_lighting
);

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

  /* get all the necessary object */
  const geometry = setGeometry(gl, state.model, true);
  const transform = setTransform(state.transform);
  const projection = setProjection(state.projection);

  /* get WebGl attribute and location */
  var aPosition = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

  var vertColor = gl.getAttribLocation(program, "aColor");
  gl.enableVertexAttribArray(vertColor);
  gl.vertexAttribPointer(vertColor, 3, gl.FLOAT, false, 0, 0);

  var fudgeFactor = gl.getUniformLocation(program, "fudgeFactor");
  gl.uniform1f(fudgeFactor, state.fudgeFactor);

  var transformationMatrix = gl.getUniformLocation(
    program,
    "uTransformationMatrix"
  );
  gl.uniformMatrix4fv(transformationMatrix, false, transform);

  var uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
  gl.uniformMatrix4fv(uProjectionMatrix, false, projection);

  var userColor = gl.getUniformLocation(program, "userColor");
  gl.uniform3fv(userColor, state.pickedColor);

  // console.log(state.model.vertices);
  // console.log(state.model.faces);
  gl.drawElements(gl.TRIANGLES, geometry.numFaces, gl.UNSIGNED_SHORT, 0);

  // requestAnimationFrame(render);
}

function setGeometry(gl, model, isColor = false) {
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

  if (isColor) {
    const colorBuffer = gl.createBuffer();
    const colors = new Float32Array(model.colors.flat(1));
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    return {
      vertexBuffer,
      faceBuffer,
      colorBuffer,
      numFaces: faces.length,
    };
  }

  console.log(vertices, faces);
  return {
    vertexBuffer,
    faceBuffer,
    numFaces: faces.length,
  };
}

function setTransform(transform) {
  /* Setup transform for webgl canvas */
  const matrixTranslate = matrices.translate(
    transform.translate[0],
    transform.translate[1],
    transform.translate[2]
  );
  const matrixXRotate = matrices.multiply(
    matrixTranslate,
    matrices.xRotate(transform.rotate[0])
  );
  const matrixYRotate = matrices.multiply(
    matrixXRotate,
    matrices.yRotate(transform.rotate[1])
  );
  const matrixZRotate = matrices.multiply(
    matrixYRotate,
    matrices.zRotate(transform.rotate[2])
  );
  const matrixScale = matrices.multiply(
    matrixZRotate,
    matrices.scale(transform.scale[0], transform.scale[1], transform.scale[2])
  );
  return matrixScale;
}

function setProjection(projection) {
  /* Setup projection for webgl canvas */
  const aspect = canvas.width / canvas.height;
  const near = 0.1;
  const far = 1000.0;
  const fovy = (Math.PI / 180) * 45;
  const left = 0;
  const top = 0;
  const right = gl.canvas.clientWidth;
  const bottom = gl.canvas.clientHeight;

  if (projection === "orthographic") {
    let oFar = -400;
    let oNear = 400;
    return matrices.orthographic(left, right, bottom, top, oNear, oFar);
  } else if (projection === "oblique") {
    // return matrices.oblique(-1, 1, -1, 1, near, far);
  } else if (projection === "perspective") {
    return matrices.perspective(fovy, aspect, near, far);
  }
}
