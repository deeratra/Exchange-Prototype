import { WebSocketServer, WebSocket } from "ws";
import { UserManager } from "./UserManager";

const wss = new WebSocketServer({ port: 3400 });

wss.on("connection", (ws: WebSocket) => {
    UserManager.getInstance().addUser(ws);
});