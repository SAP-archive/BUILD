'use strict';

module.exports = {
    mail: {
        sender: 'do.not.reply@example.com',
        smtp: {
            host: 'mail.example.com',
            port: 25,
            debug: true,
            tls: {
                // ca : 'path/to/CA_mailserver/cert.pem'
                rejectUnauthorized: false
            }
        }
    }
};
