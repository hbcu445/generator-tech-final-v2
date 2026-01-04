// Netlify serverless function to send test results and certificate via SendGrid
// This function sends emails to both the applicant and their branch manager

const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse form data
    const formData = JSON.parse(event.body);
    
    const {
      applicantName,
      applicantEmail,
      phone,
      branch,
      skillLevel,
      score,
      total,
      percentage,
      passed,
      certificateBase64,
      reportBase64,
      branchManagerEmail
    } = formData;

    // Set SendGrid API key from environment variable
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Create email HTML template
    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #1e3a5f;
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background-color: #f8f9fa;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .result-box {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid ${passed ? '#10b981' : '#ef4444'};
    }
    .result-box h2 {
      margin-top: 0;
      color: ${passed ? '#10b981' : '#ef4444'};
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      color: #6b7280;
    }
    .info-value {
      color: #1e3a5f;
    }
    .score-display {
      text-align: center;
      font-size: 48px;
      font-weight: bold;
      color: ${passed ? '#10b981' : '#ef4444'};
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .button {
      display: inline-block;
      background-color: #1e3a5f;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎓 Generator Technician Test Results</h1>
    <p style="margin: 10px 0 0 0;">Generator Source - Sales • Rentals • Service</p>
  </div>
  
  <div class="content">
    <h2>Dear ${applicantName},</h2>
    <p>Thank you for completing the Generator Technician Knowledge Test. Your results are now available.</p>
    
    <div class="result-box">
      <h2>${passed ? '✅ Congratulations! You Passed!' : '❌ Test Not Passed'}</h2>
      <div class="score-display">${percentage}%</div>
      <p style="text-align: center; color: #6b7280; margin: 0;">
        ${score} out of ${total} questions correct
      </p>
    </div>
    
    <div class="result-box">
      <h3 style="margin-top: 0;">Test Details</h3>
      <div class="info-row">
        <span class="info-label">Name:</span>
        <span class="info-value">${applicantName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value">${applicantEmail}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Phone:</span>
        <span class="info-value">${phone}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Branch:</span>
        <span class="info-value">${branch}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Skill Level:</span>
        <span class="info-value">${skillLevel}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Test Date:</span>
        <span class="info-value">${new Date().toLocaleDateString()}</span>
      </div>
    </div>
    
    <p style="text-align: center;">
      <strong>📄 Your official certificate is attached to this email.</strong>
    </p>
    
    ${passed ? `
      <p>Your certificate demonstrates your knowledge and expertise as a generator technician. 
      Keep it for your records and professional development.</p>
    ` : `
      <p>We encourage you to review the test material and retake the assessment when you're ready. 
      Your dedication to improving your skills is valued.</p>
    `}
    
    <p>If you have any questions about your results, please contact your branch manager or 
    reach out to Generator Source support.</p>
    
    <p>Best regards,<br>
    <strong>Generator Source Team</strong></p>
  </div>
  
  <div class="footer">
    <p>Generator Source • Sales • Rentals • Service</p>
    <p>This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>
    `;

    // Prepare email messages
    const messages = [];

    // Email to applicant
    messages.push({
      to: applicantEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'Generator Source'
      },
      subject: `Generator Technician Test Results - ${passed ? 'Passed' : 'Not Passed'} (${percentage}%)`,
      html: emailHTML,
      attachments: [
        {
          content: certificateBase64,
          filename: `${applicantName.replace(/\s+/g, '_')}_Certificate.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        },
        ...(reportBase64 ? [{
          content: reportBase64,
          filename: `${applicantName.replace(/\s+/g, '_')}_Report.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }] : [])
      ]
    });

    // Email to branch manager (if provided)
    if (branchManagerEmail) {
      const managerEmailHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #1e3a5f;
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background-color: #f8f9fa;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .result-box {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid ${passed ? '#10b981' : '#ef4444'};
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      color: #6b7280;
    }
    .info-value {
      color: #1e3a5f;
    }
    .score-display {
      text-align: center;
      font-size: 48px;
      font-weight: bold;
      color: ${passed ? '#10b981' : '#ef4444'};
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Technician Test Completion Notification</h1>
    <p style="margin: 10px 0 0 0;">Generator Source - ${branch}</p>
  </div>
  
  <div class="content">
    <h2>Test Completion Alert</h2>
    <p>A technician from your branch has completed the Generator Technician Knowledge Test. 
    Below are the results for your records.</p>
    
    <div class="result-box">
      <h3 style="margin-top: 0;">Test Result: ${passed ? '✅ PASSED' : '❌ NOT PASSED'}</h3>
      <div class="score-display">${percentage}%</div>
      <p style="text-align: center; color: #6b7280; margin: 0;">
        ${score} out of ${total} questions correct
      </p>
    </div>
    
    <div class="result-box">
      <h3 style="margin-top: 0;">Technician Information</h3>
      <div class="info-row">
        <span class="info-label">Name:</span>
        <span class="info-value">${applicantName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value">${applicantEmail}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Phone:</span>
        <span class="info-value">${phone}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Branch:</span>
        <span class="info-value">${branch}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Skill Level:</span>
        <span class="info-value">${skillLevel}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Test Date:</span>
        <span class="info-value">${new Date().toLocaleDateString()}</span>
      </div>
    </div>
    
    <p><strong>📄 The technician's certificate is attached to this email for your records.</strong></p>
    
    ${passed ? `
      <p>This technician has demonstrated proficiency in generator technology and maintenance. 
      The certificate is available for your HR and training records.</p>
    ` : `
      <p>This technician did not pass the assessment. You may want to provide additional 
      training resources or schedule a follow-up discussion.</p>
    `}
    
    <p>Best regards,<br>
    <strong>Generator Source Testing System</strong></p>
  </div>
  
  <div class="footer">
    <p>Generator Source • Sales • Rentals • Service</p>
    <p>This is an automated notification from the technician testing system.</p>
  </div>
</body>
</html>
      `;

      messages.push({
        to: branchManagerEmail,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: process.env.SENDGRID_FROM_NAME || 'Generator Source'
        },
        subject: `Technician Test Completed - ${applicantName} - ${passed ? 'Passed' : 'Not Passed'} (${percentage}%)`,
        html: managerEmailHTML,
        attachments: [
          {
            content: certificateBase64,
            filename: `${applicantName.replace(/\s+/g, '_')}_Certificate.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
          },
          ...(reportBase64 ? [{
            content: reportBase64,
            filename: `${applicantName.replace(/\s+/g, '_')}_Report.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
          }] : [])
        ]
      });
    }

    // Email to master admin
    const masterAdminEmail = 'info@powergenequipment.com';
    messages.push({
      to: masterAdminEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'Generator Source'
      },
      subject: `[Admin] Technician Test Completed - ${applicantName} - ${branch} - ${passed ? 'Passed' : 'Not Passed'} (${percentage}%)`,
      html: managerEmailHTML,
      attachments: [
        {
          content: certificateBase64,
          filename: `${applicantName.replace(/\s+/g, '_')}_Certificate.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        },
        ...(reportBase64 ? [{
          content: reportBase64,
          filename: `${applicantName.replace(/\s+/g, '_')}_Report.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }] : [])
      ]
    });

    // Send all emails
    await sgMail.send(messages);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Results and certificate sent successfully',
        recipients: messages.length
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message 
      })
    };
  }
};
