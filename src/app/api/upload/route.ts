import { NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Disable body parsing by Next.js since we use formData()
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Generate a unique filename using a timestamp and random ID
    const uniqueName = `${Date.now()}-${randomUUID()}.jpeg`;

    // Define paths for the template and the output
    const posterTemplatePath = path.join(process.cwd(), 'public', 'poster_template.jpeg');
    const outputDir = path.join(process.cwd(), 'public', 'uploads');
    const outputPath = path.join(outputDir, uniqueName);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Read the uploaded file into a buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Resize the uploaded image
    const resizedOverlay = await sharp(fileBuffer).resize(335, 335).toBuffer();

    // Overlay the uploaded image onto the template
    await sharp(posterTemplatePath)
      .composite([{ input: resizedOverlay, top: 165, left: 70 }]) // Position the overlay
      .toFile(outputPath);

    const publicUrl = `/uploads/${uniqueName}`;

    // Return the URL of the generated image
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Error during image processing:', error);
    return NextResponse.json({ error: 'Image processing failed' }, { status: 500 });
  }
}
