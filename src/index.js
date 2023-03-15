/* ======= Shader object ======= */
const vertex_shader_3d = `
attribute vec3 coordinates;
uniform float fudgeFactor;
uniform mat4 transformationMatrix;
uniform mat4 uProjectionMatrix;
varying float colorFactor;

void main(void) {
    vec4 transformedPos = transformationMatrix * vec4(coordinates.xy, coordinates.z * -1.0, 1.0);
    vec4 projectedPos   = uProjectionMatrix * transformedPos;
    if (fudgeFactor < 0.01)
        gl_Position = projectedPos;
    else {
        float zDivider = 2.0 + projectedPos.z * fudgeFactor;
        gl_Position = vec4(projectedPos.xy / zDivider, projectedPos.zw);
    }
    colorFactor = min(max((1.0 - transformedPos.z) / 2.0, 0.0), 1.0);
}
`;

const fragment_shader_3d = `
precision mediump float;
uniform vec3 userColor;
varying float colorFactor;

void main(void) {
    gl_FragColor = vec4(userColor * colorFactor, 1.0);
}
`;

const fragment_shader_3d_no_lighting = `
precision mediump float;
uniform vec3 userColor;
varying float colorFactor;

void main(void) {
    gl_FragColor = vec4(userColor, 1.0);
}
`;

/* ======= Global object ======= */
var state;

function setDefaultState() {
  /* Setup default state for webgl canvas */
  state = {
    model: {},
    transform: {
      translate: [0, 0, 0], // x, y, z
      rotate: [0, 0, (Math.PI / 180) * 45], // x, y, z
      scale: [1, 1, 1], // x, y, z
    },
    projection: "orthographic", // orthographic, oblique, or perspective
    lighting: true,
    pickedColor: [0.0, 0.0, 0.0, 1.0], // r, g, b, a
  };
}

/* ======= Get Document Object Model ======= */
const canvas = document.getElementById("canvas");
const reset = document.getElementById("reset");
const projectionRadio = document.getElementsByName("projection");
const lightingCheckbox = document.getElementById("lighting");
const colorPicker = document.getElementById("color-picker");

/* ======= Event Listener ======= */
reset.addEventListener("click", () => {
  clear();
});

projectionRadio.forEach((radio) => {
  radio.addEventListener("change", () => {
    state.projection = radio.value;
  });
});

colorPicker.addEventListener("change", () => {
  const color = colorPicker.value;
  /* convert hex to rgb, normalize */
  state.pickedColor = [
    parseInt(color.substring(1, 3), 16) / 255,
    parseInt(color.substring(3, 5), 16) / 255,
    parseInt(color.substring(5, 7), 16) / 255,
    1.0,
  ];
});

lightingCheckbox.addEventListener("change", () => {
  state.lighting = lightingCheckbox.checked;
});

/* ======= WebGL Functions ======= */
const gl = canvas.getContext("webgl");
const program = createShaderProgram(gl, vertex_shader_3d, fragment_shader_3d);

window.onload = function () {
  if (!gl) {
    alert("WebGL not supported");
  }
  setDefaultState();
  clear();
};

function clear() {
  /* Setup black screen for webgl canvas */
  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function loadShader(gl, type, input) {
  let shader = gl.createShader(type);

  gl.shaderSource(shader, input);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("ERROR compiling vertex shader!", gl.getShaderInfoLog(vertexShader));
    return null;
  }

  return shader;
}

function createShaderProgram(gl, vertexShaderText, fragmentShaderText) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderText);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERROR linking program!", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return;
  }

  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR validating program!", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return;
  }

  /* dont forget to delete shader after use it  */
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}
