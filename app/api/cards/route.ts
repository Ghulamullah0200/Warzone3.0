import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { Card as CardModel } from '../../../lib/models';
import { decryptCardData } from '../../../lib/encryption';
import type { Card } from '../../../types';

// ── Pakistani / South-Asian name tokens ───────────────────────────────────
const PAKISTANI_NAME_TOKENS = [
    'muhammad', 'mohammed', 'mohammad', 'muhamad', 'muhammed',
    'ali', 'hassan', 'hussain', 'husain', 'hasan',
    'ahmed', 'ahmad', 'akhtar', 'akbar', 'anwar',
    'asif', 'asad', 'arif', 'arshad', 'awais',
    'bilal', 'babar', 'burhan',
    'dawood', 'danish', 'daniyal',
    'farhan', 'faisal', 'farooq', 'fahad', 'farrukh',
    'ghulam', 'gulzar',
    'hamza', 'haider', 'hanif', 'haroon', 'hashim',
    'ijaz', 'imran', 'irfan', 'ishaq', 'ishtiaq',
    'jahangir', 'jalil', 'jamil', 'javed', 'junaid',
    'kamran', 'kashif', 'khalid', 'khurram', 'khushal',
    'liaqat', 'luqman', 'majid', 'manzoor', 'masood',
    'nabeel', 'nadeem', 'naeem', 'nasir', 'naveed', 'noman',
    'omar', 'osama', 'owais',
    'qaiser', 'qasim',
    'rafiq', 'raheem', 'rahim', 'rashid', 'raza', 'rizwan', 'rehan',
    'saad', 'salman', 'saqib', 'shahid', 'shahzad', 'shan', 'shoaib',
    'sohail', 'suleman', 'sulaman', 'sultan',
    'tahir', 'talha', 'tanveer', 'tariq', 'tauseef', 'touseef',
    'umar', 'umair', 'usman', 'usama',
    'waheed', 'waseem', 'waqar', 'waqas',
    'yasir', 'yousaf', 'yousuf', 'younas', 'zafar', 'zahid',
    'zain', 'zubair', 'zia',
    // Female names
    'aisha', 'ayesha', 'amina', 'amna', 'asma',
    'bushra', 'fatima', 'fiza', 'fozia',
    'hina', 'huma', 'humaira',
    'kiran', 'komal',
    'maryam', 'madiha', 'mariam', 'mehwish', 'munazza',
    'nadia', 'naila', 'nazia', 'noor', 'noreen',
    'rafia', 'rahila', 'rida', 'riffat', 'rukhsana',
    'saima', 'samina', 'sana', 'sarah', 'shazia', 'sidra', 'sobia', 'sumaira', 'sundas',
    'tabassum', 'tahira',
    'ume', 'ummah', 'uzma',
    'yasmeen', 'yasmin', 'zara', 'zainab', 'zubaida',
    // Last names / family names
    'khan', 'malik', 'sheikh', 'chaudhry', 'chaudhary', 'choudhry',
    'qureshi', 'ansari', 'siddiqui', 'siddiqy', 'hashmi', 'bukhari',
    'mirza', 'baig', 'abbasi', 'rajput', 'bhatti', 'butt', 'rana',
    'javed', 'niazi', 'afridi', 'durrani', 'gilani', 'bhutto', 'zardari',
    'nawaz', 'satti', 'gondal', 'gujjar', 'lodhi',
    // Additional from screenshots
    'ullah', 'abdullah', 'dev',
];

const PAKISTANI_REGEX = new RegExp(
    '\\b(' + PAKISTANI_NAME_TOKENS.join('|') + ')\\b',
    'i'
);

function hasPakistaniName(holder: string | undefined): boolean {
    if (!holder) return false;
    return PAKISTANI_REGEX.test(holder.trim());
}

const maskCardNumber = (num: string) => {
    if (!num) return 'XXXX XXXX XXXX XXXX';
    const clean = num.replace(/\s+/g, '');
    const bin = clean.slice(0, 6);
    return bin.padEnd(clean.length, '*');
};

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '9');

        // DB-level filter: forSale + exclude Pakistani country
        const baseFilter = {
            forSale: true,
            country: { $not: { $regex: /^pakistan$/i } },
        } as Record<string, unknown>;

        // ── Fetch ALL matching cards from DB (no DB-level skip/limit) ──────
        // We must filter by holder name AFTER decryption, so we can't rely on
        // DB-level pagination — instead we paginate in memory after filtering.
        const allCards = await CardModel.find(baseFilter)
            .sort({ createdAt: -1 })
            .lean();                          // lean() = faster plain objects

        // ── Decrypt, filter Pakistani holder names, deduplicate ────────────
        const seen = new Set<string>();
        const filtered: object[] = [];

        for (const card of allCards) {
            const decrypted = decryptCardData(card as Record<string, unknown>) as Card;

            // 1. Skip Pakistani holder names
            if (hasPakistaniName(decrypted.holder)) continue;

            // 2. Skip duplicate card numbers
            const key = decrypted.cardNumber || String(card._id);
            if (seen.has(key)) continue;
            seen.add(key);

            filtered.push({
                id: String(card._id),
                title: (card as Record<string, unknown>).title,
                price: (card as Record<string, unknown>).price,
                description: (card as Record<string, unknown>).description,
                forSale: (card as Record<string, unknown>).forSale,
                cardNumber: maskCardNumber(decrypted.cardNumber ?? ''),
                expiry: decrypted.expiry,
                bank: decrypted.bank,
                type: decrypted.type,
                zip: decrypted.zip,
                city: decrypted.city,
                state: decrypted.state,
                country: decrypted.country,
                userAgent: (card as Record<string, unknown>).userAgent,
                videoLink: (card as Record<string, unknown>).videoLink,
                proxy: decrypted.proxy,
            });
        }

        // ── In-memory pagination (correct page slice) ──────────────────────
        const totalFiltered = filtered.length;
        const startIdx = (page - 1) * limit;
        const pageCards = filtered.slice(startIdx, startIdx + limit);

        return NextResponse.json({
            cards: pageCards,
            pagination: {
                total: totalFiltered,
                pages: Math.ceil(totalFiltered / limit),
                current: page,
            },
        });
    } catch (error) {
        console.error('Get cards error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
