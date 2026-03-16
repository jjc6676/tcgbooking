"use client";

import { useEffect, useState } from "react";
import type { Service } from "@/lib/supabase/types";

function centsToDisplay(cents: number) {
  return (cents / 100).toFixed(2);
}

function dollarsToCents(dollars: string) {
  return Math.round(parseFloat(dollars) * 100);
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add form
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("60");
  const [price, setPrice] = useState("0.00");

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    setServices(data.services ?? []);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          duration_minutes: parseInt(duration),
          internal_price_cents: dollarsToCents(price),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to add" });
      } else {
        setServices((prev) => [...prev, data.service]);
        setName("");
        setDuration("60");
        setPrice("0.00");
        setMessage({ type: "success", text: `"${data.service.name}" added.` });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(service: Service) {
    setEditId(service.id);
    setEditName(service.name);
    setEditDuration(String(service.duration_minutes));
    setEditPrice(centsToDisplay(service.internal_price_cents));
  }

  async function handleEdit(id: string) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          duration_minutes: parseInt(editDuration),
          internal_price_cents: dollarsToCents(editPrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Failed to update" });
      } else {
        setServices((prev) =>
          prev.map((s) => (s.id === id ? data.service : s))
        );
        setEditId(null);
        setMessage({ type: "success", text: "Service updated." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(service: Service) {
    const res = await fetch(`/api/admin/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !service.is_active }),
    });
    const data = await res.json();
    if (res.ok) {
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? data.service : s))
      );
    }
  }

  async function handleDelete(id: string, serviceName: string) {
    if (!confirm(`Delete "${serviceName}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (res.ok) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Services</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage the services you offer. Pricing is internal and not visible to clients.
      </p>

      {/* Service list */}
      {services.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Your Services
          </h2>
          <div className="bg-white border rounded-lg divide-y">
            {services.map((s) =>
              editId === s.id ? (
                <div key={s.id} className="px-4 py-3 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 sm:col-span-1">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Service name"
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        placeholder="Minutes"
                        min={1}
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="Price ($)"
                        step="0.01"
                        min={0}
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(s.id)}
                      disabled={submitting}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={s.id}
                  className={`flex items-center justify-between px-4 py-3 ${
                    !s.is_active ? "opacity-50" : ""
                  }`}
                >
                  <div>
                    <span className="font-medium text-sm">{s.name}</span>
                    <span className="ml-3 text-xs text-gray-400">
                      {s.duration_minutes} min · ${centsToDisplay(s.internal_price_cents)}
                    </span>
                    {!s.is_active && (
                      <span className="ml-2 text-xs text-orange-500">(inactive)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => startEdit(s)}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(s)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      {s.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Add service form */}
      <form onSubmit={handleAdd} className="bg-white border rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Add New Service</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Haircut"
              className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Duration (min)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              min={1}
              placeholder="60"
              className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Price ($) <span className="text-gray-400 font-normal">internal</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min={0}
              step="0.01"
              placeholder="0.00"
              className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Adding…" : "Add Service"}
        </button>
      </form>
    </div>
  );
}
