import { describe, it, expect } from "vitest";
import { z } from "zod";

/**
 * Tests for the booking Zod schema used in api/appointments/route.ts POST.
 * Extracted here so we can test validation without mocking Supabase.
 */

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PostAppointmentSchema = z.object({
  stylist_id: z.string().regex(uuidRegex, "stylist_id must be a valid UUID"),
  service_id: z.string().regex(uuidRegex, "service_id must be a valid UUID").optional(),
  service_ids: z.array(z.string().regex(uuidRegex, "each service_id must be a valid UUID")).min(1).optional(),
  start_at: z.string().datetime({ message: "start_at must be a valid ISO date" }),
  end_at: z.string().datetime({ message: "end_at must be a valid ISO date" }),
  client_notes: z.string().max(500, "client_notes max 500 characters").optional(),
}).refine((d) => d.service_id || d.service_ids, {
  message: "service_id or service_ids is required",
});

const validUUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const validUUID2 = "b2c3d4e5-f6a7-8901-bcde-f12345678901";

const validPayload = {
  stylist_id: validUUID,
  service_id: validUUID2,
  start_at: "2026-04-01T10:00:00Z",
  end_at: "2026-04-01T11:00:00Z",
};

describe("PostAppointmentSchema", () => {
  it("accepts a valid booking with service_id", () => {
    const result = PostAppointmentSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts a valid booking with service_ids array", () => {
    const result = PostAppointmentSchema.safeParse({
      stylist_id: validUUID,
      service_ids: [validUUID, validUUID2],
      start_at: "2026-04-01T10:00:00Z",
      end_at: "2026-04-01T11:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional client_notes", () => {
    const result = PostAppointmentSchema.safeParse({
      ...validPayload,
      client_notes: "Please use gentle products",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing stylist_id", () => {
    const { stylist_id: _, ...noStylist } = validPayload;
    void _;
    const result = PostAppointmentSchema.safeParse(noStylist);
    expect(result.success).toBe(false);
  });

  it("rejects missing both service_id and service_ids", () => {
    const result = PostAppointmentSchema.safeParse({
      stylist_id: validUUID,
      start_at: "2026-04-01T10:00:00Z",
      end_at: "2026-04-01T11:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID for stylist_id", () => {
    const result = PostAppointmentSchema.safeParse({
      ...validPayload,
      stylist_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID in service_ids array", () => {
    const result = PostAppointmentSchema.safeParse({
      stylist_id: validUUID,
      service_ids: [validUUID, "bad-id"],
      start_at: "2026-04-01T10:00:00Z",
      end_at: "2026-04-01T11:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty service_ids array", () => {
    const result = PostAppointmentSchema.safeParse({
      stylist_id: validUUID,
      service_ids: [],
      start_at: "2026-04-01T10:00:00Z",
      end_at: "2026-04-01T11:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid datetime for start_at", () => {
    const result = PostAppointmentSchema.safeParse({
      ...validPayload,
      start_at: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects client_notes over 500 characters", () => {
    const result = PostAppointmentSchema.safeParse({
      ...validPayload,
      client_notes: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts client_notes at exactly 500 characters", () => {
    const result = PostAppointmentSchema.safeParse({
      ...validPayload,
      client_notes: "x".repeat(500),
    });
    expect(result.success).toBe(true);
  });
});
