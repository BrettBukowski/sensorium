sensorium
=========

[![Build Status](https://travis-ci.org/BrettBukowski/sensorium.png?branch=master)](https://travis-ci.org/BrettBukowski/sensorium)


Simple browser component that uses [WebRTC][rtc] to display the user's webcam stream and capture a still frame.

![][pic]

## Installation

First, [Component] must be installed as a prereq.

Then,

    $ component install brettbukowski/sensorium

## Usage

Check the example.html file for a demo.

If you don't want to use component, include the [.min.js file][js] on the page:

    <script src="build/sensorium.min.js"></script>

And the [CSS][css]:

    <link rel="stylesheet" type="text/css" href="build/sensorium.css">

## API

### Initialization

Require and create a new instance.

    var Sensorium = require('sensorium'),
        sensorium = new Sensorium('#container', {
            width: 640, height: 480
            img: '#captured-image'
        });

This initializes Sensorium to place the webcam video inside `#container`, set its bounds to 640x480, and, when the user captures an image, update the `src` attribute of `img#captured-image`.

### Start

    sensorium.start();

This initiates the `getUserMedia` process, where the browser prompts the user to allow access to the webcam. Once access is granted, the video element is created and the webcam output is streamed to it.

### Capture

    sensorium.capture();

Captures a frame from the video. `#start` must have already been called. Fires a _capture_ event (see below) with the dataURI of the captured image.


### Stop

    sensorium.stop();

Stops the video stream and cleans up all generated DOM elements, including the video element.

### Events

A number of events are fired. Events can be subscribed to:

    sensorium.on('capture', function (dataURI) {
      var img = document.createElement('img');
      img.src = dataURI;
      document.body.appendChild(img);
    });

The events include:

- **getUserMedia:error**: Triggered when the user denies camera access or some other problem occurs
- **getUserMedia:success**: Triggered when the user allows camera access and a media stream is supplied
- **capture**: Triggered when a frame from the stream is captured, either via user action or programmatic calling of `#capture` 

More details are to be found in the Docker docs.

## License

Copyright (c) 2013 Brett Bukowski

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



[rtc]: http://www.webrtc.org/
[pic]: https://dl.dropbox.com/u/302368/github/sensorium.jpg
[component]: https://github.com/component/component/
[js]: https://github.com/BrettBukowski/sensorium/blob/gh-pages/build/sensorium.min.js
[css]: https://github.com/BrettBukowski/sensorium/blob/gh-pages/build/sensorium.css