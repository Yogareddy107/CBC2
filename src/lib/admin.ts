export const ALLOWED_ADMIN_EMAILS = [
    'teamintrasphere@gmail.com'
];

export function isAdminEmail(email?: string) {
    if (!email) return false;
    return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase());
}
