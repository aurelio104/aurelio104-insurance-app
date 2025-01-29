const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("El envío de correos no está configurado. Verifica las variables de entorno EMAIL_USER y EMAIL_PASS.");
    console.info(`Intento simulado de enviar correo a: ${to} con asunto: ${subject}`);
    console.info(`Mensaje: ${text}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Cambiar si usas otro servicio en el futuro
      auth: {
        user: process.env.EMAIL_USER, // Configura en .env
        pass: process.env.EMAIL_PASS, // Configura en .env
      },
    });

    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a: ${to}`);
    console.log("Información del correo:", info);
  } catch (error) {
    console.error("Error enviando correo:", error.message);
    throw new Error("Error sending email");
  }
};

module.exports = sendEmail;
