import bcrypt from "bcrypt";

import { prisma } from "../config/prisma";

const createAdmin = async () => {
    const email = "admin@example.com";
    const password = "Admin123";

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        console.log("Admin already exists");
        return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
        data: {
            email,
            passwordHash,
            role: "ADMIN",
        },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
        },
    });

    console.log("Admin created:", admin);
};

createAdmin()
    .catch((error) => {
        console.error(error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });