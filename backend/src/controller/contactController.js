// backend/src/controller/contactController.js
import nodemailer from "nodemailer";

export const sendContactMessage = async (req, res) => {
  try {
    console.log("📨 Received contact form request:", req.body);

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      console.warn("⚠️ Missing fields:", { name, email, message });
      return res.status(400).json({ error: "All fields are required." });
    }

    // ✅ Verify environment variables
    console.log("🔧 Checking environment variables...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✅ Loaded" : "❌ Missing");
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Missing");

    // ✅ Create transporter using Gmail SMTP
    console.log("🚀 Creating Gmail transporter...");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("✅ Transporter created successfully!");

    // ✅ Kid-friendly email template for Little Coders
    const mailOptions = {
      from: `"Little Coders Contact Bot" <${process.env.EMAIL_USER}>`,
      to: "zbcreyes@gmail.com", // your receiving inbox
      subject: `💌 New Message from Little Coder ${name}!`,
      html: `
        <div style="font-family: 'Comic Sans MS', 'Poppins', Arial, sans-serif; background-color: #fdfdfd; padding: 20px; border-radius: 15px; border: 3px dashed #ff80ab;">
          <h2 style="color: #ff6f61; text-align: center;">👩‍💻✨ Little Coders Message!</h2>
          <p style="font-size: 16px;">Hey there, <strong>Little Coders Team</strong>! 🧠💡</p>
          <p style="font-size: 15px;">You just received a message from one of our creative young coders!</p>

          <div style="background: #fff3e0; padding: 15px; border-radius: 10px; margin-top: 15px;">
            <p><strong>🧒 Name:</strong> ${name}</p>
            <p><strong>📧 Email:</strong> ${email}</p>
            <p><strong>💬 Message:</strong></p>
            <p style="background:#ffffff; border-left: 4px solid #ff80ab; padding: 10px; border-radius: 5px;">${message}</p>
          </div>

          <p style="margin-top: 20px; font-size: 13px; color: #777; text-align: center;">
            ✨ Sent from the <strong>Little Coders</strong> website — where coding is fun and creativity shines! 💻🎨
          </p>
        </div>
      `,
    };

    console.log("📦 Email composed. Sending...");
    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email successfully sent from ${email} by ${name}`);
    console.log("📤 Nodemailer response:", info.response);

    return res.status(200).json({ success: true, message: "Message sent successfully!" });

  } catch (error) {
    console.error("❌ Contact form error:", error);
    res.status(500).json({ error: "Failed to send message. Please try again later." });
  }
};
