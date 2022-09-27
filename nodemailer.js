const nodemailer = require('nodemailer');

const transportador = nodemailer.createTransport({
    host: "smtp.mailgun.org",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'postmaster@kiliandev.com.br', // generated ethereal user
        pass: '1cdaa4745be30574b5f57c4450864419-1b8ced53-01a40517', // generated ethereal password
    },
})

module.exports = transportador;
