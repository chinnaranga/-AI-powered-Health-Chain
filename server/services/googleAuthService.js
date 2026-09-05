import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export async function verifyGoogleAccessToken(accessToken) {
    if (!GOOGLE_CLIENT_ID) {
        throw new Error('GOOGLE_CLIENT_ID is not configured on the backend.');
    }

    if (!accessToken || typeof accessToken !== 'string') {
        throw new Error('Google access token is required.');
    }

    const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
    );

    if (!response.ok) {
        throw new Error('Invalid or expired Google access token.');
    }

    const tokenInfo = await response.json();

    if (tokenInfo.aud !== GOOGLE_CLIENT_ID) {
        throw new Error('Google token audience validation failed.');
    }

    if (tokenInfo.email_verified !== 'true') {
        throw new Error('Google email is not verified.');
    }

    const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

    const ticket = await oauthClient.verifyIdToken({
        idToken: accessToken,
        audience: GOOGLE_CLIENT_ID
    }).catch(() => null);

    return {
        email: tokenInfo.email?.trim().toLowerCase(),
        name: tokenInfo.name || '',
        picture: tokenInfo.picture || '',
        sub: tokenInfo.sub,
        verified: true
    };
}
