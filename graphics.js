
"use strict";


var canvas = document.getElementById("c");
var gl = canvas.getContext('webgl');

function update_canvas_size(){

    var nw = window.innerWidth || screen.width;
    var nh = window.innerHeight || screen.height;

    
    if ((WIDTH != nw) || (HEIGHT != nh)) {
        WIDTH = nw;
        HEIGHT = nh;
        canvas.style.width = WIDTH+'px';
        canvas.style.height = HEIGHT+'px';
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
    }
}




// Utility to complain loudly if we fail to find the uniform
function getUniformLocation(program, name) {
    var uniformLocation = gl.getUniformLocation(program, name);
    if (uniformLocation === -1) {
        throw 'Can not find uniform ' + name + '.';
    }
    return uniformLocation;
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function main() {
  // Get A WebGL context
  var canvas = document.getElementById("c");
  webglLessonsHelper.setupLesson(canvas);  // this is just to change the style if we're in an iframe
  var gl = canvas.getContext("webgl");
  if (!gl) {
    webglLessonsHelper.showNeedWebGL(canvas);
    return;
  }

  // Get the strings for our GLSL shaders
  var vertexShaderSource = document.getElementById("2d-vertex-shader").text;
  var fragmentShaderSource = document.getElementById("2d-fragment-shader").text;

  // create GLSL shaders, upload the GLSL source, compile the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  var program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // Create a buffer and put three 2d clip space points in it
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var positions = [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // code above this line is initialization code.
  // code below this line is rendering code.

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);


  var render = function(){

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var screenUnif = getUniformLocation(program, "screen");
    var redUnif = getUniformLocation(program, "red");
    var greenUnif = getUniformLocation(program, "green");
    var blueUnif = getUniformLocation(program, "blue");
    var metaballsHandle = getUniformLocation(program, 'metaballs');

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
    
    gl.uniform2f(screenUnif, WIDTH, HEIGHT);
    gl.uniform1f(redUnif, unif_gain);
    gl.uniform1f(greenUnif, unif_freq);
    gl.uniform1f(blueUnif, unif_gain);

    // To send the data to the GPU, we first need to
    // flatten our data into a single array.
    var dataToSendToGPU = new Float32Array(2 * 20);
    var i=0;
    for (var k in fingers) {
      if (fingers[k] && i < 20) {
        var baseIndex = 2 * i;
        dataToSendToGPU[baseIndex + 0] = fingers[k].x;
        dataToSendToGPU[baseIndex + 1] = HEIGHT-fingers[k].y;
        i++;
      }
    }
    for (;i<20;i++) {
      dataToSendToGPU[2*i] = 0;
      dataToSendToGPU[2*i+1] = 0;
    }

    gl.uniform2fv(metaballsHandle, dataToSendToGPU);
    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset)

    // draw
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

}

main();
