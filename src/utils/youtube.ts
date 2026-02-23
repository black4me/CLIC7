/**
 * YouTube Video ID Regex Pattern
 * Supports:
 * - 11-character Video IDs (e.g., cQLakPdVhEc)
 * - Standard URLs: https://www.youtube.com/watch?v=VIDEO_ID
 * - Short URLs: https://youtu.be/VIDEO_ID
 * - Embed URLs: https://www.youtube.com/embed/VIDEO_ID
 * - Shorts URLs: https://youtube.com/shorts/VIDEO_ID
 */
export const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]{11}).*/;

/**
 * Direct Video ID regex - matches exactly 11 alphanumeric characters with allowed symbols
 */
export const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts the YouTube Video ID from various URL formats or direct ID input.
 * Supported:
 * - Direct 11-character IDs (e.g., cQLakPdVhEc)
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 */
export function getYouTubeID(url: string | undefined): string | null {
    if (!url) return null;

    const trimmed = url.trim();

    // Check if it's a direct 11-character video ID
    if (youtubeIdRegex.test(trimmed)) {
        return trimmed;
    }

    // Try to extract from URL
    const match = trimmed.match(youtubeRegex);

    if (match && match[2] && match[2].length === 11) {
        return match[2];
    }

    return null;
}

/**
 * Unit Test Verification Block
 * Validates the following inputs:
 * - cQLakPdVhEc (direct 11-char ID)
 * - https://youtu.be/ID (short URL)
 * - https://www.youtube.com/watch?v=ID (standard URL)
 */
export function validateYouTubeRegex(): { passed: boolean; results: Array<{ input: string; expected: string | null; actual: string | null; passed: boolean }> } {
    const testCases = [
        { input: 'cQLakPdVhEc', expected: 'cQLakPdVhEc' },
        { input: 'dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
        { input: 'https://youtu.be/cQLakPdVhEc', expected: 'cQLakPdVhEc' },
        { input: 'https://www.youtube.com/watch?v=cQLakPdVhEc', expected: 'cQLakPdVhEc' },
        { input: 'https://youtube.com/watch?v=dQw4w9WgXcQ&feature=share', expected: 'dQw4w9WgXcQ' },
        { input: 'https://www.youtube.com/embed/cQLakPdVhEc', expected: 'cQLakPdVhEc' },
        { input: 'https://youtube.com/shorts/cQLakPdVhEc', expected: 'cQLakPdVhEc' },
        { input: 'invalid', expected: null },
        { input: '', expected: null },
    ];

    const results = testCases.map(test => {
        const actual = getYouTubeID(test.input);
        const passed = actual === test.expected;
        return {
            input: test.input,
            expected: test.expected,
            actual,
            passed
        };
    });

    const allPassed = results.every(r => r.passed);

    // Log results for debugging
    console.log('[YOUTUBE REGEX VALIDATION]', {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        results
    });

    return { passed: allPassed, results };
}

// Auto-run validation on module load (development only)
if (process.env.NODE_ENV === 'development') {
    validateYouTubeRegex();
}

export function getYouTubeEmbedUrl(url: string): string {
    const id = getYouTubeID(url);
    return id ? `https://www.youtube.com/embed/${id}` : '';
}

/**
 * Gets the YouTube thumbnail URL for a video ID
 * @param videoId - YouTube video ID
 * @param quality - Thumbnail quality: 'default', 'mqdefault', 'hqdefault', 'sddefault', 'maxresdefault'
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault'): string {
    if (!videoId) return '';
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}
