# Email Setup for Review Approval

## Gmail Setup (Recommended)

1. **Create Gmail App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

2. **Update server.js:**
   ```javascript
   const transporter = nodemailer.createTransporter({
     service: 'gmail',
     auth: {
       user: 'your-gmail@gmail.com',        // Your Gmail
       pass: 'your-16-digit-app-password'   // Generated app password
     }
   });

   const ADMIN_EMAIL = 'iliceumuhoza11@gmail.com'; // Ilyce's email
   ```

## How It Works

1. **Customer submits review** → Saved as "pending" (approved = 0)
2. **Email sent to Ilyce** with review details and approval button
3. **Ilyce clicks "Approve Review"** in email
4. **Review becomes live** on website (approved = 1)

## Email Template

Ilyce receives:
- Customer name and email
- Star rating
- Review text
- One-click approval button

## Test Setup

For testing, use:
```javascript
const ADMIN_EMAIL = 'your-test-email@gmail.com';
```

Then submit a review and check your email for the approval link.