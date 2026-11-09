import { describe, it, expect } from "vitest";
import { slotsForDay, zonedToUtc, type BookingConfig } from "@/lib/booking";

const base: BookingConfig = {
  duration_min: 30, buffer_min: 0, min_notice_hours: 0, horizon_days: 365,
  weekly: { "1": [{ start: "09:00", end: "10:00" }] }, blocked: [], timezone: "Europe/Paris", busy: [],
};
const now = new Date("2030-01-01T00:00:00Z");

describe("créneaux de rendez-vous", () => {
  it("heure de Paris convertie correctement (hiver UTC+1)", () => {
    expect(zonedToUtc("2030-01-07", 9 * 60, "Europe/Paris").toISOString()).toBe("2030-01-07T08:00:00.000Z");
  });
  it("découpe la plage du membre selon la durée choisie", () => {
    expect(slotsForDay(base, "2030-01-07", now)).toHaveLength(2); // lundi 9h-10h, 30 min
  });
  it("aucun créneau un jour non ouvert", () => {
    expect(slotsForDay(base, "2030-01-08", now)).toHaveLength(0);
  });
  it("aucun créneau sur une période bloquée", () => {
    expect(slotsForDay({ ...base, blocked: [{ from: "2030-01-07", to: "2030-01-07" }] }, "2030-01-07", now)).toHaveLength(0);
  });
  it("un créneau déjà réservé disparaît", () => {
    const busy = [{ s: "2030-01-07T08:00:00Z", e: "2030-01-07T08:30:00Z" }];
    expect(slotsForDay({ ...base, busy }, "2030-01-07", now)).toHaveLength(1);
  });
});
