import { Router } from "express";
import Shift from "../models/Shift.js";
import {
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  WEEKDAY_LABELS, MONTH_LABELS,
} from "../utils/dateHelpers.js";

const router = Router();

function round2(n) {
  return Math.round(n * 100) / 100;
}

function byCategoryBreakdown(shifts) {
  const map = new Map();
  for (const s of shifts) {
    const key = s.category;
    if (!map.has(key)) map.set(key, { category: key, hours: 0, pay: 0 });
    const entry = map.get(key);
    entry.hours += s.hours;
    entry.pay += s.pay?.amount || 0;
  }
  return [...map.values()]
    .map((e) => ({ ...e, hours: round2(e.hours), pay: round2(e.pay) }))
    .sort((a, b) => b.hours - a.hours);
}

function totals(shifts) {
  const hours = shifts.reduce((sum, s) => sum + s.hours, 0);
  const pay = shifts.reduce((sum, s) => sum + (s.pay?.amount || 0), 0);
  return { hours: round2(hours), pay: round2(pay), shiftCount: shifts.length };
}

// GET /api/analytics/:period(week|month|year)?date=YYYY-MM-DD
router.get("/:period", async (req, res) => {
  try {
    const { period } = req.params;
    const refDate = req.query.date ? new Date(req.query.date) : new Date();

    let rangeStart, rangeEnd, series;

    if (period === "week") {
      rangeStart = startOfWeek(refDate);
      rangeEnd = endOfWeek(refDate);
      series = WEEKDAY_LABELS.map((label, i) => {
        const dayStart = new Date(rangeStart);
        dayStart.setUTCDate(dayStart.getUTCDate() + i);
        return { label, key: dayStart.toISOString().slice(0, 10), hours: 0, pay: 0 };
      });
    } else if (period === "month") {
      rangeStart = startOfMonth(refDate);
      rangeEnd = endOfMonth(refDate);
      const weeksInMonth = Math.ceil(
        (rangeEnd.getUTCDate() + startOfWeek(rangeStart).getUTCDay()) / 7
      ) || 5;
      series = Array.from({ length: weeksInMonth }, (_, i) => ({
        label: `Week ${i + 1}`,
        hours: 0,
        pay: 0,
      }));
    } else if (period === "year") {
      rangeStart = startOfYear(refDate);
      rangeEnd = endOfYear(refDate);
      series = MONTH_LABELS.map((label) => ({ label, hours: 0, pay: 0 }));
    } else {
      return res.status(400).json({ error: "period must be week, month, or year" });
    }

    const shifts = await Shift.find({ date: { $gte: rangeStart, $lte: rangeEnd } });

    // Fill the series buckets.
    for (const s of shifts) {
      const d = new Date(s.date);
      if (period === "week") {
        const key = d.toISOString().slice(0, 10);
        const bucket = series.find((b) => b.key === key);
        if (bucket) {
          bucket.hours = round2(bucket.hours + s.hours);
          bucket.pay = round2(bucket.pay + (s.pay?.amount || 0));
        }
      } else if (period === "month") {
        const weekIndex = Math.floor(
          (d.getUTCDate() - 1 + startOfWeek(rangeStart).getUTCDay()) / 7
        );
        const bucket = series[Math.min(weekIndex, series.length - 1)];
        bucket.hours = round2(bucket.hours + s.hours);
        bucket.pay = round2(bucket.pay + (s.pay?.amount || 0));
      } else if (period === "year") {
        const bucket = series[d.getUTCMonth()];
        bucket.hours = round2(bucket.hours + s.hours);
        bucket.pay = round2(bucket.pay + (s.pay?.amount || 0));
      }
    }

    res.json({
      period,
      rangeStart,
      rangeEnd,
      totals: totals(shifts),
      byCategory: byCategoryBreakdown(shifts),
      series,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
