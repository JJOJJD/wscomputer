const mongoose = require("mongoose");

const computerComponentSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  manufacturer: { type: String },
  category: { type: String },
  model: { type: String },
  price: { type: Number, required: true },
  performanceScore: { type: Number, required: true },
  valueScore: { type: Number }
}, { collection: "component" });

computerComponentSchema.pre("save", function() {
  if (this.price <= 0) {
    throw new Error("Price must be greater than zero");
  }
  if (this.performanceScore < 0 || this.performanceScore > 100) {
    throw new Error("Performance score must be between 0 and 100");
  }
  this.valueScore = this.performanceScore / this.price;
});

module.exports = mongoose.model("ComputerComponent", computerComponentSchema);
