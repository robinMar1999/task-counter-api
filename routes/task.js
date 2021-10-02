const express = require("express");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Task = require("../models/Task");
const { isValidObjectId } = require("mongoose");
const errorsToString = require("../utils/errorsToString");

const router = express.Router();

// create new task
router.post(
  "/",
  auth,
  [
    body("description", "[description] is required").not().isEmpty(),
    body("completed", "[completed] should be a boolean").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          msg: errorsToString(errors.array()),
        });
      }
      const task = new Task({
        ...req.body,
        owner: req.userId,
      });
      await task.save();
      res.status(201).send(task);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server Error!" });
    }
  }
);

// get all tasks of a user
router.get("/", auth, async (req, res) => {
  try {
    const findParams = {
      owner: req.userId,
    };
    if (req.query.completed) {
      findParams.completed = req.query.completed === "true";
    }
    const tasks = await Task.find(findParams);
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error!" });
  }
});

// update task
router.patch(
  "/:id",
  auth,
  [
    body("description", "[description] cannot be empty")
      .optional()
      .not()
      .isEmpty(),
    body("completed", "[completed] should be boolean").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          msg: errorsToString(errors.array()),
        });
      }
      if (!isValidObjectId(req.params.id)) {
        return res.status(404).json({ msg: "Task Not Found" });
      }
      const task = await Task.findById(req.params.id);
      if (!task.owner.equals(req.userId)) {
        return res.status(401).json({ msg: "Authorization denied" });
      }
      for (let key in req.body) {
        task[key] = req.body[key];
      }
      await task.save();
      res.status(201).send(task);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server Error!" });
    }
  }
);

// delete task
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ msg: "Task Not Found" });
    }
    const task = await Task.findById(req.params.id);
    if (!task.owner.equals(req.userId)) {
      return res.status(401).json({ msg: "Authorization denied" });
    }
    await task.delete();
    res.status(202).send();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error!" });
  }
});

module.exports = router;
