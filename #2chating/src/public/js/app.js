
const socket = io();//io는 자동적으로 소켓 io 벡엔드와 연결해주는 함수임
const welcome = document.getElementById("welcome");//처음 보여지는 부분
const form = welcome.querySelector("form");
const room = document.getElementById("room"); //방에 입장하고 나서 보여지는 부분

const nicknameSet = document.querySelector("#nickname");
const nicknameForm = nickname.querySelector("form");

room.hidden = true; //방 숨기기

let roomName; 



//메시지를 추가해주는 함수
function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

//메시지 전송 (채팅)함수
function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");//메시지 내용 보여주기
    const value = input.value;
    socket.emit("new_message" , input.value , roomName, () =>{
        addMessage(`[You] : ${value}`);
    });
    input.value = "";
}


//방에서 보여지는 부분
function showRoom(){ 
    welcome.hidden = true;
    nicknameSet.hidden = true;
    room.hidden = false;

    const h3 = room.querySelector("h3"); //방에서는 제목이 바뀜
    h3.innerText = `Room ${roomName}`;

    //누가 들어왔다는 걸 알림
    addMessage(`방 <${roomName}> 에 온걸 환영해!!`);

    //메시지 전송(채팅)
   const msgForm = room.querySelector("#msg");
   msgForm.addEventListener("submit", handleMessageSubmit);
}

//방 입장시 일어나는 이벤트들
function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    
    roomName = input.value;
    input.value = "";
  }

form.addEventListener("submit", handleRoomSubmit);

//닉네임 저장
function saveNickname(nickname){
    room.hidden = false;
    nicknameSet.hidden = true;

    roomForm.querySelector("input").focus();

    roomForm.addEventListener("submit", handleRoomSubmit);
}

//닉네임 버튼 핸들러
function handleNickName(event){
    event.preventDefault();

    const input = nicknameForm.querySelector("input");
    const nickname = input.value;

    socket.emit("nickname" , nickname, saveNickname);
}

nicknameForm.addEventListener("submit" , handleNickName);

socket.on('welcome' , (nickname, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    
    addMessage(`${nickname} 입장!!`);
});

socket.on("bye", (nickname , newCount )=> {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${nickname} 나감 ㅜ.ㅜ`);
} );


socket.on("new_message", addMessage);

//룸 체인지 (방 모든 사람들에게 알리는 거)
socket.on ("room_change" , (rooms) => {
    //welcome의 ul를 받아서 roomlist로 만듦
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = ""
    if(rooms.length === 0){//방이 0이면 모든 것을 비워줌 
   
    return;
}
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});
