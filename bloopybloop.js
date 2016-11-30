
var w = 0;
var h = 0;

var timer;
var updateStarted = false;
var touches = [];

var canvas = document.getElementById('c');

function update() {

    if (updateStarted) return;
    updateStarted = true;

    var nw = window.innerWidth;
    var nh = window.innerHeight;

    if ((w != nw) || (h != nh)) {
        w = nw;
        h = nh;
        canvas.style.width = w+'px';
        canvas.style.height = h+'px';
        canvas.width = w;
        canvas.height = h;
    }

    var i, len = touches.length;

    for (var k in fingers) {

        if (fingers[k]) {

            var touch = fingers[k];
            var px = touch.x;
            var py = touch.y;

            var new_detune = 200 * ( py / w ) - 100;
            oscillators[k].changeFrequency( px / 2 + 200 );
            oscillators[k].changeDetune( new_detune );
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
    finger.on('start', function (point) {

        fingers[point.id] = point;
        oscillators[point.id] = new OscillatorSample();
        oscillators[point.id].play();

        console.log(point.id);

        // 'point' is a coordinate of the following form:
        // { id: <string>, x: <number>, y: <number>, time: <date> }
    });

    // This callback is fired when finger moves.
    finger.on('move', function (point) {
        fingers[point.id] = point;
    });

    // This callback is fired when finger is released from the screen.
    finger.on('end', function (point) {
        fingers[point.id] = null;
        oscillators[point.id].stop();

    });

    // finger.lastPoint refers to the last touched point by the
    // finger at any given time.
});