import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define path
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'proxies');

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            console.log('Directory already exists or error creating it', e);
        }

        const filename = `${randomUUID()}-${file.name.replace(/\s+/g, '-')}`;
        const filePath = join(uploadDir, filename);

        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/proxies/${filename}`;

        return NextResponse.json({ success: true, url: fileUrl });
    } catch (error: unknown) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
