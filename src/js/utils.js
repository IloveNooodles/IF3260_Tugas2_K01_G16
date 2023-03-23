function radToDeg(radians) {
  return (radians * 180) / Math.PI;
}

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function resizeCanvas(canvas) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    canvas.width = width;
    canvas.height = height;
  }
}

/* matrix is 3d */
function locateCentroid(matrix) {
  let x = 0;
  let y = 0;
  let z = 0;
  let vertexCount = matrix.length;
  for (let i = 0; i < vertexCount; i++) {
    x += matrix[i][0];
    y += matrix[i][1];
    z += matrix[i][2];
  }

  x = x / vertexCount;
  y = y / vertexCount;
  z = z / vertexCount;

  return { x, y, z };
}

/* Calculate normal vector */
/* Isinya 3 array */
function calculateNormal(array) {
  /* v1: 2 - 1, v2: 3 - 2 */
  len = array.length;
  normal = [];
  for (let i = 0; i < len - 2; i++) {
    v1 = {
      x: array[i + 1][0] - array[i][0],
      y: array[i + 1][1] - array[i][1],
      z: array[i + 1][2] - array[i][2],
    };

    v2 = {
      x: array[i + 2][0] - array[i + 1][0],
      y: array[i + 2][1] - array[i + 1][1],
      z: array[i + 2][2] - array[i + 1][2],
    };

    cross = [];
    cross.push(v1.y * v2.z - v1.z * v2.y);
    cross.push(v1.z * v2.x - v1.x * v2.z);
    cross.push(v1.x * v2.y - v1.y * v2.x);
    if (i == 0) {
      normal.push(cross);
      normal.push(cross);
      normal.push(cross);
    } else {
      normal.push(cross);
    }
  }
  return normal;
}

/* Will create 1 sides with 2 faces */
/* will return array vertices, colors, faces, normal */
/* 1 array will contains minimal 3 vertex */
function createSides(model, array) {
  len = model.vertices.length - 1;
  arrLen = array.length;
  /* Add color */
  for (let i = 0; i < arrLen; i++) {
    color = Math.random();
    model.colors.push([color, color, color]);
  }

  model.normal.push();

  model.vertices.push(...array);

  /* Create inward faces and outward faces*/
  for (let i = 0; i < arrLen - 2; ) {
    model.vertices.push(
      [len + 1, len + 2 + i, len + 3 + i],
      [len + 1, len + 3 + i, len + 2 + i]
    );
  }
}
