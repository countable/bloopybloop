
/**
 * Forked from:
 * Copyright 2013 Boris Smus. All Rights Reserved.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


function Oscillator() {
  this.isPlaying = false;
  this.canvas = document.querySelector('canvas');
  this.attack = 0.01;
  this.retreat = CONTROLS.RETREAT.value;
  this._frequency = 200;
  this._gain = 1;
  this.oscillator = context.createOscillator();
  

  var real = new Float32Array(6);
  var imag = new Float32Array(6);
  real[0] = 0;
  imag[0] = 0;
  real[1] = 0.66;
  imag[1] = 0;
  real[2] = CONTROLS.H1.value;
  imag[2] = 0;
  real[3] = CONTROLS.H2.value;
  imag[3] = 0;
  real[4] = CONTROLS.H3.value;
  imag[4] = 0;
  real[5] = CONTROLS.H3.value;
  imag[5] = 0;
  var wave = context.createPeriodicWave(real, imag, {disableNormalization: true});
  this.oscillator.setPeriodicWave(wave);


  this.volume = context.createGain();
  this.envelope = context.createGain();
  // arrange nodes.
  this.oscillator.connect(this.volume);
  this.volume.connect(this.envelope);
  this.envelope.connect(context.destination);
  
  this.volume.gain.value = 1;

  this.envelope.gain.value = 0;
}

Oscillator.prototype.play = function() {

  var now = context.currentTime;
  this.envelope.gain.linearRampToValueAtTime(1, now + this.attack);

  this.oscillator[this.oscillator.start ? 'start' : 'noteOn'](0);

};

Oscillator.prototype.stop = function() {
  // fade out (retreat);
  var now = context.currentTime;
  //this.envelope.gain.cancelScheduledValues( now );
  console.log(this.retreat, 'is the retreat')
  this.envelope.gain.linearRampToValueAtTime(0, now+this.retreat);
  var sample=this;
  setTimeout(function(){
    sample.oscillator.stop(0);
  }, this.retreat * 1000)
};

Oscillator.prototype.toggle = function() {
  (this.isPlaying ? this.stop() : this.play());
  this.isPlaying = !this.isPlaying;

};

Oscillator.prototype.changeGain = function(val) {
  this._gain = val;
  var freq_adj = 1 / (this._frequency / 200);
  freq_adj = Math.min(freq_adj, 1);
  this.volume.gain.value = val * freq_adj;
};

Oscillator.prototype.changeFrequency = function(val) {
  this._frequency = val;
  this.oscillator.frequency.value = val;
};

Oscillator.prototype.changeType = function(type) {
  this.oscillator.type = type;
};

