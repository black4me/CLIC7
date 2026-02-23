import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Helper to reconstruct Game object from Product + metadata
const reconstructGame = (product: any) => {
    const metadata = (product.metadata as Record<string, any>) || {};
    return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        image: product.image,
        description: product.description || undefined,
        genre: product.genre as any,
        platform: product.platform as any,
        category: product.category as any,
        isActive: product.isActive,
        isFlashSale: product.isFlashSale,
        rating: product.rating || undefined,
        reviewsCount: product.reviewsCount || undefined,
        // Spread all metadata fields
        ...metadata
    };
};

// Helper to extract metadata fields from Game interface
const extractMetadata = (body: any) => {
    const metadataFields = [
        'gallery', 'tags', 'releaseDate', 'article', 'socialProof',
        'videoUrl', 'hoverVideoUrl', 'trailerVideoUrl', 'videoStart', 'videoEnd',
        'metaTitle', 'metaDescription', 'features', 'seasonInfo', 'featureHighlights',
        'availablePlatforms', 'stockStatus', 'lastUpdated', 'currencyPackages',
        'proCard', 'seasonUpdates', 'hardwareExclusives', 'heroHeadline',
        'heroSubHeadline', 'heroImage', 'videoCover', 'trailerUrl',
        'activationSteps', 'relatedArticleIds', 'userReviews'
    ];

    const metadata: any = {};
    metadataFields.forEach(field => {
        if (body[field] !== undefined) {
            metadata[field] = body[field];
        }
    });

    return metadata;
};

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });

        // Reconstruct full Game objects
        const games = products.map(reconstructGame);

        return NextResponse.json(games);
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // 1. Authorization Check (Admin & Owner)
        const session = await verifyAuth(request);
        console.log('[API POST /products] Retrieved Session:', session);
        let isAuthorized = false;

        if (session && ['admin', 'owner', 'OWNER'].includes(String(session.role).toLowerCase())) {
            isAuthorized = true;
            console.log('[API POST /products] Authorized from session role:', session.role);
        }

        // Emergency Patch: Fallback check in database if session role is missing/invalid
        if (!isAuthorized && session?.email) {
            const dbUser = await prisma.staff.findUnique({ where: { email: session.email } });
            console.log('[API POST /products] DB User fallback for email', session.email, ':', dbUser);
            if (dbUser && ['admin', 'owner', 'OWNER', 'supervisor'].includes(String(dbUser.role).toLowerCase())) {
                isAuthorized = true;
                console.log('[API POST /products] Authorized from DB role:', dbUser.role);
            }
        }

        if (!isAuthorized) {
            console.error('[API POST /products] Unauthorized access attempt. Final Session state:', session);
            return NextResponse.json({ error: 'Unauthorized. Owner or Admin access required.', sessionDetails: session }, { status: 401 });
        }

        const body = await request.json();

        // 2. Data Cleaning & Normalization

        // Final Media Linkage Cleanup: Images
        let finalImage = body.image;
        if (finalImage && !finalImage.startsWith('http')) {
            const baseUrl = process.env.SUPABASE_URL || 'https://tcwtqkklmhlucoirnogq.supabase.co';
            const filename = finalImage.split('/').pop();
            finalImage = `${baseUrl}/storage/v1/object/public/products/${filename}`;
        }

        // Final Media Linkage Cleanup: Videos
        let sanitizedVideoUrl = body.videoUrl || null;
        if (sanitizedVideoUrl) {
            const ytMatch = sanitizedVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
            const videoId = ytMatch ? ytMatch[1] : (sanitizedVideoUrl.length === 11 ? sanitizedVideoUrl : null);
            sanitizedVideoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : sanitizedVideoUrl;
        }

        // Ensures strict data types and fallback values for required fields
        const newProductData = {
            id: body.id || undefined, // Allow Prisma to generate ID if not provided
            title: body.title,
            slug: body.slug || body.title.toLowerCase().replace(/ /g, '-'),
            price: Number(body.price),
            originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
            image: finalImage,
            description: body.description,
            genre: body.genre,
            platform: body.platform,
            category: body.category || 'game',
            isActive: body.isActive !== undefined ? body.isActive : true,
            isFlashSale: body.isFlashSale || false,
            rating: body.rating ? Number(body.rating) : null,
            reviewsCount: body.reviewsCount ? Number(body.reviewsCount) : null,
            // Synchronize Metadata
            metadata: {
                ...(body.metadata || {}),
                videoUrl: sanitizedVideoUrl,
                stockStatus: body.stockStatus || 'IN_STOCK',
                releaseDate: body.releaseDate,
                tags: body.tags || [],
                features: body.features || []
            }
        };

        // 3. Database Create Operation
        const createdProduct = await prisma.product.create({
            data: newProductData
        });

        // 4. Cache Revalidation
        revalidatePath('/admin/products');
        revalidatePath('/games');
        revalidatePath('/');

        return NextResponse.json({
            success: true,
            product: reconstructGame(createdProduct),
            message: 'Product created successfully'
        });

    } catch (error) {
        // Detailed Logging for Debugging
        console.error('CRITICAL: FAILED TO CREATE PRODUCT:', error);
        return NextResponse.json(
            {
                error: 'Failed to create product',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
