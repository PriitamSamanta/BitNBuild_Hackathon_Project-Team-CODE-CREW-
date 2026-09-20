import {
  checkDelayedResponses,
  checkEscalations,
} from "./alert-engine.service.js";

let monitorStarted = false;

export const startAlertMonitor = () => {
  if (monitorStarted) {
    return;
  }

  monitorStarted = true;

  console.log("🚨 Alert monitoring engine started");

  setInterval(async () => {
    try {
      await checkDelayedResponses();
      await checkEscalations();
    } catch (error) {
      console.error("ALERT MONITOR ERROR:", error);
    }
  }, 60 * 1000);
};