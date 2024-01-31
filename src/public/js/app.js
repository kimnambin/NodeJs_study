//io는 자동적으로 소켓 io 벡엔드와 연결해주는 함수임
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    //룸은 보내는 것이 아닌 emit 해주면 된다함
    socket.emit("enter_room" , { payload: input.value },
    ()=> {
        console.log("server is done 준비됐구~");
    });
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
