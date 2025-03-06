import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get('path');

        if (!path) {
            return new NextResponse('Missing path parameter', { status: 400 });
        }


        // Create a Supabase client with server-side credentials
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase credentials');
            return new NextResponse('Server configuration error', { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get the image data from Supabase storage
        const { data, error } = await supabase.storage
            .from('menu-images')
            .download(path);

        if (error) {
            console.error('Error fetching image from Supabase:', error);
            return new NextResponse(`Image not found: ${error.message}`, { status: 404 });
        }

        if (!data) {
            console.error('No data returned from Supabase');
            return new NextResponse('Image not found: No data returned', { status: 404 });
        }

        // Convert the blob to an array buffer
        const arrayBuffer = await data.arrayBuffer();

        // Determine content type based on file extension
        let contentType = 'image/jpeg'; // Default
        if (path.endsWith('.png')) {
            contentType = 'image/png';
        } else if (path.endsWith('.gif')) {
            contentType = 'image/gif';
        } else if (path.endsWith('.svg')) {
            contentType = 'image/svg+xml';
        } else if (path.endsWith('.webp')) {
            contentType = 'image/webp';
        }

        // Return the image with appropriate headers
        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Image proxy error:', error);
        return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
} 