import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({ log: ["query", "error", "warn", "info"] });

const users = [
  {
    name: "Besim",
    email: "besim@gmail.com",
    password: bcrypt.hashSync("besim"),
  },
  {
    name: "Nicolas",
    email: "nicolas@gmail.com",
    password: bcrypt.hashSync("nicolas"),
  },
  {
    name: "Ed",
    email: "ed@gmail.com",
    password: bcrypt.hashSync("ed"),
  },
  {
    name: "Arita",
    email: "arita@gmail.com",
    password: bcrypt.hashSync("arita"),
  },
];

const items = [
  {
    title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
    price: 109.95,
  },
  {
    title: "Mens Casual Premium Slim Fit T-Shirts",
    image:
      "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    price: 22.3,
  },
  {
    title: "Mens Cotton Jacket",
    image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
    price: 55.99,
  },
  {
    title: "Mens Casual Slim Fit",
    image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
    price: 15.99,
  },
  {
    title:
      "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
    image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
    price: 69.5,
  },
];

const orders = [
  {
    user: { connect: { email: "besim@gmail.com" } },
    item: {
      connect: {
        title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
      },
    },
    quantity: 2,
  },
  {
    user: { connect: { email: "arita@gmail.com" } },
    item: {
      connect: {
        title: `John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet`,
      },
    },
    quantity: 2,
  },
  {
    user: { connect: { email: "ed@gmail.com" } },
    item: { connect: { title: "Mens Casual Premium Slim Fit T-Shirts" } },
    quantity: 3,
  },
  {
    user: { connect: { email: "besim@gmail.com" } },
    item: { connect: { title: "Mens Casual Slim Fit" } },
    quantity: 4,
  },
];
async function createStuff() {
  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  for (const item of items) {
    await prisma.item.create({ data: item });
  }
  for (const order of orders) {
    await prisma.order.create({ data: order });
  }
}
createStuff();
