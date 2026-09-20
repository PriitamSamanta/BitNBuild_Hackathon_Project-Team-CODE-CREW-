import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
export const registerUser = async (data) => {
    const existingUser = await User.findOne({
        email: data.email.toLowerCase(),
    });
    if (existingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const userData = {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role || "field_manager",
        ...(data.phone ? { phone: data.phone } : {}),
    };
    const user = await User.create(userData);
    const token = generateToken({
        userId: user._id.toString(),
        role: user.role,
    });
    return {
        token,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};
export const loginUser = async (email, password) => {
    const user = await User.findOne({
        email: email.toLowerCase(),
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    if (!user.isActive) {
        throw new Error("User account is inactive");
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }
    const token = generateToken({
        userId: user._id.toString(),
        role: user.role,
    });
    return {
        token,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};
//# sourceMappingURL=auth.service.js.map