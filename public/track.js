const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
let updateNote = document.getElementById("updatenote");
const canvas2 = document.getElementById("canvas2");
const ctx = canvas2.getContext("2d");


let isVideo = false;
let model = null;

const modelParams = {
    flipHorizontal: true,   // flip e.g for video
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
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


var flag = false;

function runDetection() {
    model.detect(video).then(predictions => {
        console.log("Predictions: ", predictions);

        model.renderPredictions(predictions, canvas, context, video);

        if (isVideo) {

            if (!flag) {
                if (predictions[0]) {
                    ctx.beginPath();
                    ctx.moveTo(Math.floor(predictions[0].bbox[0]) - canvas.offsetLeft, Math.floor(predictions[0].bbox[1]) - canvas.offsetTop);
                    flag = true;
                }
            }
            if (flag) {

                if (!predictions[0]) {

                    flag = false;
                    ctx.closePath();
                }

                else {
                    ctx.lineTo(Math.floor(predictions[0].bbox[0]) - Math.floor(canvas.offsetLeft), predictions[0].bbox[1] - canvas.offsetTop);
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
