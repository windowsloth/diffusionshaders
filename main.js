let img;
const dry = [];
let testo;

let vertices = new Float32Array([
  // -0.5, 0.5,
  // 0.5, 0.5,
  // 0.5, -0.5,
  // -0.5, 0.5,
  // -0.5, -0.5,
  // 0.5, -0.5
  -1.0, 1.0,
  1.0, 1.0,
  -1.0, -1.0,

  -1.0, -1.0,
  1.0, 1.0,
  1.0, -1.0
]);

// let mag = 100;
// let scl = 150;
// let oct = 4;
// let theta = 0;
let invert = 0;

let org = new Float32Array([0, 0]);

let red_maxtime = 56.0;
let red_timeinterval = 1.0;
let red_stepsize = 5.0;

let green_maxtime = 56.0;
let green_timeinterval = 1.0;
let green_stepsize = 5.0;

let blue_maxtime = 56.0;
let blue_timeinterval = 1.0;
let blue_stepsize = 5.0;

window.onload = function() {
  $('#content').append('<canvas id="canvas"></canvas>');
  // $('#red').append(`
  //   <input type="range" id="maxtime" name="maxtime" min="0" max="512" value="${maxtime}">
  //   <label for="${maxtime}">max time</label>
  // `);
  // $('#red').append(`
  //   <input type="range" id="timeinterval" name="timeinterval" min="0" max="100" value="${timeinterval * 100}">
  //   <label for="timeinterval">max time</label>
  // `);
  // $('#red').append(`
  //   <input type="range" id="stepsize" name="stepsize" min="0" max="10" value="${stepsize}">
  //   <label for="stepsize">max time</label>
  // `);

  getSliders('red');
  getSliders('green');
  getSliders('blue');
  // getSliders('green', 'g');
  // getSliders('blue', 'b');
  getimage();
}

function getSliders(channel) {
  let channelid = '#' + channel;
  let maxtime = channel + '_maxtime';
  let timeinterval = channel + '_timeinterval';
  let stepsize = channel + '_stepsize';
  $(channelid).append(`
    <h3 class="${channel}">${channel}</h3>
  `);
  $(channelid).append(`
    <input type="range" id="${maxtime}" name="mag" min="0" max="512" value="${maxtime}">
    <label for="${maxtime}">max time/material height</label>
  `);
  $(channelid).append(`
    <input type="range" id="${timeinterval}" name="scale" min="1" max="100" value="${timeinterval * 100}">
    <label for="${timeinterval}">time interval/droplet speed<label>
  `);
  $(channelid).append(`
    <input type="range" id="${stepsize}" name="oct" min="1" max="1000" value="${stepsize * 100}">
    <label for=${stepsize}>step size/max distance</label>
  `);
}

function getimage() {
  let image = new Image();
  let heightmap = new Image();
  image.src = './hornetlone_small.png';
  heightmap.src = './h9.jpg';
  image.onload = function() {
    heightmap.onload = function() {
      main(image, heightmap);
    }
  }
  $('#red_maxtime').on('change', function () {
    red_maxtime = $('#red_maxtime').val();
    main(image, heightmap);
  });
  $('#red_timeinterval').on('change', function () {
    red_timeinterval = $('#red_timeinterval').val() / 1000;
    main(image, heightmap);
  });
  $('#red_stepsize').on('change', function () {
    red_stepsize = $('#red_stepsize').val() / 1000;
    main(image, heightmap);
  });

  $('#green_maxtime').on('change', function () {
    green_maxtime = $('#green_maxtime').val();
    main(image, heightmap);
  });
  $('#green_timeinterval').on('change', function () {
    green_timeinterval = $('#green_timeinterval').val() / 1000;
    main(image, heightmap);
  });
  $('#green_stepsize').on('change', function () {
    green_stepsize = $('#green_stepsize').val() / 1000;
    main(image, heightmap);
  });

  $('#blue_maxtime').on('change', function () {
    blue_maxtime = $('#blue_maxtime').val();
    main(image, heightmap);
  });
  $('#blue_timeinterval').on('change', function () {
    blue_timeinterval = $('#blue_timeinterval').val() / 1000;
    main(image, heightmap);
  });
  $('#blue_stepsize').on('change', function () {
    blue_stepsize = $('#blue_stepsize').val() / 1000;
    main(image, heightmap);
  });
  $('#invert').on('change', function () {
    invert = document.getElementById('invert').checked ? 0 : 1;
    main(image, heightmap);
  });
  $('#save').click(function() {
    $('#content').append('<img src="' + testo + '">');
  });
}

function main(image, map) {
  const canvas = document.getElementById('canvas');
  // canvas.width = window.innerWidth;
  // canvas.height = window.innerHeight;
  canvas.width = image.width;
  canvas.height = image.height;
  // document.body.appendChild(canvas);

  const gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

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

    uniform vec2 org;
    varying vec2 texcoord;

    vec2 imgdim = vec2(${image.width}, ${image.height});
    vec2 onepx = vec2(1.0, 1.0) / imgdim;

    // float rand(vec2 n) {
    //   return fract(sin(dot(n, vec2(12.9898, 78.233))) * 43758.5453);
    // }

    // float multiplier = 1664525.0;
    // float increment = 1013904223.0;
    // float modulus = pow(2.0, 32.0);
    // // float seed = 1234.0;
    // float nextRand(float seed) {
    //   seed = mod(multiplier * seed + increment, modulus);
    //   return seed;
    // }
    //
    // float randFloat(float seed) {
    //   return nextRand(seed) / modulus;
    // }

    // float scalar = ${Math.E};
    float scalar = 1.61803398875;
    float hash(vec2 inp, float seed) {
      return fract(tan(distance(inp * scalar, inp) * seed) * inp.x);
    }

    float variance(float time, float delta, float stepsize) {
      return (time / delta) * stepsize * stepsize;
    }
    // float posneg(vec2 n) {
    //   float decider = rand(n);
    //   if (decider > 0.5) {
    //     return 1.0;
    //   } else {
    //     return -1.0;
    //   }
    // }

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
      // float seed = coord.x * coord.y - rand(coord * 10.0);
      // seed = nextRand(seed);
      // vec3 testo = vec3(randFloat(nextRand(seed)), randFloat(nextRand(nextRand(seed))), randFloat(nextRand(nextRand(nextRand(seed)))));
      // vec3 testo = vec3(hash(coord, 1.0), hash(coord, 2.0), hash(coord, 3.0));
      // gl_FragColor = vec4(testo, 1);

      // float xterm = pow(variance(15.0, 1.0, 5.0), 0.5) * percentile(coord, 5.0);
      // vec2 modvec = vec2(
      //   posneg(coord, 1.0) * hash(coord, 2.0) * xterm,
      //   posneg(coord, 3.0) * hash(coord, 4.0) * xterm
      // ) * onepx;

      // float map_result = inversion(invert, texture2D(u_image1, texcoord));
      float map_result = 0.5 + cos((inversion(invert, texture2D(u_image1, texcoord)) + 1.0) * 3.1415) / 2.0;
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
    }
  `;

let err;
const vertex = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertex, vert);
gl.compileShader(vertex);
err = gl.getShaderInfoLog(vertex);
if (err) {
  console.log(err);
}

const fragment = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragment, frag);
gl.compileShader(fragment);
err = gl.getShaderInfoLog(fragment);
if (err) {
  console.log(err);
}

const program = gl.createProgram();
gl.attachShader(program, vertex);
gl.attachShader(program, fragment);
gl.linkProgram(program);
gl.useProgram(program);

let image_loc = gl.getUniformLocation(program, 'u_image0');
let height_loc = gl.getUniformLocation(program, 'u_image1');

let position = gl.getAttribLocation(program, 'position');
let texcoord_attrib = gl.getAttribLocation(program, 'texcoord_attrib');

let invert_loc = gl.getUniformLocation(program, 'invert');

let red_maxtimeloc = gl.getUniformLocation(program, 'red_maxtime');
let red_timeintervalloc = gl.getUniformLocation(program, 'red_timeinterval');
let red_stepsizeloc = gl.getUniformLocation(program, 'red_stepsize');

let green_maxtimeloc = gl.getUniformLocation(program, 'green_maxtime');
let green_timeintervalloc = gl.getUniformLocation(program, 'green_timeinterval');
let green_stepsizeloc = gl.getUniformLocation(program, 'green_stepsize');

let blue_maxtimeloc = gl.getUniformLocation(program, 'blue_maxtime');
let blue_timeintervalloc = gl.getUniformLocation(program, 'blue_timeinterval');
let blue_stepsizeloc = gl.getUniformLocation(program, 'blue_stepsize');

let posbuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posbuffer, gl.STATIC_DRAW);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.enableVertexAttribArray(position);
gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

let texcoordbuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texcoordbuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  0.0, 0.0,
  1.0, 0.0,
  0.0, 1.0,

  0.0, 1.0,
  1.0, 0.0,
  1.0, 1.0
]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(texcoord_attrib);
gl.vertexAttribPointer(texcoord_attrib, 2, gl.FLOAT, false, 0, 0);

let invert_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, invert_buffer);
gl.bufferData(gl.ARRAY_BUFFER, invert, gl.STATIC_DRAW);
gl.uniform1f(invert_loc, invert);

//======= R E D == B U F F E R S ===============================================

let red_maxtimebuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, red_maxtimebuffer);
gl.bufferData(gl.ARRAY_BUFFER, red_maxtime, gl.STATIC_DRAW);
gl.uniform1f(red_maxtimeloc, red_maxtime);

let red_timeintervalbuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, red_timeintervalbuffer);
gl.bufferData(gl.ARRAY_BUFFER, red_timeinterval, gl.STATIC_DRAW);
gl.uniform1f(red_timeintervalloc, red_timeinterval);

let red_stepsizebuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, red_stepsizebuffer);
gl.bufferData(gl.ARRAY_BUFFER, red_stepsize, gl.STATIC_DRAW);
gl.uniform1f(red_stepsizeloc, red_stepsize);

//======= G R E E N == B U F F E R S ===========================================

let green_maxtimebuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, green_maxtimebuffer);
gl.bufferData(gl.ARRAY_BUFFER, green_maxtime, gl.STATIC_DRAW);
gl.uniform1f(green_maxtimeloc, green_maxtime);

let green_timeintervalbuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, green_timeintervalbuffer);
gl.bufferData(gl.ARRAY_BUFFER, green_timeinterval, gl.STATIC_DRAW);
gl.uniform1f(green_timeintervalloc, green_timeinterval);

let green_stepsizebuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, green_stepsizebuffer);
gl.bufferData(gl.ARRAY_BUFFER, green_stepsize, gl.STATIC_DRAW);
gl.uniform1f(green_stepsizeloc, green_stepsize);

//======= B L U E == B U F F E R S ===========================================

let blue_maxtimebuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, blue_maxtimebuffer);
gl.bufferData(gl.ARRAY_BUFFER, blue_maxtime, gl.STATIC_DRAW);
gl.uniform1f(blue_maxtimeloc, blue_maxtime);

let blue_timeintervalbuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, blue_timeintervalbuffer);
gl.bufferData(gl.ARRAY_BUFFER, blue_timeinterval, gl.STATIC_DRAW);
gl.uniform1f(blue_timeintervalloc, blue_timeinterval);

let blue_stepsizebuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, blue_stepsizebuffer);
gl.bufferData(gl.ARRAY_BUFFER, blue_stepsize, gl.STATIC_DRAW);
gl.uniform1f(blue_stepsizeloc, blue_stepsize);

gl.uniform1i(image_loc, 0);
gl.uniform1i(height_loc, 1);

let image_texture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, image_texture);

gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

let height_map = gl.createTexture();
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, height_map);

gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, map);

gl.drawArrays(gl.TRIANGLES, 0, 6);

testo = canvas.toDataURL();
// console.log(testo);
}

function getHueAngle(color) {
  let r = color[0];
  let g = color[1];
  let b = color[2];
  let result;
  let min;

  if (r > g && r > b) {
    if (g > b) {
      min = b;
    } else {
      min = g;
    }
    result = (g - b) / (r - min);
  } else if (g > r && g > b) {
    if (r > b) {
      min = b;
    } else {
      min = r;
    }
    result = 2 + (b - r) / (g - min);
  } else {
    if (r > g) {
      min = g;
    } else {
      min = r;
    }
    4 + (r - g) / (b - min);
  }
  result = result * 60;
  if (result < 0) {
    result = result * -1;
  }
  // console.log(r, g, b, min, result);
  return result;
}

function getRGB(h, s, l) {
  let temp1, temp2, angle;

  if (l < 0.5) {
    temp1 = l * (1 + s);
  } else {
    temp1 = (l + s) / (l * s);
  }
  temp2 = 2 * l - temp1;
  angle = h / 360;
  // temp_r = angle + (1 / 3);
  // temp_g = angle;
  // temp_b = angle - (1 / 3);
  temp_r = testval(angle + (1 / 3));
  temp_g = testval(angle);
  temp_b = testval(angle - (1 / 3));


  let final_red = finaltest(temp1, temp2, temp_r);
  let final_green = finaltest(temp1, temp2, temp_g);
  let final_blue = finaltest(temp1, temp2, temp_b);

  return [final_red, final_green, final_blue];
}

function testval(val) {
  let num;
  if (val < 0) {
    num = val + 1;
  } else if (val > 1) {
    num = val - 1;
  }
  // testval(num);
  return num;
}

function finaltest(temp_1, temp_2, val) {
  let result;
  if (6 * val < 1) {
    result = temp_2 + (temp_1 - temp_2) * 6 * val;
  } else if (val * 2 < 1) {
    result = temp_1;
  } else if (val * 3 < 2) {
    result = temp_2 + (temp_1 - temp_2) * ((2 / 3) - val) * 6;
  } else {
    result = temp_2;
  }
  return result;
}
