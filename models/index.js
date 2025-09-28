import Sequelize from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.ADMIN_USERNAME,
  process.env.ADMIN_PASSWORD,
  {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    logging: false, // Disable logging for production
    dialectOptions: {
      decimalNumbers: true,
      // Uncomment the following lines if you need to use SSL to connect to your database
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);

async function createDatabase(options) {
  const db = {};
  db.sequelize = options;

  fs.readdirSync(__dirname)
    .filter((file) => file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js")
    .forEach(async (file) => {
      const model = (await import(path.join(__dirname, file))).default(options, Sequelize);
      db[model.name] = model;
    });

  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  return db;
}

const adminDb = createDatabase(sequelize);

export { createDatabase as db, adminDb };
