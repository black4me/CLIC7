import { cookies } from 'next/headers';
import { verifyJWT } from './security';

export async function verifyAuth(request: Request) {
    try {
        const cookieStore = await cookies();
        let token = cookieStore.get('clic7_admin_token')?.value;

        if (!token) {
            const authHeader = request.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) return null;

        const { valid, payload } = verifyJWT(token);
        if (!valid) return null;

        return payload;
    } catch (error) {
        console.error('Auth verification failed:', error);
        return null;
    }
}
