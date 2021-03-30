function newmain() {
// REFACTORED SHADER CODE BASED ON WEBGL MDN EXAMPLES
// https://github.com/mdn/webgl-examples
  
  const canvas = document.querySelector('#glcanvas');
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
  }
  const buffers = initBuffers(gl, vertices);
  const textures = [
    loadTexture(gl, './soldiers.jpg'),
    loadTexture(gl, './h3.jpg)
  ];

  drawScene(gl, programinfo, buffers, textures);
};

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
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  };
  
  return shaderprogram;
};

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
};

function initBuffers(gl, vertices) {
  // Position Buffer for vertex shader
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
    red: {
      maxtime: red_maxtimebuffer,
      timeinterval: red_timeintervalbuffer,
      stepsize: red_stepsizebuffer;
    },
    green: {
      maxtime: green_maxtimebuffer,
      timeinterval: green_timeintervalbuffer,
      stepsize: green_stepsizebuffer;
    },
    blue: {
      maxtime: blue_maxtimebuffer,
      timeinterval: blue_timeintervalbuffer,
      stepsize: blue_stepsizebuffer;
    },
  };
}

function loadTexture(gl, url) {
  // Load in a white pixel as a placeholder while the image(s) load
  const pixel = new Uint8Array([255, 255, 255, 255]);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.textImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  
  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.textImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }
  image.src = url;
  
  return texture;
}

function drawScene(gl, programinfo, buffers, textures) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0); // Is this line necessary if I'm doing 2D? No depth testing required afaik
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // Tell the program where/how to get the position data for the vertex shader
  { // Position
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programinfo.attriblocations.positionloc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programinfo.attriblocations.position_loc);
  }
  { // Texture Coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texcoord);
    gl.vertexAttribPointer(programinfo.attriblocations.texcoordattrib, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programinfo.attriblocations.texcoord_loc);
  }
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
  
  gl.useProgram(programinfo.program);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
