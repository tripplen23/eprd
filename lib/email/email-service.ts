import sgMail from '@sendgrid/mail';

type WelcomeEmailParams = {
    email: string;
    name: string;
};

/**
 * Send a welcome email to a new user
 * In production, replace this with your actual email sending logic
 */
export async function sendWelcomeEmail({ email, name }: WelcomeEmailParams): Promise<void> {
    // This is a placeholder implementation
    // In a real app, you would use a proper email sending service
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    const msg = {
        to: email,
        from: 'binh.nguyen@rubberduck.live',
        subject: 'Welcome to PRDChat AI!',
        text: `Hello ${name}, welcome to PRDChat AI!`,
        html: `<strong>Hello ${name}!</strong><p>Welcome to PRDChat AI. We're excited to have you on board.</p>`,
    };

    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }

    return Promise.resolve();
}
