/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { Card } from '../../../../lib/models';
import { encryptCardData } from '../../../../lib/encryption';

// Realistic card data generators
const firstNames = ['James', 'Michael', 'Robert', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Kenneth', 'Joshua', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Raymond', 'Gregory', 'Frank', 'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const streets = ['Oak Street', 'Maple Avenue', 'Cedar Lane', 'Pine Road', 'Elm Drive', 'Sunset Blvd', 'Willow Way', 'Highland Ave', 'Riverside Drive', 'Park Place', 'Broadway', 'Main Street', 'Lake Shore Dr', 'Ocean Drive', 'Mountain View Rd', 'Valley Road', 'Forest Lane', 'Meadow Court', 'Spring Street', 'North Ave'];

const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Nashville', 'Portland'];

const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'CO', 'TN', 'IN', 'MO', 'MD', 'WI'];

const banks = ['CHASE BANK', 'BANK OF AMERICA', 'WELLS FARGO', 'CITIBANK', 'CAPITAL ONE', 'US BANK', 'TRUIST', 'PNC BANK', 'TD BANK', 'REGIONS BANK', 'FIFTH THIRD', 'CITIZENS BANK', 'HUNTINGTON', 'FIRST TECH FCU', 'NAVY FEDERAL'];

const cardTypes = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'];

const cardTiers = [
    { tier: 'CLASSIC', priceMin: 4000, priceMax: 5000, limitMin: 8000, limitMax: 15000 },
    { tier: 'GOLD', priceMin: 5000, priceMax: 6500, limitMin: 15000, limitMax: 30000 },
    { tier: 'PLATINUM', priceMin: 6500, priceMax: 8000, limitMin: 30000, limitMax: 60000 },
    { tier: 'BLACK', priceMin: 8000, priceMax: 10000, limitMin: 60000, limitMax: 150000 },
];

function rand<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCardNumber(type: string): string {
    const prefix = type === 'AMEX' ? '37' : type === 'DISCOVER' ? '6011' : type === 'MASTERCARD' ? '51' : '41';
    const len = type === 'AMEX' ? 15 : 16;
    let num = prefix;
    while (num.length < len) num += Math.floor(Math.random() * 10);
    return num;
}

function generateSSN(): string {
    return `${randInt(100, 999)}-${randInt(10, 99)}-${randInt(1000, 9999)}`;
}

function generateDOB(): string {
    const year = randInt(1955, 1995);
    const month = String(randInt(1, 12)).padStart(2, '0');
    const day = String(randInt(1, 28)).padStart(2, '0');
    return `${month}/${day}/${year}`;
}

function generateExpiry(): string {
    const month = String(randInt(1, 12)).padStart(2, '0');
    const year = randInt(2026, 2030);
    return `${month}/${year}`;
}

function generateIP(): string {
    return `${randInt(1, 254)}.${randInt(1, 254)}.${randInt(1, 254)}.${randInt(1, 254)}`;
}

function generateEmail(firstName: string, lastName: string): string {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com'];
    const patterns = [
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}${lastName.toLowerCase()}${randInt(1, 99)}`,
        `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}${randInt(100, 999)}`,
    ];
    return `${rand(patterns)}@${rand(domains)}`;
}

export async function POST() {
    try {
        await connectDB();

        const cardsToInsert = [];
        const totalCards = 120; // Insert 120 cards total

        for (let i = 0; i < totalCards; i++) {
            const firstName = rand(firstNames);
            const lastName = rand(lastNames);
            const fullName = `${firstName} ${lastName}`;
            const cardType = rand(cardTypes);
            const bank = rand(banks);
            const tier = rand(cardTiers);
            const cardNumber = generateCardNumber(cardType);
            const price = randInt(tier.priceMin, tier.priceMax);
            const creditLimit = randInt(tier.limitMin, tier.limitMax);
            const city = rand(cities);
            const state = states[cities.indexOf(city)] || rand(states);
            const zip = String(randInt(10000, 99999));
            const streetNum = randInt(100, 9999);
            const street = rand(streets);

            const rawCard = {
                title: `${cardType} ${tier.tier} — ${bank}`,
                price,
                description: `${tier.tier} tier ${cardType} card issued by ${bank}. Credit limit: $${creditLimit.toLocaleString()}. Verified US holder. Full info included: DOB, SSN, billing address, email, phone. Fresh drop — not previously used.`,
                forSale: true,
                cardNumber,
                cvv: String(cardType === 'AMEX' ? randInt(1000, 9999) : randInt(100, 999)),
                expiry: generateExpiry(),
                holder: fullName,
                address: `${streetNum} ${street}`,
                bank,
                type: cardType,
                zip,
                city,
                state,
                country: 'US',
                ssn: generateSSN(),
                dob: generateDOB(),
                email: generateEmail(firstName, lastName),
                phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
                userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/${randInt(110, 122)}.0.0.0 Safari/537.36`,
                password: `${firstName}${randInt(100, 9999)}!`,
                ip: generateIP(),
            };

            cardsToInsert.push(encryptCardData(rawCard));
        }

        // Batch insert
        const chunkSize = 50;
        let inserted = 0;
        for (let i = 0; i < cardsToInsert.length; i += chunkSize) {
            const batch = await Card.insertMany(cardsToInsert.slice(i, i + chunkSize));
            inserted += batch.length;
        }

        return NextResponse.json({
            success: true,
            message: `Bulk seeded ${inserted} cards to market.`,
            inserted,
        });
    } catch (error: any) {
        console.error('Bulk seed error:', error);
        return NextResponse.json({ error: 'Seed failed: ' + error.message }, { status: 500 });
    }
}
