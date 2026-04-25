// PRAVAH + LifeLane - Socket.IO Server Setup
// This file sets up Socket.IO to work with Next.js App Router

import { NextRequest } from "next/server";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

const ioHandler = (req: NextRequest) => {
  if (!io) {
    io = new SocketIOServer({
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle ambulance location updates
      socket.on("ambulance:send_location", (data) => {
        console.log("Ambulance location:", data);
        socket.broadcast.emit("ambulance:location_update", data);
      });

      // Handle emergency SOS requests
      socket.on("emergency:request_sos", (data) => {
        console.log("Emergency SOS:", data);
        io?.emit("emergency:new_request", data);
      });

      // Handle junction updates
      socket.on("junction:update", (data) => {
        console.log("Junction update:", data);
        io?.emit("junction:status_update", data);
      });

      // Subscription handlers
      socket.on("subscribe:ambulances", () => {
        socket.join("ambulances");
      });

      socket.on("subscribe:emergencies", () => {
        socket.join("emergencies");
      });

      socket.on("subscribe:junctions", () => {
        socket.join("junctions");
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  return new Response("Socket.IO server", { status: 200 });
};

export { ioHandler as GET, ioHandler as POST };
