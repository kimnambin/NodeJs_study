const socket = io();

//나의 얼굴을 보여주는 것
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream;//stream = 비디오 + 오디오
let muted = false;//음소거 여부
let cameraOff = false;//카메라 여부

//비디오를 위한 미디어 가져오기
async function getMedia(){
    try{
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true ,
            video: true,
        });
        myFace.srcObjedct = myStream; //이게 비디오를 보여주는 부분
    } catch (e) {
        console.log(e);
    }
}
getMedia();

function handleMuteClick(){
    if(!muted) {
        muteBtn.innerText = "unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";

        muted = false;
    }
}

function handleCameraClick(){
    if (cameraOff) {
        cameraBtn.innerText = "카메라 끄기";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "카메라 켜기";
        cameraOff = true;
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);