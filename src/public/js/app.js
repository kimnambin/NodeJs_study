const socket = io();

// 나의 얼굴을 보여주는 것
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

//채팅 기능 추가
const chatForm = document.getElementById("chatForm"); 
const chatInput = document.getElementById("chatInput"); 
const chatMessages = document.getElementById("chatMessages"); 

const call = document.getElementById("call");

call.hidden = true;

let myStream; // stream = 비디오 + 오디오
let muted = false; // 음소거 여부
let cameraOff = false; // 카메라 여부
let roomName;
let myPeerConnection;
let myDataChannel;

// 다른 유저의 카메라 가져오기
async function getCameras() {
    try { 
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        
        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label === camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        });
    } catch (e) {
        console.log(e);
    }
}

async function getMedia(deviceId) {
    const initialConstrains = {
        audio : true,
        video : { facingMode: "user" },
    };
    const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } },
    };
    
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstrains 
        );
        myFace.srcObject = myStream;
        
        if(!deviceId){
            await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
}
getMedia();

function handleMuteClick() {
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    if (!muted) {
        muteBtn.innerText = "unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

function handleCameraClick() {
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if (!cameraOff) {
        cameraBtn.innerText = "카메라 끄기";
        cameraOff = true;
    } else {
        cameraBtn.innerText = "카메라 켜기";
        cameraOff = false;
    }
}

async function handleCameraChange() {
    await getMedia(camerasSelect.value);
    if (myPeerConnection) { 
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection
          .getSenders()
          .find((sender) => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
}

//채팅
function handleChatSubmit(event) {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (message !== '') {
        sendMessage(message); // 메시지 전송
        displayMessage('나: ' + message); // 내가 보낸 메시지 화면에 표시
        chatInput.value = ''; // 입력 필드 비우기
    }
}

function sendMessage(message) {
    if (myDataChannel && myDataChannel.readyState === "open") {
        myDataChannel.send(message);
    }
}

function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);
chatForm.addEventListener("submit", handleChatSubmit); // 채팅

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

socket.on("welcome", async () => {
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", (event) => {
        displayMessage('상대: ' + event.data); // 상대방이 보낸 메시지 화면에 표시
    });
    console.log("데이터 채널이 만들어졌다.")
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("offer를 보낸다.");
    socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
    console.log("offer 왔다.");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("answer 보낸다.");
});

socket.on("answer", (answer) => {
    console.log("answer 왔다.");
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
    console.log("candidate 왔다.");
    myPeerConnection.addIceCandidate(ice);
});

function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ],
            },
        ],
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myPeerConnection.addEventListener("datachannel", (event) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", (event) => {
            displayMessage('상대: ' + event.data); // 상대방이 보낸 메시지 화면에 표시
        });
    });
    myStream
      .getTracks()
      .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}
