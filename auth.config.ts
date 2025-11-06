import type { NextAuthConfig, User } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import Google from 'next-auth/providers/google';
import LinkedIn from 'next-auth/providers/linkedin';
import { TableStorageAdapter } from '@auth/azure-tables-adapter';
import { AzureNamedKeyCredential, TableClient } from '@azure/data-tables';
import CredentialProvider from 'next-auth/providers/credentials';

// Type declarations
declare module 'next-auth' {
    interface Session {
        accessToken?: string;
        user?: User;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        error?: string;
        email?: string;
        isNewUser?: boolean;
    }
}

// For Azure Table Storage Adapter
export const credential = new AzureNamedKeyCredential(
    process.env.AUTH_AZURE_ACCOUNT!,
    process.env.AUTH_AZURE_ACCESS_KEY!
);

export const authClient = new TableClient(process.env.AUTH_AZURE_TABLES_ENDPOINT!, 'auth', credential);

// User table for tracking user data including first login
export const userClient = new TableClient(process.env.AUTH_AZURE_TABLES_ENDPOINT!, 'users', credential);

// Auth Providers Configuration
export const authProviders = [
    CredentialProvider({
        credentials: {
            email: {
                type: 'email',
                label: 'Email',
                placeholder: 'example@email.com',
            },
            password: {
                type: 'password',
                label: 'Password',
                placeholder: '********',
            },
        },
    }),
    MicrosoftEntraID({
        clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
        clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
        issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
        allowDangerousEmailAccountLinking: true,
    }),
    Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        allowDangerousEmailAccountLinking: true,
    }),
    LinkedIn({
        clientId: process.env.AUTH_LINKEDIN_ID,
        clientSecret: process.env.AUTH_LINKEDIN_SECRET,
        allowDangerousEmailAccountLinking: true,
    }),
];

// Auth Configuration
export const authConfig: Partial<NextAuthConfig> = {
    adapter: TableStorageAdapter(authClient),
    secret: process.env.AUTH_SECRET,
    session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
    pages: { signIn: '/auth', signOut: '/auth', error: '/auth' },
    debug: process.env.NODE_ENV === 'development',
};