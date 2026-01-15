import { supabaseAdmin } from '../lib/supabase.js';

/**
 * Middleware to log administrative and critical actions to a persistent audit_logs table.
 * @param {string} actionType - The type of action (e.g., 'ADMIN_VERIFY_TECH', 'PAYMENT_CONFIRMED')
 */
export const logAuditTrail = (actionType) => {
    return async (req, res, next) => {
        const originalSend = res.send;

        res.send = function (body) {
            const statusCode = res.statusCode;

            // Only log successful critical actions or specific failed attempts if needed
            if (statusCode >= 200 && statusCode < 300) {
                const logEntry = {
                    user_id: req.user?.id || 'anonymous',
                    user_email: req.user?.email || 'N/A',
                    action_type: actionType,
                    payload: req.body || {},
                    response_code: statusCode,
                    ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
                    user_agent: req.headers['user-agent'],
                    created_at: new Date().toISOString()
                };

                // Non-blocking insert to audit_logs
                supabaseAdmin.from('audit_logs').insert([logEntry]).then(({ error }) => {
                    if (error) console.error('Audit Log Error:', error);
                });
            }

            return originalSend.apply(res, arguments);
        };

        next();
    };
};
