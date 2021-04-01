let red_maxtime = 56.0;
let red_timeinterval = 1.0;
let red_stepsize = 5.0;

let green_maxtime = 56.0;
let green_timeinterval = 1.0;
let green_stepsize = 5.0;

let blue_maxtime = 56.0;
let blue_timeinterval = 1.0;
let blue_stepsize = 5.0;

let invert = 0.0;
const testimage = new Image();
let dimensions = new Float32Array([0.0, 0.0]);

$('document').ready(function() {
  testimage.onload = function() {
    dimensions[0] = testimage.width;
    dimensions[1] = testimage.height;
    main();
  }
  testimage.src = './soldiers.jpg'
});

const vert = `
  attribute vec4 position;
  attribute vec2 texcoord_attrib;
  varying vec2 texcoord;
  void main() {
    gl_Position = position;
    texcoord = texcoord_attrib;
  }
`;
const frag = `
  precision mediump float;

  uniform sampler2D u_image0;
  uniform sampler2D u_image1;
  uniform vec2 imgdim;

  uniform float invert;
  uniform float red_maxtime;
  uniform float red_timeinterval;
  uniform float red_stepsize;
  uniform float green_maxtime;
  uniform float green_timeinterval;
  uniform float green_stepsize;
  uniform float blue_maxtime;
  uniform float blue_timeinterval;
  uniform float blue_stepsize;

  varying vec2 texcoord;
  vec2 onepx = vec2(1.0, 1.0) / imgdim;

  float scalar = 1.61803398875;
  float hash(vec2 inp, float seed) {
    return fract(tan(distance(inp * scalar, inp) * seed) * inp.x);
  }
  float variance(float time, float delta, float stepsize) {
    return (time / delta) * stepsize * stepsize;
  }

  float posneg(vec2 inp, float seed) {
    float decider = hash(inp, seed);
    if (decider > 0.5) {
      return 1.0;
    } else {
      return -1.0;
    }
  }
  float percentile(vec2 inp, float seed) {
    float decider = hash(inp, seed);
    if (decider > 0.9973) {
      return 2.0;
    } else if (decider > 0.9545) {
      return 1.0;
    } else {
      return 0.0;
    }
  }
  float inversion(float inp, vec4 mapval) {
    if (inp == 1.0) {
      return mapval.x;
    } else {
      return 1.0 - mapval.x;
    }
  }
  vec4 getColor(vec2 inp, float seed, float time, float interval, float size) {
    float sigma = pow(variance(time, interval, size), 0.5);
    vec2 modvec = vec2 (
      posneg(inp, seed + 1.7) * hash(inp, seed + 2.0) * sigma + sigma * percentile(inp, seed + 3.4),
      posneg(inp, seed + 2.3) * hash(inp, seed + 5.1) * sigma + sigma * percentile(inp, seed + 2.9)
    ) * onepx;
    return texture2D(u_image0, texcoord + modvec);
  }
  void main() {
    vec2 coord = gl_FragCoord.xy;
    // float map_result = 0.5 + cos((inversion(invert, texture2D(u_image1, texcoord)) + 1.0) * 3.1415) / 2.0;
    // float map_result = 0.5 + cos((texture2D(u_image1, texcoord).x + 1.0) * 3.1415) / 2.0;
    float map_result = 1.0;
    float redtime = red_maxtime * map_result;
    float greentime = green_maxtime * map_result;
    float bluetime = blue_maxtime * map_result;
    vec4 testo = vec4(
      getColor(coord, 3.0, redtime, red_timeinterval, red_stepsize).x,
      getColor(coord, 7.3, greentime, green_timeinterval, green_stepsize).y,
      getColor(coord, 9.2, bluetime, blue_timeinterval, blue_stepsize).z,
      1.0
    );
    gl_FragColor = testo;
    // gl_FragColor = texture2D(u_image0, texcoord);
  }
`;

async function main() {
// REFACTORED SHADER CODE BASED ON WEBGL MDN EXAMPLES
// https://github.com/mdn/webgl-examples

  const canvas = document.querySelector('#glcanvas');
  canvas.width = testimage.width;
  canvas.height = testimage.height;
  const gl = canvas.getContext('webgl');

  // Error handling in case WebGL is not available
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  const shaderprogram = initShaderProgram(gl, vert, frag);
  const programinfo = {
    program: shaderprogram,
    attriblocations: {
      position_loc: gl.getAttribLocation(shaderprogram, 'position'),
      texcoord_loc: gl.getAttribLocation(shaderprogram, 'texcoord_attrib'),
    },
    uniformlocations: {
      image_loc: gl.getUniformLocation(shaderprogram, 'u_image0'),
      height_loc: gl.getUniformLocation(shaderprogram, 'u_image1'),
      dim_loc: gl.getUniformLocation(shaderprogram, 'imgdim'),

      invert_loc: gl.getUniformLocation(shaderprogram, 'invert'),
      red: {
        maxtimeloc: gl.getUniformLocation(shaderprogram, 'red_maxtime'),
        timeintervalloc: gl.getUniformLocation(shaderprogram, 'red_timeinterval'),
        stepsizeloc: gl.getUniformLocation(shaderprogram, 'red_stepsize'),
      },
      green: {
        maxtimeloc: gl.getUniformLocation(shaderprogram, 'green_maxtime'),
        timeintervalloc: gl.getUniformLocation(shaderprogram, 'green_timeinterval'),
        stepsizeloc: gl.getUniformLocation(shaderprogram, 'green_stepsize'),
      },
      blue: {
        maxtimeloc: gl.getUniformLocation(shaderprogram, 'blue_maxtime'),
        timeintervalloc: gl.getUniformLocation(shaderprogram, 'blue_timeinterval'),
        stepsizeloc: gl.getUniformLocation(shaderprogram, 'blue_stepsize'),
      },
    },
  };
  const buffers = initBuffers(gl);

//   const texture = gl.createTexture();
//   gl.bindTexture(gl.TEXTURE_2D, texture);
//   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, testimage);

//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

//   let textures = [
//     texture,
//     loadTexture(gl, './h1.jpg')
//   ];
  const testomania = await loadImage('soldiers.jpg');
  console.log('here is a weird thing: ' + testomania);
  const imagetexture = p_loadTexture(gl, await loadImage('soldiers.jpg'));
  const heightmaptexture = p_loadTexture(gl, await loadImage('h1.jpg'));
  const textures = [imagetexture, heightmaptexture];

  drawScene(gl, programinfo, buffers, textures);

  $('#red_maxtime').on('input', function() {
    red_maxtime = $('#red_maxtime').val();
    drawScene(gl, programinfo, buffers, textures);
  });
  $('#red_timeinterval').on('input', function() {
    red_timeinterval = $('#red_timeinterval').val() / 1000;
    drawScene(gl, programinfo, buffers, textures);
  });
  $('#red_stepsize').on('input', function() {
    red_stepsize = $('#red_stepsize').val() / 100;
    drawScene(gl, programinfo, buffers, textures);
  });

  $('#green_maxtime').on('input', function() {
    green_maxtime = $('#green_maxtime').val();
    drawScene(gl, programinfo, buffers, textures);
  });
  $('#green_timeinterval').on('input', function() {
    green_timeinterval = $('#green_timeinterval').val() / 1000;
    drawScene(gl, programinfo, buffers, textures);
  });
  $('#green_stepsize').on('input', function() {
    green_stepsize = $('#green_stepsize').val() / 100;
    drawScene(gl, programinfo, buffers, textures);
  });

  $('#blue_maxtime').on('input', function() {
    blue_maxtime = $('#blue_maxtime').val();
    drawScene(gl, programinfo, buffers, textures);
  });
  $('#blue_timeinterval').on('input', function() {
    blue_timeinterval = $('#blue_timeinterval').val() / 1000;
    drawScene(gl, programinfo, buffers, textures);
  });
  $('#blue_stepsize').on('input', function() {
    blue_stepsize = $('#blue_stepsize').val() / 100;
    drawScene(gl, programinfo, buffers, textures);
  });
  // $('#mainimage').on('input', function() {
  //   const newsrc = (URL.createObjectURL($('#mainimage').prop('files')[0]));
  //   testimage.src = newsrc;
  //   canvas.width = testimage.width;
  //   canvas.height = testimage.height;
  //   let newtexture = gl.createTexture();
  //   gl.bindTexture(gl.TEXTURE_2D, newtexture);
  //   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, testimage);
  //
  //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  //
  //   textures[0] = newtexture;
  //   drawScene(gl, programinfo, buffers, textures);
  // });
  $('#save').on('click', function() {
    $('#content').append('<img src="' + result + '">');
  });
  // drawScene(gl, programinfo, buffers, textures);
}
function initShaderProgram(gl, vertsource, fragsource) {
  // Load in the vertex and fragment shaders from our global variables
  const vertexshader = loadShader(gl, gl.VERTEX_SHADER, vertsource);
  const fragmentshader = loadShader(gl, gl.FRAGMENT_SHADER, fragsource);
  // Create a program and attach our vertex and fragment shaders to said program
  const shaderprogram = gl.createProgram();
  gl.attachShader(shaderprogram, vertexshader);
  gl.attachShader(shaderprogram, fragmentshader);
  gl.linkProgram(shaderprogram);

  // Handle errors from the program
  if (!gl.getProgramParameter(shaderprogram, gl.LINK_STATUS)) {
    console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderprogram));
    return null;
  }

  return shaderprogram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // Handle errors in compiling shader
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initBuffers(gl) {
  // Position Buffer for vertex shader
  const vertices = new Float32Array([
    -1.0, 1.0,
    1.0, 1.0,
    -1.0, -1.0,

    -1.0, -1.0,
    1.0, 1.0,
    1.0, -1.0
  ]);
  const posbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const texcoords = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,

    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0
  ]);
  const texcoordbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);

  const invertbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, invertbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, invert, gl.STATIC_DRAW);

  const dimbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, dimbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, dimensions, gl.STATIC_DRAW);

  //======= R E D == B U F F E R S ===============================================
  let red_maxtimebuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, red_maxtimebuffer);
  gl.bufferData(gl.ARRAY_BUFFER, red_maxtime, gl.STATIC_DRAW);

  let red_timeintervalbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, red_timeintervalbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, red_timeinterval, gl.STATIC_DRAW);

  let red_stepsizebuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, red_stepsizebuffer);
  gl.bufferData(gl.ARRAY_BUFFER, red_stepsize, gl.STATIC_DRAW);

  //======= G R E E N == B U F F E R S ===========================================
  let green_maxtimebuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, green_maxtimebuffer);
  gl.bufferData(gl.ARRAY_BUFFER, green_maxtime, gl.STATIC_DRAW);

  let green_timeintervalbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, green_timeintervalbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, green_timeinterval, gl.STATIC_DRAW);

  let green_stepsizebuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, green_stepsizebuffer);
  gl.bufferData(gl.ARRAY_BUFFER, green_stepsize, gl.STATIC_DRAW);

  //======= B L U E == B U F F E R S ===========================================
  let blue_maxtimebuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, blue_maxtimebuffer);
  gl.bufferData(gl.ARRAY_BUFFER, blue_maxtime, gl.STATIC_DRAW);

  let blue_timeintervalbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, blue_timeintervalbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, blue_timeinterval, gl.STATIC_DRAW);

  let blue_stepsizebuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, blue_stepsizebuffer);
  gl.bufferData(gl.ARRAY_BUFFER, blue_stepsize, gl.STATIC_DRAW);

  return {
    position: posbuffer,
    texcoord: texcoordbuffer,
    imgdim: dimbuffer,
    invert: invertbuffer,
    red: {
      maxtime: red_maxtimebuffer,
      timeinterval: red_timeintervalbuffer,
      stepsize: red_stepsizebuffer,
    },
    green: {
      maxtime: green_maxtimebuffer,
      timeinterval: green_timeintervalbuffer,
      stepsize: green_stepsizebuffer,
    },
    blue: {
      maxtime: blue_maxtimebuffer,
      timeinterval: blue_timeintervalbuffer,
      stepsize: blue_stepsizebuffer,
    },
  };
}

function loadTexture(gl, url) {
  // Load in a white pixel as a placeholder while the image(s) load
  const pixel = new Uint8Array([255, 255, 255, 255]);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    console.log('image ' + url + ' is loaded, finally');
  }
  image.src = url;

  return texture;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = function() {
      resolve(image);
    }
//     image.onerror = reject();
    image.src = url;
  });
}

function p_loadTexture(gl, img) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  console.log('I am going to use this file: ' + img);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
     // Yes, it's a power of 2. Generate mips.
     gl.generateMipmap(gl.TEXTURE_2D);
  } else {
   // No, it's not a power of 2. Turn of mips and set
   // wrapping to clamp to edge
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  return texture;
}

// Putting in this code to try and understand why the example works but mine does not.
function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function drawScene(gl, programinfo, buffers, textures) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0); // Is this line necessary if I'm doing 2D? No depth testing required afaik
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell the program where/how to get the position data for the vertex shader
  { // Position
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programinfo.attriblocations.position_loc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programinfo.attriblocations.position_loc);
  }
  { // Texture Coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texcoord);
    gl.vertexAttribPointer(programinfo.attriblocations.texcoord_loc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programinfo.attriblocations.texcoord_loc);
  }

  gl.useProgram(programinfo.program);

  { // Main Image
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.uniform1i(programinfo.uniformlocations.image_loc, 0);
  }
  { // Height Map
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.uniform1i(programinfo.uniformlocations.height_loc, 1);
  }
  { // Image Dimensions
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.imgdim);
    gl.uniform2fv(programinfo.uniformlocations.dim_loc, dimensions);
  }
  { // Height Map Inversion
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.invert);
    gl.uniform1f(programinfo.uniformlocations.invert_loc, invert);
  }

  // Might make a seperate function to hold all of the individual uniform bindings for each channel
  // RED CHANNEL
  { // Max time
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.red.maxtime);
    gl.uniform1f(programinfo.uniformlocations.red.maxtimeloc, red_maxtime);
  }
  { // Time interval
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.red.timeinterval);
    gl.uniform1f(programinfo.uniformlocations.red.timeintervalloc, red_timeinterval);
  }
  { // Step size
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.red.stepsize);
    gl.uniform1f(programinfo.uniformlocations.red.stepsizeloc, red_stepsize);
  }

    // GREEN CHANNEL
  { // Max time
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.green.maxtimebuffer);
    gl.uniform1f(programinfo.uniformlocations.green.maxtimeloc, green_maxtime);
  }
  { // Time interval
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.green.maxtimebuffer);
    gl.uniform1f(programinfo.uniformlocations.green.timeintervalloc, green_timeinterval);
  }
  { // Step size
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.green.stepsize);
    gl.uniform1f(programinfo.uniformlocations.green.stepsizeloc, green_stepsize);
  }

    // BLUE CHANNEL
  { // Max time
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.blue.maxtime);
    gl.uniform1f(programinfo.uniformlocations.blue.maxtimeloc, blue_maxtime);
  }
  { // Time interval
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.blue.timeinterval);
    gl.uniform1f(programinfo.uniformlocations.blue.timeintervalloc, blue_timeinterval);
  }
  { // Step size
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.blue.stepsize);
    gl.uniform1f(programinfo.uniformlocations.blue.stepsizeloc, blue_stepsize);
  }

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  result = gl.canvas.toDataURL();
}
