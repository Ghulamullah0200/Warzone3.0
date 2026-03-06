import crypto from 'crypto';
import type { Card } from '../types';

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'warzone-monster-secret-key-32ch'; // Must be 32 characters
const IV_LENGTH = 16; // For AES, this is always 16

// Ensure key is exactly 32 bytes
const getEncryptionKey = () => {
    const key = ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32);
    return Buffer.from(key);
};

/**
 * Encrypt sensitive text data
 */
export function encrypt(text: string): string {
    if (!text) return '';

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted data (separated by :)
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive text data
 */
export function decrypt(text: unknown): string {
    if (!text || typeof text !== 'string') return '';

    try {
        const parts = text.split(':');
        // Check if we have at least 2 parts (IV and encrypted text) and the IV is the correct length for hex (32 chars = 16 bytes)
        if (parts.length < 2 || parts[0].length !== 32) {
            return text;
        }

        const iv = Buffer.from(parts[0], 'hex');
        if (iv.length !== 16) {
            return text;
        }

        const encryptedText = parts[1];
        const decipher = crypto.createDecipheriv('aes-256-cbc', getEncryptionKey(), iv);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch {
        return typeof text === 'string' ? text : '';
    }
}

/**
 * Hash password (one-way, cannot be decrypted)
 */
export function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Encrypt card data before saving to database
 */
export function encryptCardData(cardData: Partial<Card>) {
    return {
        ...cardData,
        cardNumber: cardData.cardNumber ? encrypt(cardData.cardNumber) : '',
        cvv: cardData.cvv ? encrypt(cardData.cvv) : undefined,
        holder: cardData.holder ? encrypt(cardData.holder) : undefined,
        address: cardData.address ? encrypt(cardData.address) : undefined,
        ssn: cardData.ssn ? encrypt(cardData.ssn) : undefined,
        dob: cardData.dob ? encrypt(cardData.dob) : undefined,
        email: cardData.email ? encrypt(cardData.email) : undefined,
        phone: cardData.phone ? encrypt(cardData.phone) : undefined,
        password: cardData.password ? encrypt(cardData.password) : undefined,
        ip: cardData.ip ? encrypt(cardData.ip) : undefined,
        proxy: cardData.proxy ? encrypt(cardData.proxy) : undefined,
        zip: cardData.zip ? encrypt(cardData.zip) : undefined,
        city: cardData.city ? encrypt(cardData.city) : undefined,
        state: cardData.state ? encrypt(cardData.state) : undefined,
        country: cardData.country ? encrypt(cardData.country) : undefined,
        bank: cardData.bank ? encrypt(cardData.bank) : undefined,
        type: cardData.type ? encrypt(cardData.type) : undefined,
    };
}


/**
 * Decrypt card data after fetching from database
 */
export function decryptCardData(cardData: Record<string, unknown> & { toObject?: () => Record<string, unknown> }): Partial<Card> {
    const data = cardData.toObject ? cardData.toObject() : cardData;
    return {
        ...data,
        cardNumber: data.cardNumber ? decrypt(data.cardNumber) : '',
        cvv: data.cvv ? decrypt(data.cvv) : undefined,
        holder: data.holder ? decrypt(data.holder) : undefined,
        address: data.address ? decrypt(data.address) : undefined,
        ssn: data.ssn ? decrypt(data.ssn) : undefined,
        dob: data.dob ? decrypt(data.dob) : undefined,
        email: data.email ? decrypt(data.email) : undefined,
        phone: data.phone ? decrypt(data.phone) : undefined,
        password: data.password ? decrypt(data.password) : undefined,
        ip: data.ip ? decrypt(data.ip) : undefined,
        proxy: data.proxy ? decrypt(data.proxy) : undefined,
        zip: data.zip ? decrypt(data.zip) : undefined,
        city: data.city ? decrypt(data.city) : undefined,
        state: data.state ? decrypt(data.state) : undefined,
        country: data.country ? decrypt(data.country) : undefined,
        bank: data.bank ? decrypt(data.bank) : undefined,
        type: data.type ? decrypt(data.type) : undefined,
    };
}

/**
 * Encrypt proxy data before saving to database
 */
export function encryptProxyData(proxyData: Record<string, unknown> & { host?: string, port?: string, username?: string, password?: string, pdfUrl?: string }) {
    return {
        ...proxyData,
        host: proxyData.host ? encrypt(proxyData.host) : '',
        port: proxyData.port ? encrypt(proxyData.port) : '',
        username: proxyData.username ? encrypt(proxyData.username) : '',
        password: proxyData.password ? encrypt(proxyData.password) : '',
    };
}

/**
 * Decrypt proxy data after fetching from database
 */
export function decryptProxyData(proxyData: Record<string, unknown> & { toObject?: () => Record<string, unknown>, host?: string, port?: string, username?: string, password?: string, pdfUrl?: string }) {
    const data = proxyData.toObject ? proxyData.toObject() : proxyData;
    return {
        ...data,
        host: data.host ? decrypt(data.host) : '',
        port: data.port ? decrypt(data.port) : '',
        username: data.username ? decrypt(data.username) : '',
        password: data.password ? decrypt(data.password) : '',
    };
}
