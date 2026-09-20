interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "field_manager";
    phone?: string;
}
export declare const registerUser: (data: RegisterData) => Promise<{
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: import("../models/User.js").UserRole;
    };
}>;
export declare const loginUser: (email: string, password: string) => Promise<{
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: import("../models/User.js").UserRole;
    };
}>;
export {};
//# sourceMappingURL=auth.service.d.ts.map