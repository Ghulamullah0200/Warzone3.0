import 'dotenv/config';
import { connectDB } from './lib/db';
import { Card, Proxy } from './lib/models';
import mongoose from 'mongoose';
import { encryptCardData, encryptProxyData } from './lib/encryption';

async function seedMarketplace() {
    try {
        console.log('Connecting to DB...');
        await connectDB();
        console.log('Connected.');

        console.log('Clearing existing cards and proxies...');
        await Card.deleteMany({});
        await Proxy.deleteMany({});

        console.log('Seeding 3000 cards with varying high prices...');
        const cardTypes = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'];
        const banks = ['CHASE', 'BOA', 'WELLS FARGO', 'CITI'];
        const cardsToCreate = [];

        let currentPrice = 200000;

        for (let i = 0; i < 3000; i++) {
            // Price increases for each card + small random variation
            const cardPrice = currentPrice + Math.floor(Math.random() * 500);
            currentPrice += 100; // ensures the price keeps increasing

            const rawCard: any = {
                title: `${cardTypes[Math.floor(Math.random() * cardTypes.length)]} - ${banks[Math.floor(Math.random() * banks.length)]} PLATINUM`,
                price: cardPrice,
                description: 'High limit corporate / premium card',
                forSale: true,
                // Ensures completely unique card number
                cardNumber: '4' + Math.floor(100000000000000 + Math.random() * 899999999999999).toString(),
                cvv: Math.floor(100 + Math.random() * 899).toString(),
                expiry: `${String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')}/${Math.floor(25 + Math.random() * 8)}`,
                holder: ['John Doe', 'Jane Smith', 'Michael Johnson', 'Emily Davis', 'Chris Brown', 'Sarah Wilson', 'David Lee', 'Laura Taylor'][Math.floor(Math.random() * 8)],
                address: `${Math.floor(100 + Math.random() * 9000)} ${['Main St', 'Oak Ave', 'Pine Ln', 'Maple Dr', 'Cedar Ct', 'Elm St'][Math.floor(Math.random() * 6)]}`,
                bank: banks[Math.floor(Math.random() * banks.length)],
                type: cardTypes[Math.floor(Math.random() * cardTypes.length)],
                zip: Math.floor(10000 + Math.random() * 89999).toString(),
                city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'][Math.floor(Math.random() * 8)],
                state: ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA'][Math.floor(Math.random() * 8)],
                country: 'US',
                createdAt: new Date()
            };

            cardsToCreate.push(encryptCardData(rawCard));
        }

        const cardChunkSize = 500;
        for (let i = 0; i < cardsToCreate.length; i += cardChunkSize) {
            await Card.insertMany(cardsToCreate.slice(i, i + cardChunkSize));
            console.log(`Inserted card chunk ${i} to ${Math.min(i + cardChunkSize, cardsToCreate.length)}`);
        }
        console.log('Successfully seeded 3000 cards!');

        console.log('Seeding 1000 proxies...');
        const proxiesToCreate = [];
        let proxyPrice = 5000; // proxies have a smaller base price, but let's make it vary too
        for (let i = 0; i < 1000; i++) {
            const thisProxyPrice = proxyPrice + Math.floor(Math.random() * 50);
            proxyPrice += 5; // varies, increments

            const rawProxy: any = {
                title: 'Premium High Speed Proxy',
                price: thisProxyPrice,
                description: 'Fast anonymous proxy server',
                forSale: true,
                host: `192.168.1.${(i % 255)}`,
                port: '8080',
                username: 'proxyuser' + i,
                password: 'proxypassword' + i,
                type: 'SOCKS5',
                country: 'USA',
                city: 'New York',
                state: 'NY',
                createdAt: new Date()
            };

            proxiesToCreate.push(encryptProxyData(rawProxy));
        }

        const proxyChunkSize = 500;
        for (let i = 0; i < proxiesToCreate.length; i += proxyChunkSize) {
            await Proxy.insertMany(proxiesToCreate.slice(i, i + proxyChunkSize));
            console.log(`Inserted proxy chunk ${i} to ${Math.min(i + proxyChunkSize, proxiesToCreate.length)}`);
        }
        console.log('Successfully seeded 1000 proxies!');

    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedMarketplace();
