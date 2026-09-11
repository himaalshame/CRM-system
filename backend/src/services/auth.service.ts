import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

type LoginData = {
    email: string;
    password: string;
};

export const login = async (data: LoginData) => {
    // 1. Find user by email
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    // 2. Check user exists
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    // 3. Check user is active
    if (!user.isActive) {
        throw new AppError("Account is inactive", 403);
    }

    // 4. Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(
        data.password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    // 5. Create JWT
    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "1d",
        }
    );

    // 6. Return safe user data + token
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };
};


type RegisterData = {
    fname: string;
    lname: string;
    email: string;
    phone: string;
    password: string;
};

export const register = async (data: RegisterData) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    if (existingUser) {
        throw new AppError("Email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: data.email,
                passwordHash,
                role: "CLIENT",
            },
        });

        const client = await tx.client.create({
            data: {
                userId: user.id,
                fname: data.fname,
                lname: data.lname,
                phone: data.phone,
            },
        });

        return {
            message: "Account created successfully",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            client,
        };
    });
};