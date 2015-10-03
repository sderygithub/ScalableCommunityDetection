

// some globals
var context = new webkitAudioContext();
var audioBuffer;
var sourceNode;
var mediaStreamSource;



var osc = context.createOscillator();

var filter = context.createBiquadFilter();
filter.type = 3;
filter.frequency.value = 440;
filter.Q.value = 0;
filter.gain.value = 0;


// state variables
var analyserRunning = false;
var spectrumRunning = false;
var waveRunning = false;
var musicRunning = false;
var micRunning = false;
var sqRunning = false;

// setup a javascript node
var javascriptNode = context.createJavaScriptNode(2048, 1, 1);

// connect to destination, else it isn't called
javascriptNode.connect(context.destination);
// when the javascript node is called
// we use information from the analyzer node
// to draw the volume
javascriptNode.onaudioprocess = function () {

    // get the average for the first channel
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);

    // draw the spectrogram
    if ((musicRunning || micRunning || sqRunning)
            && analyserRunning) {
        drawSpectrogram(array);
    }

    if ((musicRunning || micRunning || sqRunning)
            && spectrumRunning) {
        drawSpectrum(array);
    }

    if ((musicRunning || micRunning || sqRunning)
            && waveRunning) {
        var array2 = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(array2)


        drawWave(array2);
    }



}

// setup a analyzer
var analyser = context.createAnalyser();
analyser.smoothingTimeConstant = 0;
analyser.fftSize = 512;

// create a buffer source node
filter.connect(analyser);
analyser.connect(javascriptNode);

// get the context from the canvas to draw on
var ctx = $("#spectrogram").get()[0].getContext("2d");

// create a temp canvas we use for copying
var tempCanvas = document.createElement("canvas");
tempCanvas.width = 460;
tempCanvas.height = 300;
var tempCtx = tempCanvas.getContext("2d");

// used for color distribution
var hot = new chroma.ColorScale({
    colors:['#000000', '#ff0000', '#ffff00', '#ffffff'],
    positions:[0, .25, .75, 1],
    mode:'rgb',
    limits:[0, 350]
});

$(document).ready(function () {
    setupHandlers();
    loadSound("wagner-short.ogg");
});

function setupSourceAudio() {
    // create a buffer source node
    sourceNode = context.createBufferSource();

    sourceNode.connect(filter);
    //filter.connect(context.destination);

    // and connect to destination
    //sourceNode.connect(context.destination);
}

function setupHandlers() {
    $("#music-start").click(function () {
        setupSourceAudio();
        sourceNode.buffer = audioBuffer;
        sourceNode.start(0);
        sourceNode.loop = true;
        musicRunning=true;

        $("#music-start").addClass("disabled");
        $("#music-stop").removeClass("disabled");

    });

    $("#music-stop").click(function () {
        sourceNode.stop(0);

        musicRunning = false;
        $("#music-stop").addClass("disabled");
        $("#music-start").removeClass("disabled");
    });

    $("#sq-start").click(function () {
        osc.frequency.value=600;
        osc.type=2;
        osc.connect(filter);
        osc.start(0);


        sqRunning=true;

        $("#sq-stop").removeClass("disabled");
        $("#sq-start").addClass("disabled");
    });

    $("#sq-stop").click(function () {
        osc.stop(0);
        osc.disconnect(filter);

        sqRunning=false;

        $("#sq-stop").addClass("disabled");
        $("#sq-start").removeClass("disabled");
    });


    $("#mic-start").click(function () {
        navigator.webkitGetUserMedia({audio:true},function(stream) {
            mediaStreamSource = context.createMediaStreamSource(stream);
            mediaStreamSource.connect(filter);

            micRunning = true;
            $("#mic-start").addClass("disabled");
            $("#mic-stop").removeClass("disabled");
        });



    });

    $("#mic-stop").click(function () {
        mediaStreamSource.disconnect(filter);
        micRunning = false;


        $("#mic-stop").addClass("disabled");
        $("#mic-start").removeClass("disabled");
    });




    $("#spectro-start").click(function () {

        analyserRunning = true;

        $("#spectro-start").addClass("disabled");
        $("#spectro-stop").removeClass("disabled");
    });

    $("#spectro-stop").click(function () {
        analyserRunning = false;

        $("#spectro-start").removeClass("disabled");
        $("#spectro-stop").addClass("disabled");
    });

    $("#freq-start").click(function() {

        spectrumRunning = true;
        $("#freq-start").addClass("disabled");
        $("#freq-stop").removeClass("disabled");

    });

    $("#freq-stop").click(function() {

        spectrumRunning = false;
        $("#freq-start").removeClass("disabled");
        $("#freq-stop").addClass("disabled");
    });


    $("#wave-start").click(function() {

        waveRunning = true;
        $("#wave-start").addClass("disabled");
        $("#wave-stop").removeClass("disabled");

    });

    $("#wave-stop").click(function() {

        waveRunning = false;
        $("#wave-start").removeClass("disabled");
        $("#wave-stop").addClass("disabled");
    });

    $("#spk-start").click(function() {

        filter.connect(context.destination);
        $("#spk-start").addClass("disabled");
        $("#spk-stop").removeClass("disabled");

    });

    $("#spk-stop").click(function() {

        filter.disconnect(context.destination);
        filter.connect(analyser);
        $("#spk-start").removeClass("disabled");
        $("#spk-stop").addClass("disabled");
    });



    $("#gainslider").slider({
        min:-50,
        max:50,
        value:0,
        slide:refreshGain
    });

    $("#qslider").slider({
        min:0,
        max:100,
        value:0,
        slide:refreshQFactor
    });

    $("#frequencyslider").slider({
        min:20,
        max:20000,
        value:440,
        slide:refreshFrequency
    });

    $("#filterType").change(refreshFilterType);
    $("#filterType").val(3);
    refreshFilterType();
    refreshFrequency();
    refreshGain();
    refreshQFactor();
}


function refreshFilterType() {
    var currentFilterType = $("#filterType").val();
    var asText = $("#filterType option:selected").text();
    var value = "";

    switch (parseInt(currentFilterType)) {
        case 0:
            value = ("A lowpass filter allows frequencies below the cutoff frequency to pass through and attenuates frequencies above the cutoff. LOWPASS implements a standard second-order resonant lowpass filter with 12dB/octave rolloff.<br/><br/>" +
                    "<strong>Frequency</strong>: The cutoff frequency above which the frequencies are attenuated<br/>" +
                    "<strong>Q</strong>: Controls how peaked the response will be at the cutoff frequency. A large value makes the response more peaked.<br/>" +
                    "<strong>Gain</strong>: Not used in this filter type");
            break;
        case 1:
            value = ("A highpass filter is the opposite of a lowpass filter. Frequencies above the cutoff frequency are passed through, but frequencies below the cutoff are attenuated. HIGHPASS implements a standard second-order resonant highpass filter with 12dB/octave rolloff. <br/><br/>" +
                    "<strong>Frequency</strong>: The cutoff frequency above which the frequencies are attenuated<br/>" +
                    "<strong>Q</strong>: Controls how peaked the response will be at the cutoff frequency. A large value makes the response more peaked.<br/>" +
                    "<strong>Gain</strong>: Not used in this filter type");
            break;
        case 2:
            value = ("A bandpass filter allows a range of frequencies to pass through and attenuates the frequencies below and above this frequency range. BANDPASS implements a second-order bandpass filter.<br/><br/>" +
                    "<strong>Frequency</strong>: The center of the frequency band<br/>" +
                    "<strong>Q</strong>: Controls the width of the band. The width becomes narrower as the Q value increases.<br/>" +
                    "<strong>Gain</strong>: Not used in this filter type");
            break;
        case 3:
            value = ("The lowshelf filter allows all frequencies through, but adds a boost (or attenuation) to the lower frequencies. LOWSHELF implements a second-order lowshelf filter.<br/><br/>" +
                    "<strong>Frequency</strong>: The cutoff frequency above which the frequencies are attenuated<br/>" +
                    "<strong>Q</strong>: Not used in this filter type.<br/>" +
                    "<strong>Gain</strong>: The boost, in dB, to be applied. If the value is negative, the frequencies are attenuated.");
            break;
        case 4:
            value = ("The highshelf filter is the opposite of the lowshelf filter and allows all frequencies through, but adds a boost to the higher frequencies. HIGHSHELF implements a second-order highshelf filter<br/><br/>" +
                    "<strong>Frequency</strong>: The lower limit of the frequences where the boost (or attenuation) is applied.<br/>" +
                    "<strong>Q</strong>: Not used in this filter type.<br/>" +
                    "<strong>Gain</strong>: The boost, in dB, to be applied. If the value is negative, the frequencies are attenuated.");
            break;
        case 5:
            value = ("The peaking filter allows all frequencies through, but adds a boost (or attenuation) to a range of frequencies.<br/><br/>" +
                    "<strong>Frequency</strong>: The center frequency of where the boost is applied.<br/>" +
                    "<strong>Q</strong>: Controls the width of the band of frequencies that are boosted. A large value implies a narrow width.<br/>" +
                    "<strong>Gain</strong>: The boost, in dB, to be applied. If the value is negative, the frequencies are attenuated.");
            break;
        case 6:
            value = ("The notch filter (also known as a band-stop or band-rejection filter) is the opposite of a bandpass filter. It allows all frequencies through, except for a set of frequencies.<br/><br/>" +
                    "<strong>Frequency</strong>: The center frequency of where the notch is applied.<br/>" +
                    "<strong>Q</strong>: Controls the width of the band of frequencies that are attenuated. A large value implies a narrow width.<br/>" +
                    "<strong>Gain</strong>: Not used in this filter type");
            break;
        case 7:
            value = ("An allpass filter allows all frequencies through, but changes the phase relationship between the various frequencies. ALLPASS implements a second-order allpass filter.<br/><br/>" +
                    "<strong>Frequency</strong>: The frequency where the center of the phase transition occurs. Viewed another way, this is the frequency with maximal group delay.<br/>" +
                    "<strong>Q</strong>: Controls how sharp the phase transition is at the center frequency. A larger value implies a sharper transition and a larger group delay.<br/>" +
                    "<strong>Gain</strong>: Not used in this filter type");
            break;
    };

//    $("#filterInfo").tooltip({
//        title: value,
//        html: true,
//        placement: "bottom"
//    });


    $("#filterInfo").popover('destroy');
    $("#filterInfo").popover({
        title: asText + " filter info:",
        content: value,
        html: true,
        placement: "bottom",
        trigger: "hover"
    });

    // and update the filter type
    filter.type = currentFilterType;
}

function refreshFrequency() {

    var frequency = parseInt($('#frequencyslider').slider("value"));

    $("#currentFreq").text("(" + frequency + " Hz)");
    filter.frequency.value = frequency;

}

function refreshGain() {
    var gain = parseInt($('#gainslider').slider("value"));

    $("#currentGain").text("(" + gain + ")");
    filter.gain.value = gain;
}

function refreshQFactor() {
    var q = parseInt($('#qslider').slider("value"));

    $("#currentQfactor").text("(" + q + ")");
    filter.Q.value = q;
}

// load the specified sound
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function () {

        // decode the data
        context.decodeAudioData(request.response, function (buffer) {
            // when the audio is decoded play the sound
            audioBuffer = buffer;
        }, onError);
    }
    request.send();
}

function playSound(buffer) {
    sourceNode.buffer = buffer;
    sourceNode.noteOn(0);
}

// log if an error occurs
function onError(e) {
    console.log(e);
}

function drawSpectrum(array) {
    var ctx = $("#spectrum").get()[0].getContext("2d");
    ctx.fillStyle = "#ffffff"
    ctx.clearRect(0, 0, 300, 256);


    for ( var i = 0; i < (array.length); i++ ){
        var value = array[i];

        ctx.fillRect(i*2,300-value,1,300);
    }
};

function drawWave(array) {

    var ctx = $("#wave").get()[0].getContext("2d");
    ctx.fillStyle = "#ffffff"
    ctx.clearRect(0, 0, 300, 256);

    for ( var i = 0; i < (array.length); i++ ){
        var value = array[i];

        ctx.fillRect(i+22,256-value,1,1);
    }
};

function drawSpectrogram(array) {

    // copy the current canvas onto the temp canvas
    var canvas = document.getElementById("spectrogram");

    tempCtx.drawImage(canvas, 0, 0, 300, 256);

    // iterate over the elements from the array
    for (var i = 0; i < array.length; i++) {
        // draw each pixel with the specific color
        var value = array[i];
        ctx.fillStyle = hot.getColor(value).hex();

        // draw the line at the right side of the canvas
        ctx.fillRect(300 - 1, 256 - i, 1, 1);
    }

    // set translate on the canvas
    ctx.translate(-1, 0);
    // draw the copied image
    ctx.drawImage(spectrogram, 0, 0, 300, 256, 0, 0, 300, 256);

    // reset the transformation matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);

}

