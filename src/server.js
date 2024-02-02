//여기는 express을 이용한 프레임 워크라고 생각하면 됨
//express로는 view를 설정 + render (페이지 렌더)


import express from "express";
import http from "http";
import SocketIO from "socket.io";

const app = express(); 

//앱 세팅 -> 뷰 엔진은 퍼그로 사용하겠다
app.set("view engine" , "pug");

/*views 폴더 , views에 담긴 dirname을 사용하겠다
dirname을 사용하면 해당 경로에 있는 파일을 사용가능함*/
app.set("views", __dirname + "/views");

/*유저가 public으로 가게 되면 public 폴더를 보여줌
static이 사용되는 이유는 정적 파일이기 때문 -> 코딩된 내용만 보여주는 것 */
app.use("/public" , express.static(__dirname + "/public"));

//get이 라우팅
app.get("/", (_ , res) => res.render("home"));
//유저가 어디로 이동할 때마다 반응
app.get("/*", (_, res) => res.redirect("/"));

/* ---------------------------여기까지 app (expressJS)------------------------- */

//소켓 io 서버로 보내는 과정
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

//아답터를 이용한 공개방을 알려주는 함수 //고유한 방(sids) + wsserver 정보 가져오기
function publicRooms(){
  const { sockets : {
    adapter : { sids, rooms }, },
  }= wsServer;
  const publicRooms = [];
  rooms.forEach((_,key) => {
    if (sids.get(key) === undefined ){
      publicRooms.push(key);
    }
  });
return publicRooms;
}

//방에 들어온 사람 수 카운트
function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}


wsServer.on("connection" , (socket) => {
  //onAny -> 언제,어디서나 사용 가능하게 해주는 것
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  //done이 프론트에서 보낸 벡엔드를 실행시키는 것
  socket.on("enter_room" , (roomName  ,showRoom) => {
   socket.join(roomName);//누군가 참여한 걸 알려줌
   showRoom(roomName);
   //룸안에 있는 사람들에게 emit(방출)함 + 닉네임과 함께
   socket.to(roomName).emit("welcome", socket["nickname"] , countRoom(roomName)); 
  
  //다른 브라우저에서 방이 만들어졌을 때 publicRooms에 알리기 위함
   wsServer.sockets.emit("room_change" , publicRooms()); 

   //메시지 옆에 닉네임
   socket.on("message" , (msg , addMessage) => {
    message = ` ${socket["nickname"]}  : ${msg}`;
    socket.to(roomName).emit("Message" , msg , addMessage(msg));
   
   });
});

//누군가 방을 나간 걸 알려줌
socket.on("disconnecting", () => {
 
  socket.rooms.forEach((room) => 
    socket.to(room).emit("bye", socket.nickname , countRoom(room) -1)
  );
});

 //룸 체인지도 떠났다고 알림
socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });



//메시지(채팅) + room을 넣으면서 어디에 메시지를 보내는 지 알게 됨
socket.on("new_message" , (msg, room, done) => {
  socket.to(room).emit("new_message" , `${socket["nickname"]}:${msg}`);
  done();
});
socket.on("nickname", (nickname) =>
(socket["nickname"]= nickname));
});

const handleListen = () =>
console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000,handleListen);


