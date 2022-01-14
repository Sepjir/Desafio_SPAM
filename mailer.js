//archivo mailer que se encarga de guardar la información que se usará para enviar correos, así como su función asincrona, que retornará en una promesa
const nodemailer = require("nodemailer")

async function enviar(to, subject, html) {
    let transporter = nodemailer.createTransport({
        host: 'mail.cajadebotin.com',
        port: 465,
        auth: {
            user: 'pruebadesafio@cajadebotin.com',
            pass: 'desafiomails123'
        },
    })

    let mailOptions = {
        from: 'hola@cajadebotin.com',
        to,
        subject,
        html,
    }

    transporter.sendMail(mailOptions, (err, data) =>{
        if (err) {
            console.log(err, "Ha ocurrido un error, puede que falte la coma")
        }
        if (data) console.log(data)
    })
    
}

// exportando modulo con función enviar
module.exports = enviar;