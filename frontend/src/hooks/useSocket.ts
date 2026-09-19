"use client";

import { useEffect } from "react";
import socket from "@/lib/socket";

export const useSocket = () => {
  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      console.log("🔌 Connected to ResQAI realtime server:", socket.id);
    };

    const handleDisconnect = () => {
      console.log("🔌 Disconnected from ResQAI realtime server");
    };

    const handleIncidentDispatched = (data: unknown) => {
      console.log("🚨 INCIDENT DISPATCHED:", data);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.on(
      "incident:dispatched",
      handleIncidentDispatched
    );

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);

      socket.off(
        "incident:dispatched",
        handleIncidentDispatched
      );

      socket.disconnect();
    };
  }, []);

  return socket;
};