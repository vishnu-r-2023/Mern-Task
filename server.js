var express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const port = 4444;

const mongodb = "mongodb+srv://vishnuramesh:Vishnu123@cluster0.oun5q.mongodb.net/ExpenseTracker"; 

mongoose.connect(mongodb)
  .then(() => {
    console.log("Connected successfully to the database.");
    app.listen(port, () => {
      console.log(`Server is running at port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true, enum: ["pending", "in-progress", "completed"], default: "pending" }
});

const taskModel = mongoose.model("taskModel", taskSchema);

// Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await taskModel.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Get a specific task by ID
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await taskModel.findOne({ id });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

const { v4: uuidv4 } = require("uuid");

// Add a new task
app.post("/api/tasks", async (req, res) => {
  const { title, description, status } = req.body;
  try {
    const newTask = new taskModel({
      id: uuidv4(),
      title,
      description,
      status,
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to save task" });
  }
});

// Update an existing task by ID
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    const updatedTask = await taskModel.findOneAndUpdate(
      { id },
      { title, description, status },
      { new: true } // Return the updated document
    );
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete a task by ID
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTask = await taskModel.findOneAndDelete({ id });
    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully", deletedTask });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Get tasks by status
app.get("/api/tasks/status/:status", async (req, res) => {
  const { status } = req.params;
  try {
    const tasks = await taskModel.find({ status });
    if (tasks.length === 0) {
      return res.status(404).json({ error: "No tasks found with this status" });
    }
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks by status" });
  }
});

// Update the status of a task by ID
app.put("/api/tasks/status/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Only status is being updated
  try {
    if (!["pending", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    const updatedTask = await taskModel.findOneAndUpdate(
      { id },
      { status },
      { new: true } // Return the updated document
    );
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task status" });
  }
});
