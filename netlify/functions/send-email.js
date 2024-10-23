// netlify/functions/send-email.js

const sgMail = require('@sendgrid/mail');

// Set SendGrid API Key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Define the sender email (must be verified in SendGrid)
const FROM_EMAIL = 'your-verified-email@example.com';

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Allow': 'POST' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);

        const { job_description, linkedin_urls, user_email, attachments } = data;

        // Construct the email content
        const msg = {
            to: 'fmoura+hrsaas@gmail.com', // Replace with your receiving email
            from: FROM_EMAIL,
            subject: `New Candidate Submission from ${user_email}`,
            text: `
Job Description:
${job_description}

LinkedIn Profile URLs:
${linkedin_urls}

Submitted by:
${user_email}
            `,
            html: `
                <h2>New Candidate Submission</h2>
                <p><strong>Job Description:</strong></p>
                <p>${job_description.replace(/\n/g, '<br>')}</p>
                <p><strong>LinkedIn Profile URLs:</strong></p>
                <p>${linkedin_urls.replace(/\n/g, '<br>')}</p>
                <p><strong>Submitted by:</strong> ${user_email}</p>
            `,
            attachments: attachments.map(file => ({
                content: file.content,
                filename: file.filename,
                type: file.type,
                disposition: 'attachment'
            }))
        };

        // Send the email using SendGrid
        await sgMail.send(msg);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully!' })
        };
    } catch (error) {
        console.error('Error sending email:', error);

        // SendGrid specific error handling
        if (error.response) {
            console.error(error.response.body);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.response.body.errors })
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to send email.' })
        };
    }
};
