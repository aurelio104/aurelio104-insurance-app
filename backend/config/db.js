const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Conectar a MongoDB usando la URI del entorno
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Escuchar eventos importantes de la conexión
    mongoose.connection.on("connected", () => {
      console.log("Mongoose successfully connected to the database");
    });

    mongoose.connection.on("error", (err) => {
      console.error(`Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Mongoose connection to the database has been disconnected");
    });
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Terminar el proceso en caso de error crítico
  }
};

// Manejar el cierre de la conexión cuando la aplicación se cierra
const handleAppTermination = async (signal) => {
  try {
    await mongoose.connection.close();
    console.log(`Mongoose connection closed due to application termination (${signal})`);
    process.exit(0);
  } catch (error) {
    console.error(`Error closing Mongoose connection: ${error.message}`);
    process.exit(1);
  }
};

// Escuchar señales de terminación de la aplicación
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => handleAppTermination(signal));
});

module.exports = connectDB;
