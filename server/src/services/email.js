import nodemailer from 'nodemailer';
import {config} from '../config.js';

let transporter;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.port === 465,
            auth: {
                user: config.smtp.user,
                pass: config.smtp.password,
            },
        });
    }
    return transporter;
}

export async function sendLoginCode(email, code) {
    await getTransporter().sendMail({
        from: config.smtp.from,
        to: email,
        subject: 'Your TriggerTrack sign-in code',
        text: `Your TriggerTrack sign-in code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    });
}