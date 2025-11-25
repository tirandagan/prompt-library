import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
    process.env.SESSION_SECRET || 'default-secret-change-me-in-production-min-32-chars'
);

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${process.env.SESSION_DURATION_HOURS || 96}h`)
        .sign(secret);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}
