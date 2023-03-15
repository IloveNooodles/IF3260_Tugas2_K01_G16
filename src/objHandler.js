function objParser(text) {
  const lines = text.split("\n");
  const vertices = [];
  const faces = [];
  const normals = [];
  const uvs = [];
  const model = {
    vertices,
    faces,
    normals,
    uvs,
  };
  lines.forEach((line) => {
    const tokens = line.split(" ");
    if (tokens[0] === "v") {
      vertices.push(tokens.slice(1).map(parseFloat));
    } else if (tokens[0] === "f") {
      faces.push(tokens.slice(1).map((token) => token.split("/")));
    } else if (tokens[0] === "vn") {
      normals.push(tokens.slice(1).map(parseFloat));
    } else if (tokens[0] === "vt") {
      uvs.push(tokens.slice(1).map(parseFloat));
    } else if (tokens[0] === "#") {
      // ignore comments
    }
  });
  return model;
}

function createObjFile(model) {
  const { vertices, faces, normals, uvs } = model;
  let obj = "";
  if (vertices.length > 0) {
    vertices.forEach((vertex) => {
      obj += `v ${vertex.join(" ")}\n`;
    });
  }
  if (uvs.length > 0) {
    uvs.forEach((uv) => {
      obj += `vt ${uv.join(" ")}\n`;
    });
  }
  if (normals.length > 0) {
    normals.forEach((normal) => {
      obj += `vn ${normal.join(" ")}\n`;
    });
  }
  if (faces.length > 0) {
    faces.forEach((face) => {
      obj += `f ${face.map((f) => f.join("/")).join(" ")}\n`;
    });
  }
  return obj;
}
