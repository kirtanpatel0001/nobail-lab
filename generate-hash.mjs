import { scryptSync, randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const password = "nobillab@$#123@$#";

// Generate a random 16-byte salt
const salt = randomBytes(16).toString("hex");

// Generate a 64-byte derived key
const derivedKey = scryptSync(password, salt, 64).toString("hex");

// The format we expect in the .env.local file
const hashStr = `${salt}:${derivedKey}`;

const envPath = path.join(__dirname, ".env.local");
let envContent = fs.readFileSync(envPath, "utf-8");

envContent = envContent.replace(
  "ADMIN_PASSWORD_HASH=placeholder_for_hash",
  `ADMIN_PASSWORD_HASH=${hashStr}`
);

fs.writeFileSync(envPath, envContent, "utf-8");

console.log("\n✅ SUCCESS! Your very secure password hash has been generated and automatically saved into your .env.local file!\n");

