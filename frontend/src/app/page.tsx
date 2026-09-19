"use client";
import App from '@/App';


import { useSocket } from "@/hooks/useSocket";

export default function Page() {

  useSocket();
  return <App />;
}
