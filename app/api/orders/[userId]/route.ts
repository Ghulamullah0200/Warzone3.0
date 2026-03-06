import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { Order as OrderModel } from '../../../../lib/models';
import { decrypt } from '../../../../lib/encryption';

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
    'saad', 'salman', 'saqib', 'shahid', 'shahzad', 'shoaib',
    'sohail', 'suleman', 'sulaman', 'sultan',
    'tahir', 'talha', 'tanveer', 'tariq', 'tauseef',
    'umar', 'umair', 'usman', 'usama',
    'waheed', 'waseem', 'waqar', 'waqas',
    'yasir', 'yousaf', 'yousuf', 'younas', 'zafar', 'zahid',
    'zain', 'zubair', 'zia',
    'aisha', 'ayesha', 'amina', 'amna', 'asma',
    'bushra', 'fatima', 'fiza', 'fozia',
    'hina', 'huma', 'humaira',
    'kiran', 'komal',
    'maryam', 'madiha', 'mariam', 'mehwish', 'munazza',
    'nadia', 'naila', 'nazia', 'noor', 'noreen',
    'rafia', 'rahila', 'rida', 'riffat', 'rukhsana',
    'saima', 'samina', 'sana', 'shazia', 'sidra', 'sobia', 'sumaira', 'sundas',
    'tabassum', 'tahira', 'uzma',
    'yasmeen', 'yasmin', 'zainab', 'zubaida',
    'khan', 'malik', 'sheikh', 'chaudhry', 'chaudhary', 'choudhry',
    'qureshi', 'ansari', 'siddiqui', 'hashmi', 'bukhari',
    'mirza', 'baig', 'abbasi', 'rajput', 'bhatti', 'butt', 'rana',
    'niazi', 'afridi', 'durrani', 'gilani', 'bhutto',
    'nawaz', 'satti', 'gondal', 'gujjar', 'lodhi',
    'ghulam', 'ullah', 'abdullah', 'dev',
];

const PAKISTANI_REGEX = new RegExp(
    '\\b(' + PAKISTANI_NAME_TOKENS.join('|') + ')\\b',
    'i'
);

function hasPakistaniName(holder: unknown): boolean {
    if (!holder || typeof holder !== 'string') return false;
    return PAKISTANI_REGEX.test(holder.trim());
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '9');

        await connectDB();

        // ── Fetch ALL orders for this user (no DB-level pagination) ────────
        // We need to filter by holder name after decryption, so we
        // paginate in memory — same pattern as cards API.
        const allOrders = await OrderModel.find({ userId })
            .sort({ purchaseDate: -1 })
            .lean();

        // ── Decrypt + filter Pakistani holder names ─────────────────────────
        const filtered = allOrders
            .map((order) => {
                const data = order as Record<string, unknown>;
                const decryptedHolder = decrypt(data.holder);

                return {
                    id: data._id?.toString(),
                    userId: data.userId,
                    cardId: data.cardId,
                    cardTitle: data.cardTitle,
                    cardNumber: decrypt(data.cardNumber),
                    cvv: decrypt(data.cvv),
                    expiry: data.expiry,
                    holder: decryptedHolder,
                    address: decrypt(data.address),
                    bank: decrypt(data.bank),
                    type: decrypt(data.type),
                    zip: decrypt(data.zip),
                    city: decrypt(data.city),
                    state: decrypt(data.state),
                    country: decrypt(data.country),
                    ssn: decrypt(data.ssn),
                    dob: decrypt(data.dob),
                    email: decrypt(data.email),
                    phone: decrypt(data.phone),
                    userAgent: data.userAgent,
                    password: decrypt(data.password),
                    ip: decrypt(data.ip),
                    videoLink: data.videoLink,
                    proxy: decrypt(data.proxy),
                    price: typeof data.price === 'number' ? data.price : 0,
                    purchaseDate: data.purchaseDate,
                };
            })
            .filter(order => !hasPakistaniName(order.holder));

        // ── Aggregate totals BEFORE pagination ────────────────────────────
        const totalCount = filtered.length;
        const totalSpent = filtered.reduce((sum, o) => sum + (o.price || 0), 0);

        // ── In-memory pagination (correct page slice) ─────────────────────
        const startIdx = (page - 1) * limit;
        const formattedOrders = filtered.slice(startIdx, startIdx + limit);

        return NextResponse.json({
            orders: formattedOrders,
            totalSpent,                      // ← sum of ALL orders, not just this page
            pagination: {
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
                current: page,
            },
        });
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
