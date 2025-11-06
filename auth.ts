import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';
import type { Account, NextAuthConfig, Session, User } from 'next-auth';
import { sendWelcomeEmail } from './lib/email/email-service';
import { authProviders, authConfig, userClient } from './auth.config';

// Refresh Access Token
async function refreshAccessToken(token: JWT) {
    try {
        // Don't attempt refresh if no refresh token
        if (!token.refreshToken) {
            return {
                ...token,
                error: 'NoRefreshTokenError',
            };
        }

        const url = `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/oauth2/v2.0/token`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
                client_secret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken,
            }).toString(),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error('RefreshAccessTokenError', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

// Check if a user exists in the users table
async function getUserByEmail(email: string) {
    try {
        const user = await userClient.getEntity('users', email);
        return user;
    } catch (error) {
        return null;
    }
}

// Create or update user record
async function saveUserRecord(user: { email: string; name?: string | null; image?: string | null }) {
    try {
        await userClient.upsertEntity(
            {
                partitionKey: 'users',
                rowKey: user.email,
                name: user.name || '',
                image: user.image || '',
                firstLoginAt: new Date().toISOString(),
                welcomeEmailSent: true,
            },
            'Replace'
        );
    } catch (error) {
        console.error('Error saving user record:', error);
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: authProviders,
    callbacks: {
        async signIn({ user }: { user: User }) {
            if (user?.email) {
                // Check if this is the user's first login
                const existingUser = await getUserByEmail(user.email);

                if (!existingUser) {
                    // First time login - send welcome email
                    try {
                        await sendWelcomeEmail({
                            email: user.email,
                            name: user.name || '',
                        });

                        // Save the user record to track that they've logged in
                        await saveUserRecord({
                            email: user.email,
                            name: user.name,
                        });
                    } catch (error) {
                        // Log error but allow sign-in to continue
                        console.error('Error in welcome email flow:', error);
                    }
                } else {
                    // User exists but we should update their record with latest info
                    try {
                        await userClient.updateEntity(
                            {
                                partitionKey: 'users',
                                rowKey: user.email,
                                name: user.name || existingUser.name || '',
                                image: user.image || existingUser.image || '',
                                firstLoginAt: existingUser.firstLoginAt,
                                welcomeEmailSent: existingUser.welcomeEmailSent || true,
                            },
                            'Merge'
                        );
                    } catch (error) {
                        console.error('Error updating user record:', error);
                    }
                }
            }
            return true;
        },
        async jwt({ token, account, user }: { token: JWT; account: Account | null; user: User }) {
            // Save user email during initial sign-in
            if (user) {
                token.email = user.email || undefined;
            }

            // Initial sign in
            if (account) {
                if (account.access_token) {
                    token.accessToken = account.access_token;
                }

                if (account.refresh_token) {
                    token.refreshToken = account.refresh_token;
                }

                token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000;
                return token;
            }

            // Return previous token if the access token has not expired yet
            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
                return token;
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token);
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            // Only set accessToken if it exists in the token
            if (token?.accessToken) {
                session.accessToken = token.accessToken;
            }

            // Ensure user information is passed to the session
            if (token?.email) {
                if (!session.user) {
                    session.user = {};
                }
                session.user.email = token.email;
            }

            return session;
        },
    },
} satisfies NextAuthConfig);
