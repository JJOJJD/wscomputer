const ComputerComponent = require("../models/computerComponent");

class ComponentController {
  async getAllComponents(req, res) {
    try {
      const components = await ComputerComponent.find();
      const response = components.map(c => {
        const obj = c.toObject();
        obj.recommended = obj.valueScore >= 0.10;
        return obj;
      });
      res.json(response);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getRanking(req, res) {
    try {
      const components = await ComputerComponent.find().sort({ valueScore: -1 });
      const response = components.map((c, index) => {
        const obj = c.toObject();
        obj.rank = index + 1;
        obj.recommended = obj.valueScore >= 0.10;
        return obj;
      });
      res.json(response);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async findById(req, res) {
    try {
      const idParam = req.params.id;
      let component;
      if (!isNaN(idParam)) {
        component = await ComputerComponent.findOne({ id: Number(idParam) });
      } else {
        component = await ComputerComponent.findById(idParam);
      }
      if (!component) {
        return res.status(404).json({ message: "Component not found" });
      }
      const obj = component.toObject();
      obj.recommended = obj.valueScore >= 0.10;
      res.json(obj);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async addComponent(req, res) {
    try {
      const lastComponent = await ComputerComponent.findOne().sort({ id: -1 });
      const nextId = lastComponent && lastComponent.id ? lastComponent.id + 1 : 1;
      const component = new ComputerComponent({
        id: nextId,
        name: req.body.name,
        description: req.body.description,
        manufacturer: req.body.manufacturer,
        category: req.body.category,
        model: req.body.model,
        price: Number(req.body.price),
        performanceScore: Number(req.body.performanceScore)
      });
      const newComponent = await component.save();
      const obj = newComponent.toObject();
      obj.recommended = obj.valueScore >= 0.10;
      res.status(201).json(obj);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async updateComponent(req, res) {
    try {
      const idParam = req.params.id;
      let component;
      if (!isNaN(idParam)) {
        component = await ComputerComponent.findOne({ id: Number(idParam) });
      } else {
        component = await ComputerComponent.findById(idParam);
      }
      if (!component) {
        return res.status(404).json({ message: "Component not found" });
      }
      if (req.body.name !== undefined) component.name = req.body.name;
      if (req.body.description !== undefined) component.description = req.body.description;
      if (req.body.manufacturer !== undefined) component.manufacturer = req.body.manufacturer;
      if (req.body.category !== undefined) component.category = req.body.category;
      if (req.body.model !== undefined) component.model = req.body.model;
      if (req.body.price !== undefined) component.price = Number(req.body.price);
      if (req.body.performanceScore !== undefined) component.performanceScore = Number(req.body.performanceScore);

      const updatedComponent = await component.save();
      const obj = updatedComponent.toObject();
      obj.recommended = obj.valueScore >= 0.10;
      res.json(obj);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async deleteComponent(req, res) {
    try {
      const idParam = req.params.id;
      let deletedComponent;
      if (!isNaN(idParam)) {
        deletedComponent = await ComputerComponent.findOneAndDelete({ id: Number(idParam) });
      } else {
        deletedComponent = await ComputerComponent.findByIdAndDelete(idParam);
      }
      if (!deletedComponent) {
        return res.status(404).json({ message: "Component not found" });
      }
      res.json({ message: "Component deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new ComponentController();
