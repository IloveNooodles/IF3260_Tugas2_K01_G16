/* ======= Global object ======= */
var state;
setDefaultState();

function setDefaultState() {
  /* Setup default state for webgl canvas */
  state = {
    model: {
      vertices: [],
      faces: [],
      normals: [], // not used
      uvs: [], // not used
    },
    transform: {
      translate: [0, 0, -300], // x, y, z
      rotate: [0, 0, (Math.PI / 180) * 45], // x, y, z
      scale: [1, 1, 1], // x, y, z
    },
    projection: "perspective", // orthographic, oblique, or perspective
    lighting: true,
    pickedColor: [0.0, 0.0, 0.0], // r, g, b, a
  };
}

/* ======= Get Document Object Model ======= */
const canvas = document.getElementById("canvas");
const projectionRadio = document.getElementsByName("projection");
const modelInput = document.getElementById("objFile");
const buttonSave = document.getElementById("save");
const colorPicker = document.getElementById("color-picker");
const lightingCheckbox = document.getElementById("lighting");
const reset = document.getElementById("reset");

const rangeTranslateZ = document.getElementById("translate-z");

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
    setDefaultState();
    clear();
    const text = e.target.result;
    state.model = objParser(text);
    console.log(state.model);
  };
  reader.readAsText(file);
  render();
});

buttonSave.addEventListener("click", () => {
  const obj = createObjFile(state.model);
  const blob = new Blob([obj], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
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
});

lightingCheckbox.addEventListener("change", () => {
  state.lighting = lightingCheckbox.checked;
  if (state.lighting) {
    program = createShaderProgram(gl, vertex_shader_3d, fragment_shader_3d);
  } else {
    program = createShaderProgram(gl, vertex_shader_3d, fragment_shader_3d_no_lighting);
  }
  console.log("lighting: " + state.lighting);
  render();
});

reset.addEventListener("click", () => {
  setDefaultState();
  modelInput.value = "";
  console.log(state);
  clear();
});

rangeTranslateZ.addEventListener("input", () => {
  state.transform.translate[2] = -1 + (2 * rangeTranslateZ.value) / 100;
  console.log(state.transform.translate);
  render();
});

/* ======= WebGL Functions ======= */
const gl = canvas.getContext("webgl");
const program = createShaderProgram(gl, vertex_shader_3d, fragment_shader_3d_no_lighting);

window.onload = function () {
  if (!gl) {
    alert("WebGL not supported");
  }
  clear();
};

function clear() {
  /* Setup black screen for webgl canvas */
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function render() {
  // console.log(state.model);
  /* Render loop for webgl canvas */
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  clear();
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  const geometry = setGeometry(gl, state.model);
  const transform = setTransform(state.transform);
  const projection = setProjection(state.projection);

  gl.useProgram(program);

  const vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  const fudgeFactor = gl.getUniformLocation(program, "fudgeFactor");
  if (state.projection === "perspective") {
    gl.uniform1f(fudgeFactor, 1.2);
  } else {
    gl.uniform1f(fudgeFactor, 1.0);
  }

  const transformationMatrix = gl.getUniformLocation(program, "transformationMatrix");
  gl.uniformMatrix4fv(transformationMatrix, false, transform);

  const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
  gl.uniformMatrix4fv(uProjectionMatrix, false, projection);

  const userColor = gl.getUniformLocation(program, "userColor");
  gl.uniform3fv(userColor, state.pickedColor);

  gl.drawArrays(gl.TRIANGLES, geometry.numFaces, 0);

  // requestAnimationFrame(render);
}

function setGeometry(gl, model) {
  /* Setup geometry for webgl canvas */
  const vertices = new Float32Array(model.vertices);
  const faces = new Uint16Array(model.faces);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const faceBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faces, gl.STATIC_DRAW);

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
  const matrixXRotate = matrices.multiply(matrixTranslate, matrices.xRotate(transform.rotate[0]));
  const matrixYRotate = matrices.multiply(matrixXRotate, matrices.yRotate(transform.rotate[1]));
  const matrixZRotate = matrices.multiply(matrixYRotate, matrices.zRotate(transform.rotate[2]));
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

  if (projection === "orthographic") {
    // return matrices.orthographic(-1, 1, -1, 1, near, far);
  } else if (projection === "oblique") {
    // return matrices.oblique(-1, 1, -1, 1, near, far);
  } else if (projection === "perspective") {
    return matrices.perspective(fovy, aspect, near, far);
  }
}
