// File: src/services/emailService.js

const nodemailer = require('nodemailer');

// Configure the transporter using environment variables for real email sending.
const transporter = nodemailer.createTransport({
    // Using 'service' is common, but specific host/port can be used if needed.
    service: process.env.EMAIL_SERVICE || 'Gmail', 
    auth: {
        user: process.env.satyamsharmaxyz01, 
        pass: process.env.htcejyvsigtmolnd
    }
});

/**
 * Sends a registration invitation email to an NGO.
 * @param {string} recipientEmail - The email address of the NGO.
 * @param {string} organizationName - The name of the NGO organization.
 */
const sendInvitationEmail = async (recipientEmail, organizationName) => {
    // Generate the registration link using BASE_URL from environment variables
    const registrationLink = process.env.BASE_URL ? `${process.env.BASE_URL}/register` : 'YOUR_SAJAG_REGISTRATION_LINK_HERE';

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `Invitation to Join SAJAG: National Disaster Readiness Platform`,
        html: `
            <p>Dear Team at ${organizationName},</p>
            <p>The National Disaster Management Authority (NDMA) cordially invites your esteemed organization to join the **SAJAG National Disaster Readiness Platform** as a Training Partner.</p>
            <p>Your expertise and presence are highly valued as we work together to strengthen national disaster preparedness and response efforts across India.</p>
            <p>To register and initiate the process of becoming a certified Training Partner on the SAJAG platform, please click on the link below:</p>
            <p><a href="${registrationLink}" style="color: #007bff; text-decoration: none; font-weight: bold;">Click Here to Register on SAJAG</a></p>
            <p>We look forward to your prompt response and partnership.</p>
            <p>Sincerely,</p>
            <p>The SAJAG Team<br>National Disaster Management Authority (NDMA)</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error sending invitation email to ${recipientEmail}:`, error);
        // Throw an error for the controller to catch and report in the final summary
        throw new Error(`Invitation Email failed to send. Reason: ${error.message || 'SMTP error'}`);
    }
};

module.exports = {
    sendInvitationEmail
};