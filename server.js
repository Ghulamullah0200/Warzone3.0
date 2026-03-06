const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const path = require('path')

// FORCE PRODUCTION MODE
process.env.NODE_ENV = 'production';

// Load .env file explicitly
require('dotenv').config({ path: path.join(__dirname, '.env') })

const dev = false; // Always false for production
const port = process.env.PORT || 3000
const hostname = 'localhost'

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

console.log('--- Starting Warzone Next.js Production Server ---')
console.log('Target Port:', port)
console.log('Environment Forced To:', process.env.NODE_ENV)

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true)
            await handle(req, res, parsedUrl)
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    }).listen(port, (err) => {
        if (err) throw err
        console.log(`> Ready on http://${hostname}:${port}`)
    })
}).catch(err => {
    console.error('FATAL: Failed to prepare Next.js app:', err)
    process.exit(1)
})
