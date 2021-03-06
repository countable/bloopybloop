
var WIDTH = 0;
var HEIGHT = 0;

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
        initial: 0.4,
        min: 0,
        max: 3
    },
    DECAY: {
        initial: 0.6,
        min: 0.01,
        max: 3
    },
    H1: {
        initial: 0.5,
        min: 0,
        max: 1
    },
    H2: {
        initial: 0.5,
        min: 0,
        max: 1
    },
    H3: {
        initial: 0.5,
        min: 0,
        max: 1
    }
};

var cycle_control = function(control) {
    CONTROLS[control].selected = (CONTROLS[control].selected + 1) % CONTROLS[control].options.length;
    update_control_text(control);
};
var update_control_text = function(control){
    document.getElementById(control).innerHTML = control + ':' + CONTROLS[control].options[CONTROLS[control].selected]
};

var set_control_percent = function(axis, pct) {
    CONTROLS[axis].value = (CONTROLS[axis].max - CONTROLS[axis].min) * pct * pct + CONTROLS[axis].min;
    document.getElementById(axis).style.width = 20 * pct + '%'
};

for (var k in CONTROLS) {
    set_control_percent(k, CONTROLS[k].initial);
}

function update() {

    if (updateStarted) return;
    updateStarted = true;
    
    //update_canvas_size();

    for (var k in fingers) {

        if (fingers[k]) {
            process_touch(fingers[k]);
        
        }
    }

    updateStarted = false;

    return;
}

function ol(){
    update_canvas_size();
}

function process_touch(touch){


    var px = touch.x;
    var py = touch.y;
    if (px < 0) px=0;
    if (py < 0) py=0;
    if (px > WIDTH) px=WIDTH;
    if (py > WIDTH) py=HEIGHT;
    var dx = px/WIDTH;
    var dy = py/HEIGHT;

    // controls

    if (dx > 0.8 && dy < 0.5) {

        var axis;
        if (dy < 0.1) {
            axis = 'H1';
        } else if (dy < 0.2) {
            axis = 'H2';
        } else if (dy < 0.3) {
            axis = 'H3';
        } else if (dy < 0.4) {
            axis = 'RETREAT';
        } else if (dy < 0.5) {
            axis = 'DECAY';
        }
        var pct = (dx - 0.8) / 0.2;
        set_control_percent(axis, pct);

    }

    var gain;

    var n_octaves = 1; // per widht of the screen.
    var base_freq;
    if (dy > 0.666) {
        base_freq = 440 * Math.pow(1.059463, 16 * -n_octaves);
        gain = (dy - .66) * 3;
    } else if (dy > 0.333) {
        gain = (dy - .33) * 3;
        base_freq = 440
    } else {
        base_freq = 440 * Math.pow(1.059463, 16 * n_octaves)
        gain = (dy - .00) * 3;
    }

    gain = gain * gain;

    var note_input = px / WIDTH;

    //discretize notes?
    //note_input = Math.floor(n_octaves * 16 * note_input) / (n_octaves * 16);

    note_input -= 0.5; // detune in both directions from mid-screen.

    // A4 (440hz) is centered, and the screen spans n_octaves (16 half-notes)
    oscillators[touch.id].changeFrequency( base_freq * Math.pow(1.059463, 16 * n_octaves * note_input));

    unif_freq = px / WIDTH;

    oscillators[touch.id].changeGain( gain );

    unif_gain = gain;
};

var fingers = {};
var oscillators = {};

var first_touch = false;

function start_touch(point){
    point.start = (new Date()).valueOf();

    if (!first_touch) {
        //canvas.webkitRequestFullScreen();
        document.getElementById('help').style.display = 'none';
    }
    first_touch = true;

    // save point in fingers hash
    fingers[point.id] = point;

    oscillators[point.id] = new Oscillator();
    process_touch(point);
    oscillators[point.id].play();
};

function move_touch(point){
    process_touch(point);
    oscillators[point.id].refresh();
    // save point in fingers hash
    point.start = fingers[point.id].start;
    fingers[point.id] = point;
}

var end_touch = function (point) {
    //setTimeout(function(){
    console.log('note lasted', (new Date()).valueOf() - fingers[point.id].start)
    fingers[point.id] = null;
    oscillators[point.id].stop();
    //}, 15)
}


if ('ontouchstart' in document.documentElement) {

    // Touchy.js creates a single global object called 'Touchy'
    var toucher = Touchy(document.body, function (hand, finger) {
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
        finger.on('start', start_touch);

        // This callback is fired when finger moves.
        finger.on('move', move_touch);

        // This callback is fired when finger is released from the screen.
        finger.on('end', end_touch);

        // finger.lastPoint refers to the last touched point by the
        // finger at any given time.
    });
} else {

    var _mouse_held = false;
    window.addEventListener('mousedown', function(e){
        var touch = {
            x: e.pageX,
            y: e.pageY,
            id: 1
        };
        start_touch(touch);
        _mouse_held = true;
    });
    window.addEventListener('mousemove', function(e){
        if (_mouse_held) {
            
            var touch = {
                x: e.pageX,
                y: e.pageY,
                id: 1
            };
            move_touch(touch);
        }
    });
    window.addEventListener('mouseup', function(e){
        var touch = {
            x: e.pageX,
            y: e.pageY,
            id: 1
        };
        end_touch(touch);
        _mouse_held = false;
    });
}