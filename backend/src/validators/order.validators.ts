import { z } from "zod";

export const createOrderSchema = z.object({
    clientId: z
        .string()
        .uuid("Invalid client ID")
        .optional(),

    items: z
        .array(
            z.object({
                serviceId: z
                    .string()
                    .uuid("Invalid service ID"),

                quantity: z
                    .number()
                    .int("Quantity must be an integer")
                    .positive(
                        "Quantity must be greater than 0"
                    ),
            })
        )
        .min(
            1,
            "Order must contain at least one item"
        ),

    startDate: z
        .string()
        .datetime()
        .optional(),

    endDate: z
        .string()
        .datetime()
        .optional(),

    notes: z
        .string()
        .trim()
        .max(500, "Notes cannot exceed 500 characters")
        .optional(),
});


export const updateOrderSchema = z.object({
    status: z
        .enum([
            "PENDING",
            "APPROVED",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED",
        ])
        .optional(),
    items: z
        .array(
            z.object({
                serviceId: z.string().uuid("Invalid service ID"),
                quantity: z
                    .number()
                    .int("Quantity must be an integer")
                    .positive("Quantity must be greater than 0"),
            })
        )
        .min(1, "Order must contain at least one item")
        .optional(),
    startDate: z
        .string()
        .datetime()
        .nullable()
        .optional(),

    endDate: z
        .string()
        .datetime()
        .nullable()
        .optional(),

    notes: z
        .string()
        .trim()
        .max(500, "Notes cannot exceed 500 characters")
        .nullable()
        .optional(),

    paymentStatus: z
        .enum([
            "UNPAID",
            "PARTIALLY_PAID",
            "PAID",
        ])
        .optional(),
});

