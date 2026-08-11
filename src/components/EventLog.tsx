"use client";
import { useEffect, useState } from "react";
import { Event } from "@/types";

export function EventLog() {
  const [events, setEvents] = useState<Event[]>([]);

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

  return (
    <div className="bg-white rounded shadow p-4 max-h-80 overflow-y-auto">
      {events.length === 0 ? (
        <p className="text-gray-500 text-sm">No events yet.</p>
      ) : (
        <ul className="space-y-1">
          {events.map((evt) => (
            <li key={evt.id} className="text-sm text-gray-700">
              <span className="text-xs text-gray-400">
                {new Date(evt.createdAt).toLocaleTimeString()}
              </span>{" "}
              <span
                className={`font-medium ${
                  evt.type === "job_created"
                    ? "text-blue-600"
                    : evt.type === "status_changed"
                    ? "text-yellow-600"
                    : evt.type === "slack_sheets_sent"
                    ? "text-green-600"
                    : evt.type === "slack_sheets_failed"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {evt.type}
              </span>{" "}
              — {evt.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}