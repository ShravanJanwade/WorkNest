import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMfaEmail = async (email: string, code: string) => {
  try {
    const result = await resend.emails.send({
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

    if (result.error) {
      console.error("MFA Email Error:", result.error);
      // Don't throw - just log the error
    } else {
      console.log("MFA email sent successfully to:", email, "- ID:", result.data?.id);
    }

    return result;
  } catch (error) {
    console.error("MFA Email Exception:", error);
    // Don't throw - return null to indicate failure without crashing
    return null;
  }
};

export const sendVerificationEmail = async (email: string, token: string, userId: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email-confirm?userId=${userId}&secret=${token}`;

  try {
    console.log("Sending verification email to:", email);

    const result = await resend.emails.send({
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

    if (result.error) {
      console.error("Verification Email Error:", result.error);
      // Note: onboarding@resend.dev only sends to the Resend account owner's email
      // For production, you need to verify your own domain in Resend
    } else {
      console.log("Verification email sent successfully to:", email, "- ID:", result.data?.id);
    }

    return result;
  } catch (error) {
    console.error("Verification Email Exception:", error);
    // Don't throw - return null to indicate failure without crashing
    return null;
  }
};
