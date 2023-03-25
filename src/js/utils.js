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

function setPrecision(number) {
  return parseFloat(number.toPrecision(12));
}

/* matrix is 3d */
function locateCentroid(matrix) {
  let x = 0;
  let y = 0;
  let z = 0;
  let vertexCount = matrix.length;
  for (let i = 0; i < vertexCount; i++) {
    x = setPrecision(matrix[i][0] + x);
    y = setPrecision(matrix[i][1] + y);
    z = setPrecision(matrix[i][2] + z);
  }

  x = x / vertexCount;
  y = y / vertexCount;
  z = z / vertexCount;

  return [x, y, z];
}

/* Calculate normal vector */
/* Isinya 3 array */
function calculateNormal(array) {
  /* v1: 2 - 1, v2: 3 - 2 */
  let len = array.length;
  let normal = [];
  for (let i = 0; i < len - 2; i++) {
    let v1 = {
      x: array[i + 1][0] - array[i][0],
      y: array[i + 1][1] - array[i][1],
      z: array[i + 1][2] - array[i][2],
    };

    let v2 = {
      x: array[i + 2][0] - array[i + 1][0],
      y: array[i + 2][1] - array[i + 1][1],
      z: array[i + 2][2] - array[i + 1][2],
    };

    let cross = [];
    cross.push(v1.y * v2.z - v1.z * v2.y);
    cross.push(v1.z * v2.x - v1.x * v2.z);
    cross.push(v1.x * v2.y - v1.y * v2.x);

    /* Normalize vector */
    let vectorLen = calculateEulerDistance(cross);

    for (let j = 0; j < cross.length; j++) {
      if (!cross[j]) {
        cross[j] = 0;
      }
      cross[j] = cross[j] / vectorLen;
    }

    // if (i == 0) {
    //   normal.push(cross);
    //   normal.push(cross);
    //   normal.push(cross);
    // } else {
    //   normal.push(cross);
    // }
    normal = cross;
  }
  return normal;
}

function calculateEulerDistance(cross) {
  return Math.sqrt(
    Math.pow(cross[0], 2) + Math.pow(cross[1], 2) + Math.pow(cross[2], 2)
  );
}

/* Will create 1 sides with 2 faces */
/* will return array vertices, colors, faces, normal */
/* 1 array will contains minimal 3 vertex */
function createSides(model, array) {
  let arrLen = array.length;
  let len = model.vertices.length;
  /* Add color */
  let colors = [];
  let normals = [];
  let faces = [];
  let vertices = [];
  let normals2 = [];

  for (let i = 0; i < arrLen; i++) {
    colors.push([Math.random(), Math.random(), Math.random()]);
  }

  /* Create inward faces and outward faces*/
  for (let i = 0; i < arrLen - 2; i++) {
    faces.push(
      [len + 1, len + 2 + i, len + 3 + i],
      [len + 1, len + 3 + i, len + 2 + i]
    );
  }

  vertices.push(...array);


  return {
    vertices,
    faces,
    colors,
    // normals,
  };
}

function create3d(model, vert) {
  let len = vert.length / 4;
  for (let i = 0; i < len; i++) {
    let a = vert.slice(i * 4, (i + 1) * 4);
    let b = createSides(model, a);

    model.vertices.push(...b.vertices);
    model.faces.push(...b.faces);
    model.colors.push(...b.colors);
    // model.normals.push(...b.normals);
  }

  len = model.faces.length;
  let normals = Array(len).fill([]);
  for (let i = 0; i < len; i++) {
    let selectedFaces = model.faces[i];
    selectedFaces = selectedFaces.map((x) => x - 1);

    let a = model.vertices[selectedFaces[0]];
    let b = model.vertices[selectedFaces[1]];
    let c = model.vertices[selectedFaces[2]];

    let selectedArr = [a, b, c];
    let normal = calculateNormal(selectedArr);
    for (let i = 0; i < 3; i++) {
      let selectedIndex = selectedFaces[i];
      normals[selectedIndex] = normal;
    }
  }

  model.normals = normals
  console.log(JSON.stringify(normals))

}

function normalize(v) {
  let length = calculateEulerDistance(v);
  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
  }
}

function subtractVectors(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}


