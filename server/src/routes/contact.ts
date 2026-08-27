import { Router, Request, Response } from "express";
import { Resend } from "resend";
import type { ContactFormSubmission, ApiResponse } from "../types/index.js";

const router = Router();

const ADMIN_EMAIL = "rsd@alphaexplora.com";

router.post("/contact", async (req: Request, res: Response): Promise<void> => {
  try {
    // Initialize Resend when request comes in (after env vars are loaded)
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { firstName, lastName, email, phone, message } =
      req.body as ContactFormSubmission;

    // Validation
    if (!firstName || !lastName || !email || !phone || !message) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
        error: "Missing required fields",
      } as ApiResponse);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format",
        error: "Please provide a valid email address",
      } as ApiResponse);
      return;
    }

    // Send admin notification email
    const adminEmailResult = await resend.emails.send({
      from: "onboarding@resend.dev", // Use your verified domain email
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `New Consultation Request from ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Consultation Request</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background-color: #fff; padding: 15px; border-left: 4px solid #4C3E39;">
              ${message}
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from your website contact form.
          </p>
        </div>
      `,
    });

    if (adminEmailResult.error) {
      throw new Error(`Failed to send admin email: ${adminEmailResult.error.message}`);
    }

    // Send confirmation email to user
    const userEmailResult = await resend.emails.send({
      from: "onboarding@resend.dev", // Use your verified domain email
      to: email,
      subject: "We Received Your Consultation Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank You, ${firstName}!</h2>
          <p>We've received your consultation request and appreciate your interest. Our team will review your message and get back to you shortly.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>We have your details:</strong></p>
            <p>Name: ${firstName} ${lastName}<br/>
            Email: ${email}<br/>
            Phone: ${phone}</p>
          </div>

          <p style="color: #666; font-size: 14px;">
            If you have any additional questions, feel free to reply to this email or contact us directly.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            &copy; Alpha Explora. All rights reserved.
          </p>
        </div>
      `,
    });

    if (userEmailResult.error) {
      throw new Error(`Failed to send user email: ${userEmailResult.error.message}`);
    }

    res.status(200).json({
      success: true,
      message: "Consultation request sent successfully",
      data: {
        requestId: adminEmailResult.data?.id || "email-sent",
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Contact form error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    res.status(500).json({
      success: false,
      message: "Failed to process your request",
      error: errorMessage,
    } as ApiResponse);
  }
});

export default router;
