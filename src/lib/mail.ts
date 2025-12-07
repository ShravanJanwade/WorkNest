import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMfaEmail = async (email: string, code: string) => {
  await resend.emails.send({
    from: "WorkNest <onboarding@resend.dev>",
    to: email,
    subject: "Your Login Authentication Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4F46E5; margin: 0;">WorkNest</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; text-align: center;">
          <h2 style="color: #1f2937; margin-top: 0;">Two-Factor Authentication</h2>
          <p style="color: #6b7280; font-size: 16px;">
            Please enter the following verification code to complete your login.
          </p>
          <div style="margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; background: #fff; padding: 10px 20px; border-radius: 4px; border: 1px solid #d1d5db;">
              ${code}
            </span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This code will expire in 10 minutes. If you didn't attempt to login, please secure your account immediately.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          &copy; ${new Date().getFullYear()} WorkNest. All rights reserved.
        </div>
      </div>
    `,
  });
};

export const sendVerificationEmail = async (email: string, token: string, userId: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email-confirm?userId=${userId}&secret=${token}`;

  await resend.emails.send({
    from: "WorkNest <onboarding@resend.dev>",
    to: email,
    subject: "Verify your email address",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4F46E5; margin: 0;">WorkNest</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; text-align: center;">
        <h2 style="color: #1f2937; margin-top: 0;">Verify your email</h2>
        <p style="color: #6b7280; font-size: 16px;">
            Thanks for starting your workspace journey. Please verify your email to unlock all features.
        </p>
        <div style="margin: 30px 0;">
            <a href="${confirmLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Verify Email Address
            </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
        </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        &copy; ${new Date().getFullYear()} WorkNest. All rights reserved.
        </div>
    </div>
    `,
  });
};
