/* ======= Shader object ======= */
const vertex_shader_3d = `
attribute vec3 aPosition;
attribute vec3 aColor;
attribute vec3 aNormal;
varying vec4 fragColor;
varying vec3 vNormal;
uniform float fudgeFactor;
uniform mat4 uTransformationMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
varying float colorFactor;

void main(void) {
    vec4 transformedPos = uTransformationMatrix * vec4(aPosition, 1.0);
    vec4 projectedPos   = uProjectionMatrix * transformedPos;
    if (fudgeFactor < 0.01)
        gl_Position = projectedPos;
    else {
        float zDivider = 1.0 + projectedPos.z * fudgeFactor;
        gl_Position = vec4(projectedPos.xy / zDivider, projectedPos.zw);
    }
    vNormal = aNormal;
    fragColor = vec4(aColor, 1.0);    
    colorFactor = min(max((1.0 - transformedPos.z) / 2.0, 0.0), 1.0);
}
`;

const fragment_shader_3d = `
precision mediump float;
varying vec3 vNormal;
uniform vec3 userColor;
uniform vec3 uReverseLightDirection;
varying float colorFactor;

void main(void) {
    vec3 normal = normalize(vNormal);
    float light = dot(normal, uReverseLightDirection);
    gl_FragColor = vec4(userColor * colorFactor, 1.0);
    gl_FragColor.rgb *= light;
}
`;

const fragment_shader_3d_no_lighting = `
precision mediump float;
varying vec4 fragColor;

void main(void) {
    gl_FragColor = fragColor;
}
`;

/* ======= WebGL Init ======= */

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
