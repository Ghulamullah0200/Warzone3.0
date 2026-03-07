/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * seed-1000-luxury-cards.js
 * Inserts 1000 luxury cards with minimum price $200,000 into the marketplace.
 * Cards are automatically set to forSale: true (admin approved).
 *
 * Run with: node scripts/seed-1000-luxury-cards.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');

// ── Encryption (matches lib/encryption.ts) ────────────────────────────────────
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'warzone-monster-secret-key-32ch';
const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

function encrypt(text) {
    if (!text) return '';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function encryptCardData(data) {
    const sensitiveFields = ['cardNumber', 'cvv', 'expiry', 'holder', 'address', 'ssn', 'dob', 'email', 'phone', 'password', 'ip', 'proxy'];
    const result = { ...data };
    for (const field of sensitiveFields) {
        if (result[field]) result[field] = encrypt(result[field]);
    }
    return result;
}

// ── Card Schema ───────────────────────────────────────────────────────────────
const CardSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    price:       { type: Number, required: true },
    description: { type: String, default: '' },
    forSale:     { type: Boolean, default: true },
    cardNumber:  { type: String, required: true },
    cvv: String, expiry: String, holder: String,
    address: String, bank: String, type: String,
    zip: String, city: String, state: String, country: String,
    ssn: String, dob: String, email: String, phone: String,
    userAgent: String, password: String, ip: String,
    videoLink: String, proxy: String,
    createdAt: { type: Date, default: Date.now },
    soldToUsername: String, soldToEmail: String, soldAt: Date,
});

// ── Data pools ────────────────────────────────────────────────────────────────
const firstNames = [
    'James', 'Michael', 'Robert', 'David', 'William', 'Richard', 'Joseph', 'Thomas',
    'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul',
    'Andrew', 'Kenneth', 'Joshua', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald',
    'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric',
    'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel',
    'Christopher', 'Raymond', 'Gregory', 'Frank', 'Alexander', 'Patrick', 'Jack',
    'Dennis', 'Tyler', 'Aaron', 'Henry', 'Arthur', 'Victor', 'Leo', 'Oscar',
    'Emily', 'Emma', 'Olivia', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amanda',
    'Jennifer', 'Jessica', 'Ashley', 'Sarah', 'Stephanie', 'Katherine', 'Rachel',
];

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
    'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
    'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Turner', 'Parker', 'Collins',
    'Stewart', 'Morris', 'Rogers', 'Reed', 'Brooks', 'Kelly', 'Sanders',
];

const streets = [
    'Park Avenue', 'Fifth Avenue', 'Madison Avenue', 'Lexington Avenue', 'Wall Street',
    'Sunset Boulevard', 'Rodeo Drive', 'Beverly Hills Dr', 'Ocean Drive', 'Brickell Ave',
    'Peachtree Road NE', 'Michigan Avenue', 'Lake Shore Drive', 'Magnificent Mile',
    'River Oaks Blvd', 'Greenway Plaza', 'Post Oak Blvd', 'Preston Road',
    'Wilshire Blvd', 'Santa Monica Blvd', 'Mulholland Drive', 'Malibu Colony Rd',
    'Worth Avenue', 'Las Olas Blvd', 'Biscayne Bay Dr', 'Indian Creek Dr',
    'Commonwealth Ave', 'Beacon Street', 'Newbury Street', 'Marlborough St',
];

const cities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'San Francisco',
    'Seattle', 'Boston', 'Denver', 'Atlanta', 'Dallas', 'Las Vegas',
    'Philadelphia', 'Phoenix', 'San Diego', 'Austin', 'Nashville', 'Portland',
    'Charlotte', 'Tampa', 'Minneapolis', 'Detroit', 'Baltimore', 'Scottsdale',
    'Beverly Hills', 'Greenwich', 'Palm Beach', 'Aspen', 'Naples', 'Sarasota',
];

const states = [
    'NY', 'CA', 'IL', 'TX', 'FL', 'CA', 'WA', 'MA', 'CO', 'GA',
    'TX', 'NV', 'PA', 'AZ', 'CA', 'TX', 'TN', 'OR', 'NC', 'FL',
    'MN', 'MI', 'MD', 'AZ', 'CA', 'CT', 'FL', 'CO', 'FL', 'FL',
];

const banks = [
    'CHASE PRIVATE CLIENT', 'BANK OF AMERICA PRIVATE BANK',
    'WELLS FARGO PRIVATE BANKING', 'CITIBANK PRIVATE BANK',
    'GOLDMAN SACHS PRIVATE WEALTH', 'MORGAN STANLEY WEALTH MANAGEMENT',
    'JP MORGAN PRIVATE BANK', 'MERRILL LYNCH PRIVATE BANKING',
    'UBS WEALTH MANAGEMENT', 'CREDIT SUISSE PRIVATE BANKING',
    'HSBC PRIVATE BANKING', 'BARCLAYS PRIVATE BANK',
    'FIRST REPUBLIC BANK', 'SILICON VALLEY BANK PRIVATE',
    'CITY NATIONAL BANK', 'SIGNATURE BANK', 'WESTERN ALLIANCE BANK',
    'NORTHERN TRUST', 'BESSEMER TRUST', 'BROWN BROTHERS HARRIMAN',
];

const cardTypes = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'];

// Luxury tiers — all prices above $200,000
const luxuryTiers = [
    {
        tier: 'ELITE',
        priceMin: 500000, priceMax: 700000,
        limitMin: 1000000, limitMax: 10000000,
        badge: 'ELITE',
    },
    {
        tier: 'PLATINUM ELITE',
        priceMin: 350000, priceMax: 1800000,
        limitMin: 2900000, limitMax: 5500000,
        badge: 'PLATINUM ELITE',
    },
    {
        tier: 'BLACK DIAMOND',
        priceMin: 500000, priceMax: 2300000,
        limitMin: 2700000, limitMax: 5000000,
        badge: 'BLACK DIAMOND',
    },
    {
        tier: 'ULTRA PREMIUM',
        priceMin: 1500000, priceMax: 6000000,
        limitMin: 20000000, limitMax: 70000000,
        badge: 'ULTRA PREMIUM',
    },
    {
        tier: 'INFINITY BLACK',
        priceMin: 6000000, priceMax: 30000000,
        limitMin: 80000000, limitMax: 50000000,
        badge: 'INFINITY BLACK',
    },
];

const emailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'protonmail.com'];
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
];

// ── Helper functions ──────────────────────────────────────────────────────────
function rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCardNumber(type) {
    const prefix = type === 'AMEX' ? '3782' : type === 'DISCOVER' ? '6011' : type === 'MASTERCARD' ? '5412' : '4111';
    const len = type === 'AMEX' ? 15 : 16;
    let num = prefix;
    while (num.length < len) num += Math.floor(Math.random() * 10);
    return num;
}

function generateSSN() {
    return `${randInt(100, 999)}-${randInt(10, 99)}-${randInt(1000, 9999)}`;
}

function generateDOB() {
    const year = randInt(1955, 1990);
    const month = String(randInt(1, 12)).padStart(2, '0');
    const day   = String(randInt(1, 28)).padStart(2, '0');
    return `${month}/${day}/${year}`;
}

function generateExpiry() {
    const month = String(randInt(1, 12)).padStart(2, '0');
    const year  = randInt(2026, 2032);
    return `${month}/${year}`;
}

function generateIP() {
    return `${randInt(1, 254)}.${randInt(1, 254)}.${randInt(1, 254)}.${randInt(1, 254)}`;
}

function generateEmail(firstName, lastName) {
    const patterns = [
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}${lastName.toLowerCase()}${randInt(1, 99)}`,
        `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}${randInt(100, 999)}`,
    ];
    return `${rand(patterns)}@${rand(emailDomains)}`;
}

function generateLuxuryDescription(tier, cardType, bank, creditLimit) {
    const descriptions = [
        `${tier.tier} tier ${cardType} card issued by ${bank}. Credit limit: $${creditLimit.toLocaleString()}. Verified US high-net-worth individual. Full identity package included: government-issued DOB, SSN, billing address, verified email, direct phone line. Never flagged — premium fresh drop with complete account access.`,
        `High-value ${cardType} ${tier.tier} card from ${bank}. Available credit: $${creditLimit.toLocaleString()}. Premium verified US cardholder with full dox: SSN, DOB, residential address, personal email and phone. Clean history — zero fraud flags. Ideal for large transactions.`,
        `Exclusive ${bank} ${tier.tier} ${cardType}. Credit ceiling: $${creditLimit.toLocaleString()}. Comes with complete identity verification package — SSN, DOB, address, phone, email. 100% authentic US cardholder data. Fresh and unused — guaranteed clean.`,
        `Ultra-premium ${tier.tier} ${cardType} from ${bank}. Spending limit: $${creditLimit.toLocaleString()}. Full info package: verified SSN, DOB, US billing address, working email & phone. Card is active and in good standing. Premium tier — serious buyers only.`,
        `${bank} ${tier.tier} class ${cardType}. Maximum credit: $${creditLimit.toLocaleString()}. Bundled with complete owner info: SSN verified, DOB, full address history, primary email, mobile number. Zero previous disputes. Elite status — ready to use immediately.`,
    ];
    return rand(descriptions);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ MongoDB connected');

    const CardModel = mongoose.models.Card || mongoose.model('Card', CardSchema);

    const TOTAL_CARDS  = 2000;
    const BATCH_SIZE   = 100;
    let totalInserted  = 0;

    console.log(`\n🚀 Starting insertion of ${TOTAL_CARDS} luxury cards (min price: $200,000)...\n`);

    const cardsBuffer = [];

    for (let i = 0; i < TOTAL_CARDS; i++) {
        const firstName   = rand(firstNames);
        const lastName    = rand(lastNames);
        const fullName    = `${firstName} ${lastName}`;
        const cardType    = rand(cardTypes);
        const bank        = rand(banks);
        const tier        = rand(luxuryTiers);
        const cardNumber  = generateCardNumber(cardType);
        const price       = randInt(tier.priceMin, tier.priceMax);
        const creditLimit = randInt(tier.limitMin, tier.limitMax);
        const cityIndex   = randInt(0, cities.length - 1);
        const city        = cities[cityIndex];
        const state       = states[cityIndex] || rand(states);
        const zip         = String(randInt(10000, 99999));
        const streetNum   = randInt(100, 9999);
        const street      = rand(streets);

        const rawCard = {
            title:       `${cardType} ${tier.tier} — ${bank}`,
            price,
            description: generateLuxuryDescription(tier, cardType, bank, creditLimit),
            forSale:     true,          // Admin approved — visible on marketplace
            cardNumber,
            cvv:         String(cardType === 'AMEX' ? randInt(1000, 9999) : randInt(100, 999)),
            expiry:      generateExpiry(),
            holder:      fullName,
            address:     `${streetNum} ${street}`,
            bank,
            type:        cardType,
            zip,
            city,
            state,
            country:     'US',
            ssn:         generateSSN(),
            dob:         generateDOB(),
            email:       generateEmail(firstName, lastName),
            phone:       `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
            userAgent:   rand(userAgents),
            password:    `${firstName}${randInt(1000, 99999)}@#!`,
            ip:          generateIP(),
        };

        cardsBuffer.push(encryptCardData(rawCard));

        // Insert in batches
        if (cardsBuffer.length >= BATCH_SIZE || i === TOTAL_CARDS - 1) {
            const batch = await CardModel.insertMany(cardsBuffer.splice(0));
            totalInserted += batch.length;
            const pct = Math.round((totalInserted / TOTAL_CARDS) * 100);
            process.stdout.write(`\r   Progress: ${totalInserted}/${TOTAL_CARDS} (${pct}%)   `);
        }
    }

    console.log(`\n\n✅ Successfully inserted ${totalInserted} luxury cards into the marketplace!`);
    console.log(`   • All cards are set to forSale: true (visible & admin-approved)`);
    console.log(`   • Price range: $200,000 — $2,000,000`);
    console.log(`   • Tiers: ELITE, PLATINUM ELITE, BLACK DIAMOND, ULTRA PREMIUM, INFINITY BLACK`);
    console.log(`\n🎉 Done! Open the marketplace to see all ${totalInserted} luxury cards.\n`);

    await mongoose.disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
});
