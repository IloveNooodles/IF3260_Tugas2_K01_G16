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

/* ======= Event Listener ======= */
const canvas = document.getElementById("canvas");

/* ======= WebGL Functions ======= */
const gl = canvas.getContext("webgl");

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
