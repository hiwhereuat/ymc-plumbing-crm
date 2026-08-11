"use client";

import { useState } from "react";
import { CreateJobForm } from "@/components/forms/CreateJobForm";

export default function WidgetPage() {
  const [showForm, setShowForm] = useState(false);

  const lead = {
    firstName: "John",
    lastName: "Smith",
    phone: "+1 555-123-4567",
    email: "john@example.com",
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="bg-white shadow rounded p-4 mb-4">
        <h3 className="text-lg font-medium mb-2">Lead Information</h3>
        <p><span className="font-medium">Name:</span> {lead.firstName} {lead.lastName}</p>
        <p><span className="font-medium">Phone:</span> {lead.phone}</p>
        {lead.email && <p><span className="font-medium">Email:</span> {lead.email}</p>}
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create a Job
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-screen overflow-y-auto relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4">New Job from Lead</h2>
            <CreateJobForm
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}