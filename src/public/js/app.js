const socket = io();

// 나의 얼굴을 보여주는 것
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream; // stream = 비디오 + 오디오
let muted = false; // 음소거 여부
let cameraOff = false; // 카메라 여부
let roomName;
let myPeerConnection;

// 다른 유저의 카메라 가져오기
async function getCameras() {
    try { // 비디오가 가능한 카메라 디바이스만 가져오기
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
       //어떤 카메라를 선택했는 지 알 수 있게함    
      const currentCamera = myStream.getVideoTracks()[0];
       // 옵션 선택 -> 카메라 가종 선택
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
    //셀프카메라
    const initialConstrains = {
        audio : true,
        video : { facingMode: "user" },
    };
    //카메라 제약
    const cameraConstraints = {
        audio: true,
    video: { deviceId: { exact: deviceId } },
  };
    
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstrains 
        );
        myFace.srcObject = myStream; // 이게 비디오를 보여주는 부분
        
        if(!deviceId){
        await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
}
getMedia();

function handleMuteClick() {
    // track에 새로운 enabled을 설정해주기 (트랙은 오디오나 비디오에서 사용되는 설정)
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
    // 기능 부분 위의 무트랑 똑같음
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if (!cameraOff) {
        cameraBtn.innerText = "카메라 끄기";
        cameraOff = true;
    } else {
        cameraBtn.innerText = "카메라 켜기";
        cameraOff = false;
    }
}

//카메라를 변경하게 해줌
async function handleCameraChange() {
    await getMedia(camerasSelect.value);
    if (myPeerConnection) { //다른 브라우저에서 카메라를 변경했는데 변경되지 않던 오류 해결
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection
          .getSenders()
          .find((sender) => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
      }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// 여기부턴 방 입장

const welcome = document.getElementById ("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    //양쪽 브라우저를 연결해주기
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

welcomeForm.addEventListener("submit" , handleWelcomeSubmit);


//peer A (offer을 만듦) -> setLocalDescription
socket.on("welcome", async () => {
    //누군가 참여하면 알려주는 코드
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("offer를 보낸다.");
    socket.emit("offer", offer, roomName);
    });

//peer B (answer 생성)
socket.on("offer", async (offer) => {
    console.log("offer 왔다.");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer" , answer , roomName);
    console.log("answer 보낸다.");
});

//setRemoteDescription
socket.on("answer", (answer) => {
    console.log("answer 왔다.");
    myPeerConnection.setRemoteDescription(answer);
});

 //인터넷 연결 상태 (브라우저가 서로 소통할 수 있게 하는 것)
 socket.on("ice" , (ice) => {
    console.log("candidate 왔다.");
    myPeerConnection.addIceCandidate(ice);
 });

//RTC code
function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [ //공공ip를 찾기 위한 stun서버 (구글 무료 제공용)
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
    myStream
      .getTracks()
      .forEach((track) => myPeerConnection.addTrack(track, myStream));
  }

  //data 교환
  function handleIce(data) {
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);
  }
  
  function handleAddStream(data) {
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
  }