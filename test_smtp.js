const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: 'info@marinhoponci.com',
        pass: 'bizguardian2026'
    },
    logger: true,
    debug: true
});

transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ ERRO DE CONEXÃO SMTP:");
        console.dir(error, { depth: null });
        process.exit(1);
    } else {
        console.log("✅ Conexão SMTP com Hostinger bem sucedida!");
        process.exit(0);
    }
});
