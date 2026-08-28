import { io } from "socket.io-client";

const API = import.meta.env.VITE_API_URL;
const SOCKET_URL = new URL(API).origin; // strip the /api path, socket.io lives on the root server

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
}