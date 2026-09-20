"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import socket from "@/lib/socket";

interface AlertEvent {
  alertId?: string;
  title?: string;
  message?: string;
  type?: string;
  severity?: "info" | "warning" | "critical";
  incidentId?: string;
}

interface SocketNotification {
  type: "critical" | "warning" | "info" | "success" | "ai";
  title: string;
  message: string;
  incidentId?: string;
}

export const useSocket = (
  onNotification?: (
    notification: SocketNotification,
  ) => void,
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      console.log(
        "🔌 Connected to ResQAI realtime server:",
        socket.id,
      );
    };

    const handleDisconnect = () => {
      console.log(
        "🔌 Disconnected from ResQAI realtime server",
      );
    };

    const handleIncidentDispatched = (data: unknown) => {
      console.log(
        "🚨 INCIDENT DISPATCHED:",
        data,
      );

      queryClient.invalidateQueries({
        queryKey: ["resq", "incidents"],
      });

      queryClient.invalidateQueries({
        queryKey: ["resq", "teams"],
      });
    };

    const handleTeamStatusChanged = (data: unknown) => {
      console.log(
        "🚑 TEAM STATUS CHANGED:",
        data,
      );

      queryClient.invalidateQueries({
        queryKey: ["resq", "teams"],
      });

      queryClient.invalidateQueries({
        queryKey: ["resq", "incidents"],
      });
    };

    const handleAlertCreated = (data: AlertEvent) => {
      console.log(
        "🚨 REALTIME ALERT CREATED:",
        data,
      );

      queryClient.invalidateQueries({
        queryKey: ["resq", "alerts"],
      });

      const notificationType =
        data.severity === "critical"
          ? "critical"
          : data.severity === "warning"
            ? "warning"
            : "info";

      onNotification?.({
        type: notificationType,
        title: data.title || "Emergency Alert",
        message:
          data.message ||
          "A new emergency alert has been created.",
        incidentId: data.incidentId,
      });
    };

    const handleAlertAcknowledged = (
      data: AlertEvent,
    ) => {
      console.log(
        "✅ ALERT ACKNOWLEDGED:",
        data,
      );

      queryClient.invalidateQueries({
        queryKey: ["resq", "alerts"],
      });
    };

    const handleAlertResolved = (
      data: AlertEvent,
    ) => {
      console.log(
        "✔️ ALERT RESOLVED:",
        data,
      );

      queryClient.invalidateQueries({
        queryKey: ["resq", "alerts"],
      });
    };

    socket.on(
      "connect",
      handleConnect,
    );

    socket.on(
      "disconnect",
      handleDisconnect,
    );

    socket.on(
      "incident:dispatched",
      handleIncidentDispatched,
    );

    socket.on(
      "team:status_changed",
      handleTeamStatusChanged,
    );

    socket.on(
      "alert:created",
      handleAlertCreated,
    );

    socket.on(
      "alert:acknowledged",
      handleAlertAcknowledged,
    );

    socket.on(
      "alert:resolved",
      handleAlertResolved,
    );

    return () => {
      socket.off(
        "connect",
        handleConnect,
      );

      socket.off(
        "disconnect",
        handleDisconnect,
      );

      socket.off(
        "incident:dispatched",
        handleIncidentDispatched,
      );

      socket.off(
        "team:status_changed",
        handleTeamStatusChanged,
      );

      socket.off(
        "alert:created",
        handleAlertCreated,
      );

      socket.off(
        "alert:acknowledged",
        handleAlertAcknowledged,
      );

      socket.off(
        "alert:resolved",
        handleAlertResolved,
      );

      socket.disconnect();
    };
  }, [
    onNotification,
    queryClient,
  ]);

  return socket;
};