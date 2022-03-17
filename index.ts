import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import "dotenv/config";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient({
  log: ["query", "error", "warn", "info"],
});
const PORT = 8000;
const app = express();
app.use(cors());
app.use(express.json());

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    include: { orders: { select: { quantity: true, item: true } } },
  });
  res.send(users);
});

function createToken(id: number) {
  //@ts-ignore
  const token = jwt.sign({ id: id }, process.env.SECRET_KEY, {
    expiresIn: "3days",
  });
  return token;
}
app.get("/users/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        orders: {
          select: { item: true, quantity: true },
        },
      },
    });

    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ error: "User not found." });
    }
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message });
  }
});
app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { orders: { include: { item: true } } },
    });

    //@ts-ignore
    const passwordMatches = bcrypt.compareSync(password, user.password);
    if (user && passwordMatches) {
      res.send({ user, token: createToken(user.id) });
    } else {
      throw Error("BOOM");
    }
  } catch (err) {
    res.status(400).send({ error: "Email/Password invalid." });
  }
});
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hash = bcrypt.hashSync(password);
  try {
    const user = await prisma.user.create({
      data: { name, email, password: hash },
      include: { orders: { include: { item: true } } },
    });
    res.send({ user, token: createToken(user.id) });
  } catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message });
  }
});
async function getUserFromToken(token: string) {
  //@ts-ignore
  const data = jwt.verify(token, process.env.SECRET_KEY);
  const user = await prisma.user.findUnique({
    // @ts-ignore
    where: { id: data.id },
    include: { orders: { include: { item: true } } },
  });

  return user;
}
app.get("/validate", async (req, res) => {
  const token = req.headers.authorization;

  try {
    //@ts-ignore
    const user = await getUserFromToken(token);
    res.send(user);
  } catch (err) {
    //@ts-ignore
    res.status(400).send({ error: err.message });
  }
});
app.get("/items", async (req, res) => {
  const items = await prisma.item.findMany({
    include: { orders: { select: { quantity: true, user: true } } },
  });
  res.send(items);
});
app.get("/items/:title", async (req, res) => {
  const title = req.params.title;

  try {
    const item = await prisma.item.findUnique({
      where: { title: title },
      include: {
        orders: {
          select: { user: true, quantity: true },
        },
      },
    });

    if (item) {
      res.send(item);
    } else {
      res.status(404).send({ error: "item not found." });
    }
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ error: err.message });
  }
});

app.post("/orders", async (req, res) => {
  const { userId, itemId } = req.body;
  const token = req.headers.authorization || "";

  try {
    const user = await getUserFromToken(token);
    if (user) {
      const order = await prisma.order.create({
        data: { userId, itemId, quantity: 1 },
      });
      const user = await getUserFromToken(token);

      res.send(user);
    } else {
      res.status(400).send({ error: "You cant order if u are not logged in" });
    }
  } catch (error) {
    //@ts-ignore
    res.send({ error: err.message });
  }
});
app.patch("/orders/:id", async (req, res) => {
  const id = Number(req.params.id);

  const { newQuantity } = req.body;

  const token = req.headers.authorization || "";

  try {
    const user = await getUserFromToken(token);
    //@ts-ignore
    const matchedOrder = user.orders.find((order) => order.id === id);
    //@ts-ignore
    if (user && matchedOrder) {
      const order = await prisma.order.update({
        where: { id: id },
        data: { quantity: newQuantity },
      });
      const user = await getUserFromToken(token);
      res.send(user);
    } else {
      throw Error("Boom");
    }
  } catch (err) {
    //@ts-ignore
    res.send({ error: err.message });
  }
});
app.delete("/orders/:id", async (req, res) => {
  const id = Number(req.params.id);
  const token = req.headers.authorization || "";
  try {
    const user = await getUserFromToken(token);
    //@ts-ignore
    const matchedOrder = user.orders.find((order) => order.id === id);

    if (user && matchedOrder) {
      const order = await prisma.order.findUnique({ where: { id } });

      if (order) {
        await prisma.order.delete({ where: { id } });
        const user = await getUserFromToken(token);
        res.send(user);
      } else {
        res.status(404).send({ error: "Order not found." });
      }
    }
  } catch (err) {
    // @ts-ignore
    res.status(400).send({ err: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server up and running: http://localhost:${PORT}`);
});
