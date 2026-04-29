"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  obdAdapter,
  type ConnectionStatus,
  type OBDSnapshot,
} from "./elm327-bluetooth";

const HISTORY_SIZE = 60; // Keep last 60 readings (~18 seconds at 300ms)

export interface OBDHistory {
  rpm: number[];
  speed: number[];
  coolantTemp: number[];
  throttle: number[];
  engineLoad: number[];
  timestamps: number[];
}

export function useOBD() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [snapshot, setSnapshot] = useState<OBDSnapshot | null>(null);
  const [history, setHistory] = useState<OBDHistory>({
    rpm: [],
    speed: [],
    coolantTemp: [],
    throttle: [],
    engineLoad: [],
    timestamps: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordedSnapshots = useRef<OBDSnapshot[]>([]);

  useEffect(() => {
    obdAdapter.on("status", (s) => {
      setStatus(s);
      if (s === "ready") {
        setDeviceName(obdAdapter.getDeviceName());
        setError(null);
      }
    });

    obdAdapter.on("data", (data) => {
      setSnapshot(data);
      setHistory((prev) => {
        const next = { ...prev };
        next.rpm = [...prev.rpm, data.rpm ?? 0].slice(-HISTORY_SIZE);
        next.speed = [...prev.speed, data.speed ?? 0].slice(-HISTORY_SIZE);
        next.coolantTemp = [...prev.coolantTemp, data.coolantTemp ?? 0].slice(-HISTORY_SIZE);
        next.throttle = [...prev.throttle, data.throttle ?? 0].slice(-HISTORY_SIZE);
        next.engineLoad = [...prev.engineLoad, data.engineLoad ?? 0].slice(-HISTORY_SIZE);
        next.timestamps = [...prev.timestamps, data.timestamp].slice(-HISTORY_SIZE);
        return next;
      });

      if (isRecording) {
        recordedSnapshots.current.push(data);
      }
    });

    obdAdapter.on("error", (err) => {
      setError(err);
    });

    return () => {
      obdAdapter.stopPolling();
    };
  }, [isRecording]);

  const connect = useCallback(async () => {
    setError(null);
    await obdAdapter.connect();
  }, []);

  const disconnect = useCallback(async () => {
    await obdAdapter.disconnect();
    setSnapshot(null);
    setHistory({ rpm: [], speed: [], coolantTemp: [], throttle: [], engineLoad: [], timestamps: [] });
  }, []);

  const startLive = useCallback((intervalMs = 300) => {
    obdAdapter.startPolling(intervalMs);
  }, []);

  const stopLive = useCallback(() => {
    obdAdapter.stopPolling();
  }, []);

  const startRecording = useCallback(() => {
    recordedSnapshots.current = [];
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    return recordedSnapshots.current;
  }, []);

  const readDTCs = useCallback(async () => {
    return obdAdapter.readDTCs();
  }, []);

  const clearDTCs = useCallback(async () => {
    return obdAdapter.clearDTCs();
  }, []);

  const isSupported = obdAdapter.isSupported();

  return {
    status,
    snapshot,
    history,
    error,
    deviceName,
    isRecording,
    isSupported,
    connect,
    disconnect,
    startLive,
    stopLive,
    startRecording,
    stopRecording,
    readDTCs,
    clearDTCs,
  };
}
