// backend/src/controller/contactController.js
import nodemailer from "nodemailer";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // ✅ Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // sender email from .env
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    // ✅ Email content
    const mailOptions = {
      from: `"Little Coders Contact Form" <${process.env.EMAIL_USER}>`,
      to: "jessamariesanchez9@gmail.com", // ✅ your receiving email
      subject: `New Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Contact Message from Little Coders Website</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background:#f2f2f2;padding:10px;border-radius:5px;">${message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
};
