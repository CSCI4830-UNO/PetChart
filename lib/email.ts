import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generic email sending function
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
}

// Specific email templates
// Appointment reminder email function
export async function sendAppointmentReminder({
  email,
  petName,
  appointmentDate,
  appointmentTime,
  location,
  reason,
}: {
  email: string;
  petName: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  reason: string;
}) {
  const date = new Date(appointmentDate);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Email HTML content
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Upcoming Appointment Reminder</h2>
      <p>Hello,</p>
      <p>This is a reminder that you have an upcoming appointment for <strong>${petName}</strong>.</p>
      
      <div style="background-color: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
      
      <p>Please make sure to arrive a few minutes early. If you need to reschedule or cancel, please do so as soon as possible.</p>
      
      <p>Best regards,<br>PetChart Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Appointment Reminder for ${petName}`,
    html,
  });
}

// Vaccination reminder email function
export async function sendVaccinationReminder({
  email,
  petName,
  vaccine,
  nextDueDate,
}: {
  email: string;
  petName: string;
  vaccine: string;
  nextDueDate: string;
}) {
  const date = new Date(nextDueDate);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Vaccination Reminder</h2>
      <p>Hello,</p>
      <p>This is a reminder that <strong>${petName}</strong> has an upcoming vaccination that is due.</p>
      
      <div style="background-color: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Vaccine:</strong> ${vaccine}</p>
        <p><strong>Due Date:</strong> ${formattedDate}</p>
      </div>
      
      <p>Please schedule an appointment with your veterinarian to keep ${petName}'s vaccinations up to date.</p>
      
      <p>Best regards,<br>PetChart Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Vaccination Reminder for ${petName}`,
    html,
  });
}

// Flea & tick reminder email function
export async function sendFleaTickReminder({
  email,
  petName,
  treatment,
  nextDueDate,
  daysUntilDue,
}: {
  email: string;
  petName: string;
  treatment: string;
  nextDueDate: string;
  daysUntilDue: number;
}) {
  const date = new Date(nextDueDate);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Flea & Tick Treatment Reminder</h2>
      <p>Hello,</p>
      <p>This is a reminder that <strong>${petName}</strong>'s flea & tick treatment is due soon.</p>
      <div style="background-color: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Treatment:</strong> ${treatment}</p>
        <p><strong>Due Date:</strong> ${formattedDate}</p>
        <p><strong>Days Until Due:</strong> ${daysUntilDue > 0 ? daysUntilDue : "Overdue"}</p>
      </div>
      <p>Flea and tick prevention is essential for ${petName}'s health and comfort. Please ensure the treatment is applied on time.</p>
      <p>Best regards,<br>PetChart Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Flea & Tick Treatment Reminder for ${petName}`,
    html,
  });
}