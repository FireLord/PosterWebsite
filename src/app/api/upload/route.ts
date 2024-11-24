import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import path from 'path';

// Create a Supabase client with server-side cookies
async function createClient() {
    // Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Get cookies from the request
    const cookieStore = await cookies()

    return createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        console.error('Failed to set cookies')
                    }
                },
            },
        }
    )
}

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
        const name = formData.get('name') as string;
        const supabase = await createClient();

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Generate a unique filename using a timestamp and random ID
        const uniqueName = `${Date.now()}-${randomUUID()}.jpeg`;

        // Path to the poster template in public folder
        const posterTemplatePath = path.join(process.cwd(), 'public', 'poster_template.jpeg');

        // Read the uploaded file into a buffer
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // Resize the uploaded image using sharp
        const resizedOverlay = await sharp(fileBuffer)
            .rotate()
            .resize(335, 335)
            .toBuffer();

        // Create an SVG with the name text
        const nameText = name || 'Your Name Here'; // Use the provided name or a default
        const svgText = `
        <svg width="500" height="100">
          <text x="0" y="50" font-size="40" fill="black">${nameText}</text>
        </svg>`;

        // Convert the SVG to a buffer
        const svgBuffer = Buffer.from(svgText);

        // Read and overlay the image and text onto the template
        const finalImage = await sharp(posterTemplatePath)
            .composite([
                { input: resizedOverlay, top: 165, left: 70 }, // Position the image
                { input: svgBuffer, top: 300, left: 450 } // Position the text
            ])
            .toBuffer();

        // Upload to Supabase Storage
        const { error } = await supabase.storage
            .from('posters') // Assuming 'posters' is your bucket name
            .upload(uniqueName, finalImage, {
                contentType: 'image/jpeg',
                upsert: true, // Optionally overwrite if the same file already exists
            });

        if (error) {
            throw error;
        }

        // Get the public URL for the uploaded image
        const uploadResult = supabase.storage
            .from('posters')
            .getPublicUrl(uniqueName);

        const publicURL = uploadResult.data.publicUrl;

        if (!publicURL) {
            throw new Error('Failed to get public URL');
        }

        console.log('Image uploaded to:', publicURL);
        // Return the URL of the generated image
        return NextResponse.json({ url: publicURL });
    } catch (error) {
        console.error('Error during image processing:', error);
        return NextResponse.json({ error: 'Image processing failed' }, { status: 500 });
    }
}
