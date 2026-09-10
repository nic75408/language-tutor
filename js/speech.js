/* speech.js —— 语音输入（识别）+ 语音输出（朗读），封装 Web Speech API
 * 全部做特性检测，不支持时静默降级（按钮仍可见，点击提示不支持）。
 */
(function () {
  var SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  var synth = window.speechSynthesis;

  function isRecognitionSupported() {
    return !!SpeechRecognitionCtor;
  }

  function isSynthesisSupported() {
    return !!synth;
  }

  /**
   * 开始一次语音识别（按住说话场景）。
   * opts: { onResult(text), onEnd(), onError(err) }
   * 返回一个 { stop() } 控制器。
   */
  function startRecognition(opts) {
    opts = opts || {};
    if (!isRecognitionSupported()) {
      if (opts.onError) opts.onError(new Error('unsupported'));
      return { stop: function () {} };
    }
    var recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    var finalText = '';
    var ended = false;

    recognition.onresult = function (event) {
      var text = '';
      for (var i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      finalText = text;
    };

    recognition.onerror = function (event) {
      if (opts.onError) opts.onError(event.error || new Error('recognition-error'));
    };

    recognition.onend = function () {
      if (ended) return;
      ended = true;
      if (opts.onResult) opts.onResult(finalText.trim());
      if (opts.onEnd) opts.onEnd();
    };

    try {
      recognition.start();
    } catch (e) {
      if (opts.onError) opts.onError(e);
    }

    return {
      stop: function () {
        try { recognition.stop(); } catch (e) { /* noop */ }
      }
    };
  }

  var autoReadEnabled = (function () {
    try {
      return window.localStorage.getItem('lt.autoRead') !== 'off';
    } catch (e) {
      return true;
    }
  })();

  function setAutoRead(enabled) {
    autoReadEnabled = enabled;
    try {
      window.localStorage.setItem('lt.autoRead', enabled ? 'on' : 'off');
    } catch (e) { /* noop */ }
  }

  function getAutoRead() {
    return autoReadEnabled;
  }

  function speak(text, opts) {
    opts = opts || {};
    if (!isSynthesisSupported() || !text) {
      return null;
    }
    try {
      synth.cancel();
      var utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 0.95;
      if (opts.onStart) utter.onstart = opts.onStart;
      if (opts.onEnd) utter.onend = opts.onEnd;
      utter.onerror = function () {
        if (opts.onEnd) opts.onEnd();
      };
      synth.speak(utter);
      return utter;
    } catch (e) {
      console.warn('朗读失败:', e);
      if (opts.onEnd) opts.onEnd();
      return null;
    }
  }

  window.Speech = {
    isRecognitionSupported: isRecognitionSupported,
    isSynthesisSupported: isSynthesisSupported,
    startRecognition: startRecognition,
    speak: speak,
    setAutoRead: setAutoRead,
    getAutoRead: getAutoRead
  };
})();
