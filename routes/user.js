// backend/routes/user.js
const express = require("express");
const { User, Account } = require("../db");
const z = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("./middleware");

const router = express.Router();

const signupBody = z.object({
  username: z.string().email(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

router.post("/signup", async (req, res) => {
  console.log(req.body);
  // const { successData } = signupBody.safeParse(req.body);
  const successData = req.body;
  console.log(successData);
  if (!successData) {
    res.status(400).json({
      message: "Incorrect Inputs",
    });
    return;
  }
  const existingUser = await User.findOne({ username: successData.username });
  if (existingUser) {
    res.status(400).json({
      message: "User already exists",
    });
    return;
  }

  const user = await User.create({
    username: successData.username,
    password: successData.password,
    firstName: successData.firstName,
    lastName: successData.lastName,
  });
  const userId = user._id;

  await Account.create({
    userId: userId,
    balance: 1 + Math.random() * 10000,
  });

  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );

  res.json({
    message: "User created successfully!",
    token: token,
  });
});

const signinBody = z.object({
  username: z.string().email(),
  password: z.string(),
});

router.post("/signin", async (req, res) => {
  // const { successData } = signinBody.safeParse(req.body);
  const successData = req.body;
  if (!successData) {
    res.status(400).json({
      message: "Invalid Input",
    });
  }
  const user = await User.findOne({
    username: successData.username,
    password: successData.password,
  });

  if (!user) {
    res.status(400).json({
      message: "Please enter valid username or password",
    });
    return;
  } else {
    const userId = user._id;
    const token = jwt.sign(
      {
        userId,
      },
      JWT_SECRET
    );
    res.status(200).json({
      message: "Login successfull",
      token: token,
    });
    return;
  }
});

const userEditBody = z.object({
  password: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

router.put("/", authMiddleware, async (req, res) => {
  const parsedData = userEditBody.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({
      message: "Password is too short",
    });
  }

  await User.updateOne({ _id: req.userId }, req.body);

  res.send({
    message: "User updated successfully",
  });
});

router.get("/bulk", authMiddleware, async (req, res) => {
  const filter = req.query.filter || "";
  const userList = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  res.json({
    users: userList.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});

module.exports = router;
