import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address (e.g. name@university.com)"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name cannot exceed 80 characters"),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
    phone: z
      .string()
      .trim()
      .min(6, "Valid contact number is required (minimum 6 digits)")
      .regex(/^\d+$/, "Contact number must contain digits only"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const contactInquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().min(7, "Please enter a valid phone or WhatsApp number"),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters long"),
});

export type ContactInquiryFormValues = z.infer<typeof contactInquirySchema>;

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  contactNumber: z.string().trim().min(6, "Contact number must be at least 6 digits"),
  address: z.string().trim().optional(),
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

export const applicationWizardSchema = z.object({
  programId: z.string().min(1, "Please select an academic program"),
  intake: z.string().min(2, "Please select your preferred intake session"),
  fundingSource: z.string().min(2, "Please specify your funding source"),
  previousQualification: z.string().min(2, "Please enter your highest qualification"),
  cgpaOrScore: z.string().min(1, "Please enter your CGPA or grade percentage"),
  englishProficiency: z.string().min(1, "Please select your English proficiency status"),
  statementNotes: z.string().optional(),
});

export type ApplicationWizardFormValues = z.infer<typeof applicationWizardSchema>;

