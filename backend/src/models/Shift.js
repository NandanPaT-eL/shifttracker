import mongoose from "mongoose";

const paySchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ["hourly", "flat"], default: "hourly" },
    rate: { type: Number, default: 0 }, // used when type === "hourly"
    flatAmount: { type: Number, default: 0 }, // used when type === "flat"
    amount: { type: Number, default: 0 }, // always the final computed total
  },
  { _id: false }
);

const shiftSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true }, // stored at UTC midnight for the shift's calendar day
    startTime: { type: String, required: true }, // "HH:mm"
    endTime: { type: String, required: true }, // "HH:mm"
    hours: { type: Number, required: true },
    endsNextDay: { type: Boolean, default: false }, // true when endTime < startTime (overnight shift)
    category: { type: String, required: true, trim: true },
    location: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    pay: { type: paySchema, default: () => ({}) },
  },
  { timestamps: true }
);

shiftSchema.index({ date: 1 });
shiftSchema.index({ category: 1 });

function computeHours(startTime, endTime) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let start = sh * 60 + sm;
  let end = eh * 60 + em;
  if (end <= start) end += 24 * 60; // overnight shift
  return Math.round(((end - start) / 60) * 100) / 100;
}

shiftSchema.pre("validate", function computeDerivedFields(next) {
  this.hours = computeHours(this.startTime, this.endTime);

  // Mark overnight: end time is on the following calendar day
  const [sh, sm] = this.startTime.split(":").map(Number);
  const [eh, em] = this.endTime.split(":").map(Number);
  this.endsNextDay = eh * 60 + em <= sh * 60 + sm;

  if (this.pay?.enabled) {
    this.pay.amount =
      this.pay.type === "flat"
        ? Number(this.pay.flatAmount) || 0
        : Math.round((this.hours * (Number(this.pay.rate) || 0)) * 100) / 100;
  } else if (this.pay) {
    this.pay.amount = 0;
  }

  next();
});

export default mongoose.model("Shift", shiftSchema);
