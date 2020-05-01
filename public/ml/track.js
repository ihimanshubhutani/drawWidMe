const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");
const canvas2 = document.getElementById("canvas2");
const ctx = canvas2.getContext("2d");

alert("This is Experimental Feature by Himanshu, This Model detects your hand and according to that it moves the pen Wait While model is loading then click on Button");

canvas2.width = window.innerWidth;
canvas2.height = window.innerHeight;


ctx.lineWidth = 5;
ctx.strokeStyle = "round";
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, canvas2.width, canvas2.height);


let isVideo = false;
let model = null;

const modelParams = {
    flipHorizontal: true,   // flip e.g for video
    maxNumBoxes: 1,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.7,    // confidence threshold for predictions.
}


function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}


function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    var temp_cnvs = document.createElement('canvas');
    var temp_cntx = temp_cnvs.getContext('2d');

    // set it to url new width & height and draw url current canvas data into it //
    temp_cnvs.width = w;
    temp_cnvs.height = h;
    temp_cntx.fillStyle = 'red';  // url original canvas's background color
    temp_cntx.fillRect(0, 0, w, h);
    temp_cntx.drawImage(canvas, 0, 0);
    // resize & clear url original canvas and copy back in url cached pixel data //
    canvas2.width = w;
    canvas2.height = h;
    ctx.lineWidth = 5;
    ctx.drawImage(temp_cnvs, 0, 0);

}

// add event listeners to specify when functions should be triggered
window.addEventListener("resize", resize);





var flag = false;
var x, y;

function runDetection() {
    model.detect(video).then(predictions => {
        console.log("Predictions: ", predictions);

        model.renderPredictions(predictions, canvas, context, video);

        if (isVideo) {

            if (!flag) {
                if (predictions[0]) {
                    ctx.beginPath();
                    x = predictions[0].bbox[0] + predictions[0].bbox[2] / 2;
                    y = predictions[0].bbox[1] + predictions[0].bbox[3] / 2;
                    ctx.moveTo(x - canvas2.offsetLeft, y - canvas2.offsetTop);
                    flag = true;
                }
            }
            if (flag) {

                if (!predictions[0]) {

                    flag = false;
                    ctx.closePath();
                }

                else {
                    x = predictions[0].bbox[0] + predictions[0].bbox[2] / 2;
                    y = predictions[0].bbox[1] + predictions[0].bbox[3] / 2;
                    ctx.lineTo(x - canvas.offsetLeft, y - canvas.offsetTop);
                    ctx.stroke();
                }
            }


            requestAnimationFrame(runDetection);
        }
    });
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    trackButton.disabled = false
});
