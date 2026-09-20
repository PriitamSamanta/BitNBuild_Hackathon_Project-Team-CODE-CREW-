interface TokenPayload {
    userId: string;
    role: string;
}
export declare const generateToken: (payload: TokenPayload) => string;
export declare const verifyToken: (token: string) => TokenPayload;
export {};
//# sourceMappingURL=jwt.d.ts.map