//여기는 express을 이용한 프레임 워크라고 생각하면 됨
//express로는 view를 설정 + render (페이지 렌더)
// http + ws 둘다 사용

import express from "express";
//ws 사용을 위함
import http from "http";
import WebSocket from "ws";

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

/* ---------------------------여기까지 app------------------------- */

const handleListen = () => console.log(`Listening on http://localhost:3000`);




// ws(웹 소켓) 사용을 위한 작업
const server = http.createServer(app);
// ws 서버 (웹소켓 서버 줄인말) 사용
const wss = new WebSocket.Server({server});

// ws에서의 이벤트 처리 -> 메시지 보내보기
wss.on("connection", (socket)=> {
    console.log("Connected to Browser ✅");
      //app.js 에서 close 이벤트를 사용하기 위함
    //on메소드가 이걸 가능하게 해줌-> ws와 연결이 되야지 이벤트가 작동함
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));
    socket.on("message", (message) => {
      console.log(message);
    });
    socket.send("hello!!!");
  });
  

  server.listen(3000,handleListen);
