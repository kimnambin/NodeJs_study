
const socket = io();//io는 자동적으로 소켓 io 벡엔드와 연결해주는 함수임
const welcome = document.getElementById("welcome");//처음 보여지는 부분
const form = welcome.querySelector("form");
const room = document.getElementById("room"); //방에 입장하고 나서 보여지는 부분

room.hidden = true; //방 숨기기

let roomName; //방에 입장한 유저들 닉네임

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
    socket.emit("new_message" , input.value , roomNmae, () =>{
        addMessage(`유:${value}`);
    });
    input.value = "";
}

//닉네임 설정부분

//방에서 보여지는 부분
function showRoom(){ 
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3"); //방에서는 제목이 바뀜
    h3.innerText = `Room ${roomName}`;
    //메시지 전송(채팅)
    const msgform = room.querySelector("#msg");
    msgform.addEventListener("submit" , handleMessageSubmit);
}

//방 입장시 일어나는 이벤트들
function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    //룸은 보내는 것이 아닌 emit 해주면 된다함
    socket.emit("enter_room" ,  input.value , showRoom );
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

//서버에서 실행할 수 있게함 -> 룸안에 있는 사람들에게 emit(방출)하는걸
socket.on("welcome", (user)=>{
    addMessage(`${user}입장!!`);
});

//방에 누가 나갈걸 알려주는 메시지
socket("bye", (left)=> {
    addMessage(`${left}나감 ㅜ.ㅜ`);
} );

socket.on("new_message", addMessage);