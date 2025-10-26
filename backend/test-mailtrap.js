// Test script for Mailtrap API
const { MailtrapClient } = require("mailtrap");
require('dotenv').config();

const TOKEN = process.env.MAILTRAP_TOKEN;

const client = new MailtrapClient({
    token: TOKEN,
});

const sender = {
    email: "hello@demomailtrap.co",
    name: "Mailtrap Test",
};
const recipients = [
    {
        email: "dijildeji333@gmail.com",
    }
];

// For testing (emails go to Mailtrap inbox)
client
    .send({
        from: sender,
        to: recipients,
        subject: "You are awesome!",
        text: "Congrats for sending test email with Mailtrap!",
        category: "Integration Test",
    })
    .then(console.log, console.error);

// For production (emails go to real addresses)
// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);
