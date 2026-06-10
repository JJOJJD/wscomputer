const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const port = process.env.PORT || 3014;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  process.exit(1);
}

const ComputerComponent = require("./models/computerComponent");

mongoose.connect(mongoUri);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", async () => {
  console.log("Connected to MongoDB");
  try {
    const count = await ComputerComponent.countDocuments();
    if (count === 0) {
      const dataPath = path.join(__dirname, "data", "initialComponents.json");
      const fileData = fs.readFileSync(dataPath, "utf8");
      const initialComponents = JSON.parse(fileData);
      for (const component of initialComponents) {
        const doc = new ComputerComponent(component);
        await doc.save();
      }
      console.log("Database seeded successfully");
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }
});

app.use(express.json());
const cors = require("cors");
app.use(cors());

const componentRoutes = require("./routes/componentRoutes");
app.use("/computerstore", componentRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Computer Components API is running" });
});

app.listen(port, () => console.log("Server is running on port " + port));
