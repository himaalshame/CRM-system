import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .email("Invalid email"),

    password: z
        .string()
        .min(1, "Password is required"),
});


export const registerSchema = z.object({
    fname: z.string().min(2),
    lname: z.string().min(2),
    email: z.email(),
    phone: z.string().min(8),
    password: z.string().min(6),
});