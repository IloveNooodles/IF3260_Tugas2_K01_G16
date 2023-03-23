var tetrahedron = {
  vertices: [
    [-0.610356, -0.444827, -0.029075],
    [0.208553, 0.880554, -0.029075],
    [0.765802, -0.450889, 0.857546],
    [1.027463, -0.444827, -0.847984],
    [-0.622632, -0.450889, 0.034382],
    [0.200532, 0.881377, 0.034382],
    [1.09572, -0.456592, -0.827871],
    [-0.620128, -0.504454, 0.005482],
    [0.263727, 0.889964, 0.004122],
    [0.83506, -0.456592, 0.836115],
    [0.813439, -0.504454, 0.855404],
    [1.079716, -0.504454, -0.84444],
    [0.21262, 0.9886, 0.002271],
    [0.846111, -0.504454, 0.924781],
    [1.13513, -0.504454, -0.920238],
    [-0.70989, -0.504454, 0.002271],
  ],
  faces: [
    [1, 13, 2],
    [4, 13, 15],
    [4, 16, 1],
    [6, 16, 5],
    [3, 16, 14],
    [3, 13, 6],
    [7, 14, 15],
    [7, 13, 9],
    [9, 14, 10],
    [12, 14, 11],
    [8, 14, 16],
    [12, 16, 15],
    [5, 1, 8],
    [9, 2, 6],
    [7, 4, 12],
    [10, 3, 11],
    [3, 9, 10],
    [6, 1, 2],
    [4, 9, 2],
    [8, 4, 1],
    [12, 10, 7],
    [3, 8, 5],
    [1, 16, 13],
    [4, 2, 13],
    [4, 15, 16],
    [6, 13, 16],
    [3, 5, 16],
    [3, 14, 13],
    [7, 10, 14],
    [7, 15, 13],
    [9, 13, 14],
    [12, 15, 14],
    [8, 11, 14],
    [12, 8, 16],
    [3, 6, 9],
    [6, 5, 1],
    [4, 7, 9],
    [8, 12, 4],
    [12, 11, 10],
    [3, 11, 8],
  ],
  colors: [
    [0.2, 0.2, 0.2],
    [0.2, 0.2, 0.2],
    [0.2, 0.2, 0.2],
    [0.2, 0.2, 0.2],
    [0.2, 0.2, 0.2],
    [0.1, 0.6, 0.1],
    [0.1, 0.6, 0.1],
    [0.1, 0.6, 0.1],
    [0.1, 0.6, 0.1],
    [0.1, 0.6, 0.1],
    [0.6, 0.1, 0.1],
    [0.6, 0.1, 0.1],
    [0.6, 0.1, 0.1],
    [0.6, 0.1, 0.1],
    [0.6, 0.1, 0.1],
    [0.1, 0.1, 0.6],
    [0.1, 0.1, 0.6],
    [0.1, 0.1, 0.6],
    [0.1, 0.1, 0.6],
    [0.1, 0.1, 0.6],
    [0.6, 0.6, 0.1],
    [0.6, 0.6, 0.1],
    [0.6, 0.6, 0.1],
    [0.6, 0.6, 0.1],
    [0.6, 0.6, 0.1],
    [0.1, 0.6, 0.6],
    [0.1, 0.6, 0.6],
    [0.1, 0.6, 0.6],
    [0.1, 0.6, 0.6],
    [0.1, 0.6, 0.6],
    [0.6, 0.1, 0.6],
    [0.6, 0.1, 0.6],
    [0.6, 0.1, 0.6],
    [0.6, 0.1, 0.6],
    [0.6, 0.1, 0.6],
    [0.6, 0.6, 0.6],
    [0.6, 0.6, 0.6],
    [0.6, 0.6, 0.6],
    [0.6, 0.6, 0.6],
    [0.6, 0.6, 0.6],
  ],
  normal: [],
};
var f = {
  vertices: [
    /* front */
    [-1, -1, 0],
    [1, -1, 0],
    [1, 1, 0],
    [-1, 1, 0],

    /* right */
    [1, 1, 0],
    [1, -1, 0],
    [1, -1, -1],
    [1, 1, -1],
  ],
  faces: [
    /* outward */
    [1, 2, 3],
    [1, 3, 4],
    [6, 5, 8],
    [6, 8, 7],
    [6, 7, 8],
    [6, 8, 5],

    /* Inward */
    [1, 4, 3],
    [1, 3, 2],
  ],
  colors: [
    [1, 0.5, 0.2],
    [0.4, 0.2, 0.7],
    [1, 0.5, 0.2],
    [0.4, 0.2, 0.7],
    [1, 0.5, 0.2],
    [0.4, 0.2, 0.7],
    [1, 0.5, 0.2],
    [0.4, 0.2, 0.7],
  ],
  normal: [],
};
