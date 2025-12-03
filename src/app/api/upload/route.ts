import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Sanitize extension or use original
        const ext = path.extname(file.name);
        const filename = `${nanoid()}${ext}`;
        
        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public/uploads/prompts');
        await mkdir(uploadDir, { recursive: true });
        
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        
        const url = `/uploads/prompts/${filename}`;
        
        return NextResponse.json({ url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

