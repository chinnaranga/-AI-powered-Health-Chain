const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export async function verifyGoogleAccessToken(accessToken) {
    if (!GOOGLE_CLIENT_ID) {
        throw new Error('GOOGLE_CLIENT_ID is not configured on the backend.');
    }

    if (!accessToken || typeof accessToken !== 'string') {
        throw new Error('Google access token is required.');
    }

    const tokenResponse = await fetch(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
    );

    if (!tokenResponse.ok) {
        throw new Error('Invalid or expired Google access token.');
    }

    const tokenInfo = await tokenResponse.json();
    const audience = tokenInfo.audience || tokenInfo.issued_to || tokenInfo.aud;

    if (audience !== GOOGLE_CLIENT_ID) {
        throw new Error('Google token audience validation failed.');
    }

    if (!Number.isFinite(Number(tokenInfo.expires_in)) || Number(tokenInfo.expires_in) <= 0) {
        throw new Error('Google access token is expired.');
    }

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (!userResponse.ok) {
        throw new Error('Unable to retrieve Google user profile.');
    }

    const userInfo = await userResponse.json();

    if (!userInfo.email || userInfo.verified_email !== true) {
        throw new Error('Google email is not verified.');
    }

    return {
        email: userInfo.email.trim().toLowerCase(),
        name: userInfo.name || '',
        picture: userInfo.picture || '',
        sub: userInfo.sub || tokenInfo.user_id,
        verified: true
    };
}
