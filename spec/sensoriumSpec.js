describe("Sensorium", function () {
  var Sensorium = require('sensorium');

  describe("Constructor", function () {
    it("doesn't throw an error when no options are supplied", function () {
      expect(function () { new Sensorium(); }).not.toThrow();
    });

    it("doesn't stick anything into the DOM", function () {
      new Sensorium();
      expect(document.querySelector('.sensorium')).toBeNull();
    });
  });

  describe("Start", function () {
    beforeEach(function () {
      navigator.getUserMedia || (navigator.getUserMedia = function () {});
    });

    it("asks getUserMedia for video", function () {
      spyOn(navigator, 'getUserMedia');
      new Sensorium().start();

      expect(navigator.getUserMedia).toHaveBeenCalled();
      expect(navigator.getUserMedia.mostRecentCall.args[0]).toEqual({ video: true });
    });

    it("fires an error event if getUserMedia fails", function () {
      var subscriber = jasmine.createSpy('subscriber');
      var sens = new Sensorium();
      var err = { NO: true };

      sens.on('getUserMedia:error', subscriber);
      spyOn(navigator, 'getUserMedia').andCallFake(function () {
        sens._userMediaError(err);
      });
      sens.start();
      expect(subscriber).toHaveBeenCalledWith(err);
      expect(document.querySelector('.sensorium')).toBeNull();
    });

    it("fires a success event and sets up the video if getUserMedia succeeds", function () {
      var subscriber = jasmine.createSpy('subscriber');
      var stream = jasmine.createSpyObj('stream', ['stop']);
      var sens = new Sensorium();

      sens.on('getUserMedia:success', subscriber);
      spyOn(navigator, 'getUserMedia').andCallFake(function () {
        sens._userMediaSuccess(stream);
      });
      sens.start();

      expect(subscriber).toHaveBeenCalled();
      expect(subscriber.mostRecentCall.args[0]).toEqual(stream);
      expect(subscriber.mostRecentCall.args[1].getVideoElement).toBeTruthy();

      expect(document.querySelector('.sensorium')).not.toBeNull();
      expect(document.querySelector('video')).not.toBeNull();

      expect(document.querySelector('.sensorium .header a').innerHTML).toEqual(Sensorium.Labels.CANCEL);
      expect(document.querySelector('.sensorium .footer button').innerHTML).toEqual(Sensorium.Labels.TAKE_PICTURE);

      sens.stop();
    });
  });

  describe("Capture", function () {
    it("throws an exception if called before start", function () {
      expect(function () { new Sensorium().capture(); }).toThrow();
    });

    it("fires a capture event with the captured data", function () {
      var sens = new Sensorium();
      var subscriber = jasmine.createSpy('subscriber');

      sens.on('capture', subscriber);
      spyOn(sens, '_getRenderedCanvasData').andReturn('dataURI');

      sens.capture();

      expect(subscriber).toHaveBeenCalledWith('dataURI');
    });

    it("updates the `src` of an optionally specified image", function () {
      var img = document.createElement('img');
      var sens = new Sensorium(null, {img: img });

      spyOn(sens, '_getRenderedCanvasData').andReturn('http://placekitten.com/200/300');

      sens.capture();

      expect(img.src).toEqual('http://placekitten.com/200/300');
    });
  });

  describe("Stop", function () {
    it("throws an exception if called before start", function () {
      expect(function () { new Sensorium().stop(); }).toThrow();
    });

    it("cleans everything up", function () {
      var stream = jasmine.createSpyObj('stream', ['stop']);

      var container = document.createElement('div');
      container.id = 'bananas';
      document.body.appendChild(container);

      var sens = new Sensorium(container);
      sens._userMediaSuccess(stream);

      expect(document.querySelector('#bananas .sensorium')).not.toBeNull();

      sens.stop();

      expect(document.querySelector('#bananas').innerHTML).toEqual('');

      container.parentNode.removeChild(container);
    });
  });
});
