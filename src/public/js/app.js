/* 퍼블릭 - js - 파일로 만드는 이유
-> 코드의 구조화 때문 -> 
코드의 관리, 유지보수, 및 프로젝트의 확장성을 향상 */

//여기는기능 부분 js

//html에서 메시지를 다당
const messageList = document.querySelector("ul");
const nickForm = document.querySelector('#nick');
const messageForm = document.querySelector("#message");

/* 프론트와 벡을 연동하는 부분 (ws) + 
위치를 우리가 어디에 있는지로 수정(window.location.host) */
const socket = new WebSocket(`ws://${window.location.host}`);

// string을 옵젝으로 만들기 (json으로 보내고 읽을 수 있도록!!)
function makeMessage(type, payload) {
    const msg = { type, payload };
    return JSON.stringify(msg);
  }

function handleOpen() {
    console.log("Connected to Server ✅");
  }
  
  socket.addEventListener("open", handleOpen);


// 메시지 받기
socket.addEventListener("message", (message)=> {
    //여기에 li (화면에 메시지 출력)
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

// close 이벤트
socket.addEventListener("close" , ()=> {
    console.log("서버와 연결❌");
});

//메시지 이벤트 리스너 처리
function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    const li = document.createElement("li");
    li.innerText = `You: ${input.value}`;
    messageList.append(li);
    input.value = "";
  }
  

function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}

messageForm.addEventListener("submit" , handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);