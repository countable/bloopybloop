
var w = 0;
var h = 0;

var timer;
var updateStarted = false;
var touches = [];

var unif_gain = 0;
var unif_freq = 0;

var canvas = document.getElementById('c');

// no scrolling the page please.
window.addEventListener('touchmove', function(e){
    e.preventDefault();
});

var CONTROLS = {
    RETREAT: {
        options: [0.05,0.5,1,2],
        selected: 2
    },
    ATTACK: {
        options: [0.05,0.2,0.5,1],
        selected: 0
    },
    SHAPE: {
        options: ['square','sawtooth','sine','triangle','wave'],
        selected: 0
    }
};

var cycle_control = function(control) {
    CONTROLS[control].selected = (CONTROLS[control].selected + 1) % CONTROLS[control].options.length;
    update_control_text(control);
};
var update_control_text = function(control){
    document.getElementById(control).innerHTML = control + ':' + CONTROLS[control].options[CONTROLS[control].selected]
};
update_control_text('RETREAT');
update_control_text('ATTACK');
update_control_text('SHAPE');

function update() {

    if (updateStarted) return;
    updateStarted = true;

    var nw = window.innerWidth || screen.width;
    var nh = window.innerHeight || screen.height;

    
    if ((w != nw) || (h != nh)) {
        w = nw * .75
        h = nh;
        canvas.style.width = w+'px';
        canvas.style.height = h+'px';
        //canvas.width = w;
        //canvas.height = h;
    }
    
    var i, len = touches.length;

    for (var k in fingers) {

        if (fingers[k]) {

            var touch = fingers[k];
            var px = touch.x;
            var py = touch.y;
            if (px < 0) px=0;
            if (py < 0) py=0;
            if (px > w) px=w;
            if (py > h) py=h;

            var n_octaves = 1;
            
            var gain = py / h;

            var note_input = px / w;

            //discretize notes?
            note_input = Math.floor(n_octaves * 16 * note_input) / (n_octaves * 16);

            note_input -= 0.5; // detune in both directions from mid-screen.

            // A4 (440hz) is centered, and the screen spans n_octaves (16 half-notes)
            oscillators[k].changeFrequency( 440 * Math.pow(1.059463, 16 * n_octaves * note_input));

            unif_freq = px / w;

            oscillators[k].changeGain( gain );

            unif_gain = gain;
        }
    }

    updateStarted = false;

    return;
}

var oscillator_sample = new OscillatorSample();

function ol() {

    timer = setInterval(update, 15);

};

var fingers = {};
var oscillators = {};

var first_touch = false;

// Touchy.js creates a single global object called 'Touchy'
var toucher = Touchy(document.getElementById('c'), function (hand, finger) {
    // this === toucher
    // toucher.stop() : stop  watching element for touch events
    // toucher.start(): start watching element for touch events

    // This function will be called for every finger that touches the screen
    // regardless of what other fingers are currently interacting.

    // 'finger' is an object representing the entire path of a finger
    // on the screen. So a touch-drag-release by a single finger would be
    // encapsulated into this single object.

    // 'hand' is an object holding all fingers currently interacting with the
    // screen.
    // 'hand.fingers' returns an Array of fingers currently on the screen
    // including this one.
    // In this case we are only listening to a single finger at a time.

    // This callback is fired when the finger initially touches the screen.
    finger.on('start', function (point) {
        

        //if (!first_touch) canvas.webkitRequestFullScreen();
        first_touch = true;

        fingers[point.id] = point;
        oscillators[point.id] = new OscillatorSample();
        update();
        oscillators[point.id].play();
        // 'point' is a coordinate of the following form:
        // { id: <string>, x: <number>, y: <number>, time: <date> }
    });

    // This callback is fired when finger moves.
    finger.on('move', function (point) {
        fingers[point.id] = point;
    });

    // This callback is fired when finger is released from the screen.
    finger.on('end', function (point) {
        setTimeout(function(){

            fingers[point.id] = null;
            oscillators[point.id].stop();
        }, 15)
    });

    // finger.lastPoint refers to the last touched point by the
    // finger at any given time.
});