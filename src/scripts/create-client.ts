import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";

const createClient = async () => {
    const email = "hima4@example.com";
    const password = "Client123";

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        console.log("User already exists");
        return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const client = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email,
                passwordHash,
                role: "CLIENT",
            },
        });

        return await tx.client.create({
            data: {
                userId: user.id,
                fname: "Test",
                lname: "Client",
                phone: "01000000000",
                address: "Cairo",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                },
            },
        });
    });

    console.log("Client created:", client);
};

createClient()
    .catch((error) => {
        console.error(error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });