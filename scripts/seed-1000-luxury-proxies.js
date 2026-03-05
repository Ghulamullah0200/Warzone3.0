/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * seed-1000-luxury-proxies.js
 * Inserts 1000 luxury proxy nodes with minimum price $100,000 into the marketplace.
 * Proxies are automatically set to forSale: true (admin approved & visible).
 *
 * Run with: node scripts/seed-1000-luxury-proxies.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const crypto   = require('crypto');

// ── Proxy Schema (matches lib/models.ts) ─────────────────────────────────────
const ProxySchema = new mongoose.Schema({
    title:          { type: String, required: true },
    price:          { type: Number, required: true },
    description:    { type: String, default: '' },
    forSale:        { type: Boolean, default: true },
    host:           { type: String, required: true },
    port:           { type: String, required: true },
    username:       { type: String, default: '' },
    password:       { type: String, default: '' },
    type:           { type: String, default: 'SOCKS5' },
    country:        { type: String, required: true },
    state:          { type: String, default: '' },
    city:           { type: String, default: '' },
    createdAt:      { type: Date, default: Date.now },
    soldToUsername: String,
    soldToEmail:    String,
    soldAt:         Date,
    pdfUrl:         String,
});

// ── Data Pools ────────────────────────────────────────────────────────────────

const proxyTypes = ['SOCKS5', 'SOCKS4', 'HTTP', 'HTTPS', 'SOCKS5 RESIDENTIAL', 'HTTPS ROTATING'];

// US States with cities
const usLocations = [
    { state: 'New York',       stateCode: 'NY', cities: ['New York City', 'Buffalo', 'Albany', 'Rochester', 'Yonkers'] },
    { state: 'California',     stateCode: 'CA', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'San Jose'] },
    { state: 'Texas',          stateCode: 'TX', cities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'] },
    { state: 'Florida',        stateCode: 'FL', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'] },
    { state: 'Illinois',       stateCode: 'IL', cities: ['Chicago', 'Springfield', 'Naperville', 'Rockford', 'Evanston'] },
    { state: 'Washington',     stateCode: 'WA', cities: ['Seattle', 'Spokane', 'Tacoma', 'Bellevue', 'Kirkland'] },
    { state: 'Georgia',        stateCode: 'GA', cities: ['Atlanta', 'Savannah', 'Augusta', 'Columbus', 'Macon'] },
    { state: 'Colorado',       stateCode: 'CO', cities: ['Denver', 'Colorado Springs', 'Aurora', 'Boulder', 'Aspen'] },
    { state: 'Nevada',         stateCode: 'NV', cities: ['Las Vegas', 'Reno', 'Henderson', 'North Las Vegas', 'Carson City'] },
    { state: 'Arizona',        stateCode: 'AZ', cities: ['Phoenix', 'Scottsdale', 'Tucson', 'Tempe', 'Mesa'] },
    { state: 'Massachusetts',  stateCode: 'MA', cities: ['Boston', 'Cambridge', 'Worcester', 'Springfield', 'Newton'] },
    { state: 'Pennsylvania',   stateCode: 'PA', cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading'] },
    { state: 'Ohio',           stateCode: 'OH', cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'] },
    { state: 'Michigan',       stateCode: 'MI', cities: ['Detroit', 'Grand Rapids', 'Warren', 'Ann Arbor', 'Lansing'] },
    { state: 'North Carolina', stateCode: 'NC', cities: ['Charlotte', 'Raleigh', 'Durham', 'Greensboro', 'Winston-Salem'] },
    { state: 'Virginia',       stateCode: 'VA', cities: ['Virginia Beach', 'Norfolk', 'Arlington', 'Richmond', 'Alexandria'] },
    { state: 'Oregon',         stateCode: 'OR', cities: ['Portland', 'Eugene', 'Salem', 'Bend', 'Gresham'] },
    { state: 'Tennessee',      stateCode: 'TN', cities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'] },
    { state: 'Minnesota',      stateCode: 'MN', cities: ['Minneapolis', 'Saint Paul', 'Duluth', 'Rochester', 'Bloomington'] },
    { state: 'Maryland',       stateCode: 'MD', cities: ['Baltimore', 'Columbia', 'Rockville', 'Gaithersburg', 'Annapolis'] },
];

// Luxury proxy tiers — all prices above $100,000
const luxuryTiers = [
    {
        tier:     'PREMIUM RESIDENTIAL',
        priceMin: 100000,
        priceMax: 200000,
        speedMin: 500,
        speedMax: 1000,
        uptime:   '99.5%',
        badge:    'PREMIUM',
    },
    {
        tier:     'ELITE DATACENTER',
        priceMin: 200000,
        priceMax: 350000,
        speedMin: 1000,
        speedMax: 5000,
        uptime:   '99.8%',
        badge:    'ELITE',
    },
    {
        tier:     'ULTRA RESIDENTIAL',
        priceMin: 350000,
        priceMax: 500000,
        speedMin: 5000,
        speedMax: 10000,
        uptime:   '99.9%',
        badge:    'ULTRA',
    },
    {
        tier:     'BLACK OPS DEDICATED',
        priceMin: 500000,
        priceMax: 800000,
        speedMin: 10000,
        speedMax: 25000,
        uptime:   '99.99%',
        badge:    'BLACK OPS',
    },
    {
        tier:     'INFINITY PRIVATE NODE',
        priceMin: 800000,
        priceMax: 1500000,
        speedMin: 25000,
        speedMax: 100000,
        uptime:   '100%',
        badge:    'INFINITY',
    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateHost() {
    // Mix of residential-looking IPs and datacenter IPs
    const styles = [
        // IPv4 residential
        () => `${randInt(24, 240)}.${randInt(1, 254)}.${randInt(1, 254)}.${randInt(1, 254)}`,
        // Subnetted
        () => `10.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`,
        () => `172.${randInt(16, 31)}.${randInt(0, 255)}.${randInt(1, 254)}`,
        // Hostname style
        () => {
            const prefixes = ['proxy', 'node', 'gate', 'relay', 'prx', 'res', 'dc'];
            const tlds     = ['us', 'net', 'io', 'pro'];
            return `${rand(prefixes)}${randInt(1, 999)}.${rand(['vpn', 'socks', 'proxy', 'fast', 'elite'])}.${rand(tlds)}`;
        },
    ];
    return rand(styles)();
}

function generatePort(proxyType) {
    const portMap = {
        'SOCKS5':             [1080, 1085, 9050, 33210, 44000, 55000]  .map(String),
        'SOCKS4':             [1080, 4145, 1085, 37800, 48000]          .map(String),
        'HTTP':               [8080, 3128, 8888, 80, 8123, 8000]        .map(String),
        'HTTPS':              [443, 8443, 443, 8080, 9443]               .map(String),
        'SOCKS5 RESIDENTIAL': [1080, 9090, 22225, 31112, 40000]          .map(String),
        'HTTPS ROTATING':     [443, 8080, 9999, 31234, 10001]            .map(String),
    };
    const pool = portMap[proxyType] || ['1080'];
    return rand(pool);
}

function generateUsername() {
    const words = ['prx', 'user', 'admin', 'root', 'vpn', 'node', 'relay', 'gate', 'net', 'fast'];
    return `${rand(words)}${randInt(100, 99999)}`;
}

function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < randInt(14, 22); i++) {
        pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    return pwd;
}

function generateTitle(tier, location, proxyType) {
    return `${proxyType} ${tier.tier} — ${location.state}, US`;
}

function generateDescription(tier, proxyType, location, city) {
    const speed = randInt(tier.speedMin, tier.speedMax);
    const descs = [
        `${tier.tier} ${proxyType} node located in ${city}, ${location.state}. Speed: ${speed.toLocaleString()} Mbps. Uptime guaranteed: ${tier.uptime}. Private dedicated node — zero shared bandwidth. Full authentication credentials included. Ideal for high-volume operations, financial transactions, and anonymous browsing. Premium US IP with clean history.`,
        `Private ${proxyType} proxy from ${location.state}, US (${city}). Throughput: ${speed.toLocaleString()} Mbps with ${tier.uptime} uptime SLA. ${tier.badge} tier — exclusive access, unthrottled bandwidth. Clean IP reputation. Complete login credentials provided upon purchase. Perfect for enterprise-grade anonymity requirements.`,
        `Ultra-secure ${tier.tier} ${proxyType} based in ${city}, ${location.state}. Transfer speed: ${speed.toLocaleString()} Mbps. Guaranteed uptime: ${tier.uptime}. Fully dedicated — never shared with other buyers. IP never flagged or blacklisted. Premium authentication package: host, port, username & password included.`,
        `${location.state} ${tier.badge} ${proxyType} node (${city}). Lightning-fast ${speed.toLocaleString()} Mbps connection. ${tier.uptime} uptime guarantee. Pristine IP reputation — passes all CAPTCHA and bot detection systems. Dedicated node with exclusive access. Full credentials and technical support included.`,
        `Exclusive ${tier.tier} ${proxyType} from ${city}, ${location.state}. Dedicated bandwidth: ${speed.toLocaleString()} Mbps. Uptime: ${tier.uptime}. Zero-log policy. Clean residential/datacenter IP with no history of abuse. Authentication credentials: host, port, user & pass. Serious buyers only — ${tier.badge} tier access.`,
    ];
    return rand(descs);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ MongoDB connected');

    const ProxyModel = mongoose.models.Proxy || mongoose.model('Proxy', ProxySchema);

    const TOTAL_PROXIES = 1000;
    const BATCH_SIZE    = 50;
    let totalInserted   = 0;

    console.log(`\n🚀 Starting insertion of ${TOTAL_PROXIES} luxury proxy nodes (min price: $100,000)...\n`);

    const buffer = [];

    for (let i = 0; i < TOTAL_PROXIES; i++) {
        const tier      = rand(luxuryTiers);
        const proxyType = rand(proxyTypes);
        const location  = rand(usLocations);
        const city      = rand(location.cities);
        const host      = generateHost();
        const port      = generatePort(proxyType);
        const price     = randInt(tier.priceMin, tier.priceMax);

        const proxyDoc = {
            title:       generateTitle(tier, location, proxyType),
            price,
            description: generateDescription(tier, proxyType, location, city),
            forSale:     true,          // Admin approved — visible on marketplace
            host,
            port,
            username:    generateUsername(),
            password:    generatePassword(),
            type:        proxyType,
            country:     'US',
            state:       location.state,
            city,
            pdfUrl:      '',            // optional PDF, left blank
        };

        buffer.push(proxyDoc);

        // Batch insert
        if (buffer.length >= BATCH_SIZE || i === TOTAL_PROXIES - 1) {
            const batch = await ProxyModel.insertMany(buffer.splice(0));
            totalInserted += batch.length;
            const pct = Math.round((totalInserted / TOTAL_PROXIES) * 100);
            process.stdout.write(`\r   Progress: ${totalInserted}/${TOTAL_PROXIES} (${pct}%)   `);
        }
    }

    console.log(`\n\n✅ Successfully inserted ${totalInserted} luxury proxy nodes into the marketplace!`);
    console.log(`   • All proxies are set to forSale: true (visible & admin-approved)`);
    console.log(`   • Price range: $100,000 — $1,500,000`);
    console.log(`   • Types: SOCKS5, SOCKS4, HTTP, HTTPS, SOCKS5 RESIDENTIAL, HTTPS ROTATING`);
    console.log(`   • Tiers: PREMIUM RESIDENTIAL, ELITE DATACENTER, ULTRA RESIDENTIAL, BLACK OPS DEDICATED, INFINITY PRIVATE NODE`);
    console.log(`   • All locations: US (20 states, 100 cities)`);
    console.log(`\n🎉 Done! Open the marketplace to see all ${totalInserted} luxury proxy nodes.\n`);

    await mongoose.disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
});
