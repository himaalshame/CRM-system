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
});


export const updateOrderSchema = z.object({
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

    paymentStatus: z
        .enum([
            "UNPAID",
            "PARTIALLY_PAID",
            "PAID",
        ])
        .optional(),
});

