const express = require("express");
const componentController = require("../controllers/componentController");
const router = express.Router();

router.get("/components/ranking", componentController.getRanking);
router.get("/components", componentController.getAllComponents);
router.get("/components/:id", componentController.findById);
router.post("/components", componentController.addComponent);
router.put("/components/:id", componentController.updateComponent);
router.delete("/components/:id", componentController.deleteComponent);

module.exports = router;
