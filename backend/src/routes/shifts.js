import { Router } from "express";
import Shift from "../models/Shift.js";

const router = Router();

// GET /api/shifts?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query;
    let filter = {};
    if (from || to) {
      // Include overnight shifts that START the day before `from`
      // so they appear correctly on the next-day calendar cell.
      const fromDate = from ? new Date(from) : null;
      const oneDayBefore = fromDate ? new Date(fromDate) : null;
      if (oneDayBefore) oneDayBefore.setUTCDate(oneDayBefore.getUTCDate() - 1);

      const toDate = to ? new Date(to) : null;

      filter = {
        $or: [
          // Normal shifts within the range
          {
            date: {
              ...(fromDate && { $gte: fromDate }),
              ...(toDate   && { $lte: toDate }),
            },
          },
          // Overnight shifts (endsNextDay flag set — new records)
          {
            endsNextDay: true,
            date: {
              ...(oneDayBefore && { $gte: oneDayBefore }),
              ...(fromDate     && { $lt:  fromDate }),
            },
          },
          // Overnight shifts detected by time comparison — fallback for old records
          // where endsNextDay was not yet stored (startTime > endTime means overnight)
          {
            $expr: { $gt: ["$startTime", "$endTime"] },
            date: {
              ...(oneDayBefore && { $gte: oneDayBefore }),
              ...(fromDate     && { $lt:  fromDate }),
            },
          },
        ],
      };
    }
    const shifts = await Shift.find(filter).sort({ date: 1, startTime: 1 });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const shift = await Shift.create(req.body);
    res.status(201).json(shift);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const existing = await Shift.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Shift not found" });
    Object.assign(existing, req.body);
    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Shift.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Shift not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
