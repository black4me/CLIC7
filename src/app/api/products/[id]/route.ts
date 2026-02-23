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
        status: 'success',
        // Spread all metadata fields
        ...metadata
    };
};

// Helper to extract metadata fields from Game interface that aren't in Product model
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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        const product = await prisma.product.findUnique({
            where: { id },
        });
        
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        
        // Reconstruct full Game object
        const game = reconstructGame(product);
        
        return NextResponse.json(game);
    } catch (error) {
        console.error('Failed to fetch product:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // 1. Authorization Check (Admin Only)
        const session = await verifyAuth(request);
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Data Cleaning & Normalization
        // Ensures numbers and strings are valid before hitting the DB
        const updateData = {
            title: body.title,
            slug: body.slug,
            price: Number(body.price),
            originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
            image: body.image,
            description: body.description,
            genre: body.genre,
            platform: body.platform,
            category: body.category || 'game',
            isActive: body.isActive,
            isFlashSale: body.isFlashSale || false,
            // Synchronize Metadata
            metadata: {
                ...(body.metadata || {}), // Preserving existing metadata
                videoUrl: body.videoUrl,  // Updating Video ID
                stockStatus: body.stockStatus || 'IN_STOCK',
                releaseDate: body.releaseDate
            },
            updatedAt: new Date()
        };

        // 3. Database Update Operation
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData
        });

        // 4. Cache Revalidation
        revalidatePath('/admin/products');
        revalidatePath(`/game/${updatedProduct.slug}`);
        
        return NextResponse.json({ 
            success: true, 
            product: updatedProduct 
        });

    } catch (error) {
        // Detailed Logging for Debugging
        console.error('CRITICAL: FAILED TO UPDATE PRODUCT:', error); 
        return NextResponse.json(
            { 
                error: 'Failed to update product', 
                details: error instanceof Error ? error.message : String(error) 
            }, 
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyAuth(request);
        if (!auth || !['admin', 'owner'].includes(auth.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await prisma.product.delete({
            where: { id },
        });

        // Revalidate paths
        revalidatePath('/admin/products');
        revalidatePath('/games');
        revalidatePath('/');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
