"use client";
import { useEffect, useState, useRef } from "react";
import { Event } from "@/types";

export function EventLog() {
  const [events, setEvents] = useState<Event[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success) setEvents(data.events);
    } catch (error) {
      console.error("Failed to fetch events", error);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div
      ref={containerRef}
      style={{
        background: "white",
        borderRadius: "0.75rem",
        border: "1px solid #f1f5f9",
        padding: "1rem",
        maxHeight: "16rem",
        overflowY: "auto",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <h3
        style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.75rem",
        }}
      >
        Activity Log
      </h3>
      {events.length === 0 ? (
        <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>No events yet.</p>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {events.map((evt) => (
            <li
              key={evt.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                fontSize: "0.875rem",
              }}
            >
              <span style={{ color: "#cbd5e1", fontSize: "0.75rem", marginTop: "0.125rem" }}>
                {new Date(evt.createdAt).toLocaleTimeString()}
              </span>
              <span
                style={{
                  fontWeight: 500,
                  color:
                    evt.type === "job_created"
                      ? "#2563eb"
                      : evt.type === "status_changed"
                      ? "#d97706"
                      : evt.type === "slack_sheets_sent"
                      ? "#059669"
                      : evt.type === "slack_sheets_failed"
                      ? "#dc2626"
                      : evt.type === "kommo_stage_updated"
                      ? "#7c3aed"
                      : "#475569",
                }}
              >
                {evt.type.replace(/_/g, " ")}
              </span>
              <span style={{ color: "#64748b" }}>— {evt.message}</span>
            </li>
          ))}
          <div ref={bottomRef} />
        </ul>
      )}
    </div>
  );
}