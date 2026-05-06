import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import { randomUUID } from "crypto";

async function createUser() {
  const email = "chidiadinmeribe@yahoo.com";
  const plainPassword = "Nnamdi750";

  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "#Nnamdi750",
    database: "campaign_db",
  });

  // hash password
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // generate UUID for id
  const id = randomUUID();

  // user data
  const fullName = "Chidiadi Nmeribe";
  const isAdmin = true; // 👈 set admin here

  // insert user
  await db.query(
    `INSERT INTO users (id, email, password, full_name, is_admin)
     VALUES (?, ?, ?, ?, ?)`,
    [id, email, hashedPassword, fullName, isAdmin]
  );

  console.log("Admin user created successfully");
}

createUser();