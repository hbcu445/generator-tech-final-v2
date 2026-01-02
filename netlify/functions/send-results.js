const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse form data
    const body = JSON.parse(event.body);
    const { name, email, phone, branch, skillLevel, score, total, percentage, passed } = body;

    // Initialize SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Generator Technician Test Results</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Test Results for ${name}</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: ${passed ? '#27ae60' : '#e74c3c'}; font-size: 24px;">
              ${passed ? '✓ PASSED' : '✗ NOT PASSED'}
            </h3>
            <p style="font-size: 32px; font-weight: bold; color: #333; margin: 10px 0;">
              ${percentage}%
            </p>
            <p style="color: #666;">
              Score: ${score} out of ${total} questions correct
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h4 style="color: #333; margin-top: 0;">Test Information</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Name:</td>
                <td style="padding: 8px 0; font-weight: bold;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Email:</td>
                <td style="padding: 8px 0; font-weight: bold;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Phone:</td>
                <td style="padding: 8px 0; font-weight: bold;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Branch:</td>
                <td style="padding: 8px 0; font-weight: bold;">${branch}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Skill Level:</td>
                <td style="padding: 8px 0; font-weight: bold;">${skillLevel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Date:</td>
                <td style="padding: 8px 0; font-weight: bold;">${new Date().toLocaleDateString()}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">Generator Source</p>
          <p style="margin: 5px 0; font-size: 12px; color: #999;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      </div>
    `;

    // Send email to applicant
    await sgMail.send({
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME
      },
      subject: `Generator Technician Test Results - ${passed ? 'PASSED' : 'NOT PASSED'}`,
      html: emailHtml
    });

    // Send notification to company
    await sgMail.send({
      to: process.env.SENDGRID_FROM_EMAIL,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME
      },
      subject: `New Test Submission: ${name} - ${passed ? 'PASSED' : 'NOT PASSED'}`,
      html: emailHtml
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Results sent successfully' })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email', details: error.message })
    };
  }
};
