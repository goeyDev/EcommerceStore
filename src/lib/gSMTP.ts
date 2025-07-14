import nodemailer from "nodemailer";
import { render } from "@react-email/render";

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_Service,
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  logger: true, //Enable logging
  debug: true, //show debug output
});

export async function sendEmail(options: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  // Use renderAsync and await both renders
  const [html, text] = await Promise.all([
    render(options.react),
    render(options.react, { plainText: true }),
  ]);

  await transporter.sendMail({
    from: `Support <${process.env.SENDER_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html,
    text,
  });
}
