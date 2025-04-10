import { faker } from "@faker-js/faker";

function generateUser() {
  return {
    username: `TA_${faker.internet
      .displayName()
      .replace(/\s+/g, "_")}_${Date.now()}`,
    password: `A@1${faker.internet.password(10)}`,
  };
}

function getRandomBook() {
  const availableIsbns = [
    "9781449325862",
    "9781449331818",
    "9781449337711",
    "9781491904244",
    "9781491950296",
    "9781593275846",
  ];

  return {
    isbn: availableIsbns[Math.floor(Math.random() * availableIsbns.length)],
  };
}

export { generateUser, getRandomBook };
