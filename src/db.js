const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: true,
  },
});

const conectar = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Conexión exitosa a la base de datos");
    client.release();
  } catch (error) {
    console.error("❌ Error de conexión:", error);
  }
};

if (require.main === module) {
  conectar();
}

module.exports = pool;
