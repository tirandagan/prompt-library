import { customAlphabet } from 'nanoid';

// Create a custom alphabet for the 6-digit code (numbers only)
const generateNumericCode = customAlphabet('0123456789', 6);

export function generateVerificationCode(): string {
    return generateNumericCode();
}
