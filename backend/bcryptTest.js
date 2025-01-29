const bcrypt = require('bcryptjs');

const inputPassword = "Seguro123";
const storedHash = "$2a$10$rinw6avC0jLD3u16YzNdz.oMjCHON3MkpjCDg4o8CueYYeBa4A.k2"; // Hash de la base de datos

(async () => {
  try {
    const isMatch = await bcrypt.compare(inputPassword, storedHash);
    console.log("Resultado de comparación de contraseña:", {
      inputPassword,
      storedHash,
      isMatch,
    });
  } catch (error) {
    console.error("Error al comparar contraseñas:", error.message);
  }
})();
