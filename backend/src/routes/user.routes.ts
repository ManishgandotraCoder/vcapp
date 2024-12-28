// src/routes/user.routes.ts
import { Router, Request, Response } from "express";
import User from "../models/User";

const router = Router();

// GET: List all users
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST: Create a new user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({
      username,
      email,
      password,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, password, status } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, password, status },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
router.delete("/", async (req: Request, res: Response) => {
  try {
    await User.deleteMany({});
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
export default router;
