const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

const config = require('../../config.json');

const productName = 'SETA Vietnam Timesheet Tracking';

function getMailResponse({ intro, tableDataArray, recipientName }) {
  return {
    body: {
      greeting: 'Dear',
      signature: 'System Admin',
      name: recipientName,
      intro,
      table: {
        data: tableDataArray
      },
      action: {
        instructions: `Please access to ${config.serverURL} for more information.`,
        button: {
          color: '#2F3F73',
          text: 'Go to Timesheet',
          link: config.serverURL
        }
      }
    }
  };
}
function sendMail({
  mailResponse, toMail, subject
}) {
  const transporter = nodemailer.createTransport({
    url: config.mailServer.mailServerUrl,
    auth: {
      user: config.mailServer.email,
      pass: process.env.SENDER_EMAIL_PASSWORD
    },
  });

  const MailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: productName,
      link: config.serverURL
    },
  });

  const email = getMailResponse(mailResponse);
  const html = MailGenerator.generate(email);

  const options = {
    from: config.mailServer.email,
    to: toMail,
    subject,
    html
  };

  transporter.sendMail(options)
    .then(() => console.log('Send mail successfully', mailResponse))
    .catch((err) => console.error('Send mail error', err));
}

module.exports = sendMail;
