/* 퍼블릭 - js - 파일로 만드는 이유
-> 코드의 구조화 때문 -> 
코드의 관리, 유지보수, 및 프로젝트의 확장성을 향상 */

//여기는기능 부분 js

/* 프론트와 벡을 연동하는 부분 (ws) + 
위치를 우리가 어디에 있는지로 수정(window.location.host) */
const socket = new WebSocket(`ws://${window.location.host}`);

//서버에서 보낸 메시지 받기 
//1단계 서버와 연결
socket.addEventListener("open", ()=> {
    console.log("서버와 연결✅");
});

//2단계 메시지 받기
socket.addEventListener("message", (message)=> {
    console.log("새로운 메시지: " , message.data);
});

//번외 close 이벤트
socket.addEventListener("close" , ()=> {
    console.log("서버와 연결❌");
});

//서버와 연결 후 5초 후에 메시지
setTimeout(() => {
    socket.send("안녕 연결됐엉~");
}, 5000);