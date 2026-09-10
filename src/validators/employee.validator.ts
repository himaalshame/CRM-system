import { z } from "zod";

export const createEmployeeSchema = z.object({
    email: z
        .string()
        .email("Invalid email"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),

    fname: z
        .string()
        .min(2, "First name must be at least 2 characters"),

    lname: z
        .string()
        .min(2, "Last name must be at least 2 characters"),

    phone: z
        .string()
        .min(10, "Phone must be at least 10 characters"),

    jobTitle: z
        .string()
        .min(2, "Job title must be at least 2 characters"),
});