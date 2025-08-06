import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getLeadManager } from '../../src/lib/LeadManager';

interface SendEmailRequest {
  leadId: string;
  emailType: 'welcome' | 'follow_up' | 'report' | 'summary' | 'marketing';
  templateData?: Record<string, any>;
  customSubject?: string;
  customContent?: string;
}

interface EmailTemplate {
  subject: string;
  content: (data: any) => string;
}

// Email templates
const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  welcome: {
    subject: 'Welcome! Let\'s explore your AI opportunities',
    content: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to AI Assistant Pro</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome, ${data.name || 'there'}!</h1>
        <p>Thank you for exploring AI solutions with us</p>
    </div>
    <div class="content">
        <p>Hi ${data.name || 'there'},</p>
        
        <p>Thank you for your interest in AI solutions! I'm excited to help you discover how artificial intelligence can transform your business.</p>
        
        <p>Based on our conversation, I understand you're looking to:</p>
        <ul>
            ${data.goals ? data.goals.map((goal: string) => `<li>${goal}</li>`).join('') : '<li>Explore AI opportunities for your business</li>'}
        </ul>
        
        <p>I've prepared a personalized analysis based on our discussion. This includes:</p>
        <ul>
            <li>🎯 Tailored AI recommendations for your specific needs</li>
            <li>📊 ROI projections and implementation roadmap</li>
            <li>🚀 Next steps to get started</li>
        </ul>
        
        <a href="${data.reportUrl || '#'}" class="cta">View Your Personalized Report</a>
        
        <p>I'm here to answer any questions you might have. Feel free to reply to this email or schedule a follow-up call.</p>
        
        <p>Best regards,<br>
        AI Assistant Pro Team</p>
    </div>
    <div class="footer">
        <p>This email was sent because you interacted with our AI assistant. If you have any questions, please reply to this email.</p>
    </div>
</body>
</html>
    `
  },
  
  follow_up: {
    subject: 'Following up on your AI consultation',
    content: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Follow-up: Your AI Journey</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .highlight { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
        .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Let's continue your AI journey</h1>
    </div>
    <div class="content">
        <p>Hi ${data.name || 'there'},</p>
        
        <p>I wanted to follow up on our recent conversation about AI solutions for ${data.company || 'your business'}.</p>
        
        <div class="highlight">
            <h3>Key Takeaways from Our Discussion:</h3>
            ${data.summary || '<p>We discussed various AI opportunities and how they could benefit your specific use case.</p>'}
        </div>
        
        <p>Based on our conversation, I believe there are immediate opportunities to:</p>
        <ul>
            ${data.recommendations ? data.recommendations.map((rec: string) => `<li>${rec}</li>`).join('') : '<li>Implement AI solutions that align with your goals</li>'}
        </ul>
        
        <p>I'd love to schedule a brief follow-up call to discuss the next steps and answer any questions you might have.</p>
        
        <a href="${data.calendlyUrl || '#'}" class="cta">Schedule a Follow-up Call</a>
        
        <p>Or feel free to reply to this email with any questions.</p>
        
        <p>Looking forward to helping you succeed with AI!</p>
        
        <p>Best regards,<br>
        AI Assistant Pro Team</p>
    </div>
</body>
</html>
    `
  },
  
  report: {
    subject: 'Your personalized AI analysis report is ready',
    content: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your AI Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .report-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Your AI Analysis Report</h1>
        <p>Personalized insights and recommendations</p>
    </div>
    <div class="content">
        <p>Hi ${data.name || 'there'},</p>
        
        <p>I've completed your personalized AI analysis! This comprehensive report includes tailored recommendations based on our conversation.</p>
        
        <div class="report-summary">
            <h3>Report Highlights:</h3>
            <ul>
                <li>🎯 <strong>Customized AI Strategy:</strong> Specific to ${data.company || 'your business'}</li>
                <li>💰 <strong>ROI Projections:</strong> Expected returns on AI investments</li>
                <li>🛣️ <strong>Implementation Roadmap:</strong> Step-by-step action plan</li>
                <li>⚡ <strong>Quick Wins:</strong> Immediate opportunities to get started</li>
            </ul>
        </div>
        
        ${data.reportSummary ? `<p><strong>Executive Summary:</strong><br>${data.reportSummary}</p>` : ''}
        
        <a href="${data.reportUrl || '#'}" class="cta">Download Your Full Report</a>
        
        <p>This report is specifically tailored to your needs and includes actionable insights you can implement immediately.</p>
        
        <p>I'm available to discuss the findings and help you take the next steps. Would you like to schedule a brief call to go through the recommendations together?</p>
        
        <p>Best regards,<br>
        AI Assistant Pro Team</p>
    </div>
</body>
</html>
    `
  },
  
  summary: {
    subject: 'Conversation summary: Your AI consultation',
    content: (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Conversation Summary</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .summary-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📝 Conversation Summary</h1>
    </div>
    <div class="content">
        <p>Hi ${data.name || 'there'},</p>
        
        <p>Thank you for the engaging conversation! Here's a summary of what we discussed:</p>
        
        <div class="summary-box">
            <h3>Discussion Summary:</h3>
            ${data.summary || '<p>We had a productive conversation about AI opportunities and solutions.</p>'}
        </div>
        
        ${data.keyPoints && data.keyPoints.length > 0 ? `
        <div class="summary-box">
            <h3>Key Points:</h3>
            <ul>
                ${data.keyPoints.map((point: string) => `<li>${point}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        ${data.actionItems && data.actionItems.length > 0 ? `
        <div class="summary-box">
            <h3>Next Steps:</h3>
            <ul>
                ${data.actionItems.map((item: string) => `<li>${item}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        <p>If you have any questions or would like to continue our discussion, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>
        AI Assistant Pro Team</p>
    </div>
</body>
</html>
    `
  }
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { 
      leadId, 
      emailType, 
      templateData = {},
      customSubject,
      customContent 
    }: SendEmailRequest = req.body;

    // Validation
    if (!leadId || !emailType) {
      return res.status(400).json({
        success: false,
        error: 'Lead ID and email type are required'
      });
    }

    if (!['welcome', 'follow_up', 'report', 'summary', 'marketing'].includes(emailType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email type'
      });
    }

    // Initialize services
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Resend API key not configured'
      });
    }

    const resend = new Resend(resendApiKey);
    const leadManager = getLeadManager();

    // Get lead data
    const lead = await leadManager.getLeadWithConversations(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    // Prepare email data
    const emailData = {
      name: lead.name,
      email: lead.email,
      company: lead.company,
      ...templateData
    };

    // Get template or use custom content
    let subject: string;
    let htmlContent: string;

    if (customContent && customSubject) {
      subject = customSubject;
      htmlContent = customContent;
    } else {
      const template = EMAIL_TEMPLATES[emailType];
      if (!template) {
        return res.status(400).json({
          success: false,
          error: 'Email template not found'
        });
      }
      
      subject = customSubject || template.subject;
      htmlContent = template.content(emailData);
    }

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'AI Assistant Pro <noreply@aiassistantpro.com>',
      to: [lead.email],
      subject: subject,
      html: htmlContent,
    });

    if (!emailResult.data) {
      throw new Error('Failed to send email via Resend');
    }

    // Log email in database
    const emailLog = await leadManager.logEmailSent({
      lead_id: leadId,
      conversation_id: lead.conversations?.[0]?.id, // Use most recent conversation
      email_type: emailType,
      recipient_email: lead.email,
      subject: subject,
      external_id: emailResult.data.id,
      metadata: {
        templateData: emailData,
        resendResponse: emailResult.data
      }
    });

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        emailId: emailLog.id,
        externalId: emailResult.data.id,
        recipient: lead.email,
        subject: subject,
        emailType: emailType,
        sentAt: emailLog.sent_at
      }
    });

  } catch (error) {
    console.error('Send email error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}