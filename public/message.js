const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user:'ibragimtop1@gmail.com',
        pass:'emlx wxgk ajik qiyl'
    }
})

let mail = {
    from: 'ibragimtop1@gmail.com',
    to:'boyp2959@gmail.com',
    subject:'Hello',
    text:'hi',
}

transporter.sendMail(mail, (err, info) => {
    console.log(info.response);
})