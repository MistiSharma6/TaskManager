import Task from "../models/Task.js";

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  res.json(tasks);
};

// @desc    Add a new task
// @route   POST /api/tasks
// @access  Private
export const addTask = async (req, res) => {
  const { title, description } = req.body;
  const task = new Task({
    user: req.user._id,
    title,
    description,
  });

  const createdTask = await task.save();
  res.status(201).json(createdTask);
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task && task.user.toString() === req.user._id.toString()) {
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;
    const updatedTask = await task.save();
    res.json(updatedTask);
  } else {
    res.status(404).json({ message: "Task not found or not authorized" });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task && task.user.toString() === req.user._id.toString()) {
    await task.deleteOne();
    res.json({ message: "Task removed" });
  } else {
    res.status(404).json({ message: "Task not found or not authorized" });
  }
};

