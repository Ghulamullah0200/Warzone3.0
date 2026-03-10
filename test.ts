import 'dotenv/config';
import { connectDB } from './lib/db';
import { Card } from './lib/models';
import { decryptCardData } from './lib/encryption';
async function test() {
    await connectDB();
    const st = Date.now();
    const cards = await Card.find({}).sort({ forSale: -1, createdAt: -1 });
    console.log('Fetched in', Date.now() - st, 'ms');

    const dst = Date.now();
    const decryptedCards = cards.map(card => {
        const cardObj = card.toObject();
        const decrypted = decryptCardData(cardObj);
        return {
            ...decrypted,
            id: card._id.toString(),
            _id: card._id.toString()
        };
    });
    console.log('Decrypted in', Date.now() - dst, 'ms. Total cards:', decryptedCards.length);
    process.exit(0);
}
test();
