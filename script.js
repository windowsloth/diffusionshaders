function resizeCanvasToDisplaySize(canvas) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth  = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = canvas.width  !== displayWidth ||
                     canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

function createShader(gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

// let vertexSource = document.getElementById('vertex').innerText;

function createProgram(gl, vertex, frag) {
  let program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  let success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgarmInfo(program));
  gl.deleteProgram(program);
}



function main() {
  const canvas = document.createElement('canvas');

  // canvas.parent('body');
  // const body = document.getElementsByTagName('body');
  // canvas.parent()
  // const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl');
  // document.body.appendChild(canvas);
  if (!gl) {
    console.log('No WebGL!');
  }

  let vertexSource = `
    attribute vec4 a_position;

    void main() {
      gl_Position = a_position;
    }
  `;
  // let fragSource = document.getElementById('frag').innertext;
  let fragSource = `
    precision mediump float;

    void main() {
      gl_FragColor = vec4(1, 0, 0.5, 1);
    }
  `;

  let vertex = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  let frag = createShader(gl, gl.FRAGMENT_SHADER, fragSource);

  let program= createProgram(gl, vertex, frag);

  let positionAttrLoc = gl.getAttribLocation(program, 'a_position');
  let positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  let positions = [ 0, 0, 0, 0.5, 0.7, 0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


  resizeCanvasToDisplaySize(gl.canvas);
  // webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  gl.enableVertexAttribArray(positionAttrLoc);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  let size = 2;
  let type = gl.FLOAT;
  let normalize = false;
  let stride = 0;
  let offset = 0;
  gl.vertexAttribPointer(positionAttrLoc, size, type, normalize, stride, offset);

  let primitiveType = gl.TRIANGLES;
  offset = 0;
  let count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

main();
