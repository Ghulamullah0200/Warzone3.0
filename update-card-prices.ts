import 'dotenv/config';
import { connectDB } from './lib/db';
import { Card } from './lib/models';
import mongoose from 'mongoose';

async function updateCardPrices() {
    try {
        console.log('Connecting to DB...');
        await connectDB();
        console.log('Connected. Fetching cards...');

        const cards = await Card.find({});
        console.log(`Found ${cards.length} cards.`);

        const MIN_PRICE = 5000000;   // 5 million
        const MAX_PRICE = 50000000;  // 50 million

        const bulkOps = cards.map(card => {
            const randomPrice = Math.floor(Math.random() * (MAX_PRICE - MIN_PRICE + 1)) + MIN_PRICE;
            return {
                updateOne: {
                    filter: { _id: card._id },
                    update: { price: randomPrice }
                }
            };
        });

        console.log(`Updating prices for ${bulkOps.length} cards using bulkWrite...`);
        const result = await Card.bulkWrite(bulkOps);
        
        console.log(`Successfully modified ${result.modifiedCount} cards with prices between 5M and 50M.`);
    } catch (error) {
        console.error('Error updating prices:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

updateCardPrices();
