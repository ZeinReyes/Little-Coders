import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Create transporter (uses Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // from your .env
        pass: process.env.EMAIL_PASS, // from your .env
      },
    });

    // Compose mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "jessamariesanchez9@gmail.com", // ✅ Your receiving email
      subject: `📩 New Contact Message from ${name}`,
      text: `
Hey Jessa! You have a new message from your contact form:

Name: ${name}
Email: ${email}

Message:
${message}
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send message. Please try again later." });
  }
});

export default router;
