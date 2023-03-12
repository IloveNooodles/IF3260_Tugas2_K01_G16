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

const fragment_shader_3d_no_ligthing = `
precision mediump float;
uniform vec3 userColor;
varying float colorFactor;

void main(void) {
    gl_FragColor = vec4(userColor, 1.0);
}
`;

/* ======= Global object ======= */

/* ======= Get Document Object Model ======= */
const canvas = document.getElementById("canvas");
const reset = document.getElementById("reset");

/* ======= Event Listener ======= */
reset.addEventListener("click", () => {
  clear();
});

/* ======= WebGL Functions ======= */
const gl = canvas.getContext("webgl");
const program = createShaderProgram(gl, vertex_shader_3d, fragment_shader_3d);

window.onload = function () {
  if (!gl) {
    alert("WebGL not supported");
  }

  clear();
};

function clear() {
  /* Setup black screan for webgl canvas */
  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function loadShader(gl, type, input) {
  let shader = gl.createShader(type);

  gl.shaderSource(shader, input);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "ERROR compiling vertex shader!",
      gl.getShaderInfoLog(vertexShader)
    );
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
