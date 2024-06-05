const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();




const sendConfirmationEmail = async(email, password) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });
        // Calculate the expiry timestamp (48 hours from now)
        const expiryTimestamp = new Date().getTime() + 48 * 60 * 60 * 1000;
        // Convert the timestamp to a string and encode it
        const encodedExpiryTimestamp = encodeURIComponent(expiryTimestamp.toString());

        console.log(email, "asdasdas");
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Registration Confirmation - Cropton Services',

            html: `<!DOCTYPE html>
           <html lang="en">
           <head>
               <meta charset="UTF-8">
               <meta name="viewport" content="width=device-width, initial-scale=1.0">
               <title>Confirmation Email</title>
               <style>
                   body {
                       font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                       line-height: 1.6;
                       color: #333;
                       margin: 0;
                       padding: 0;
                       background-color: #f8f8f8;
                   }
                   .container {
                       max-width: 600px;
                       margin: 0 auto;
                       background-color: #fff;
                       border-radius: 5px;
                       overflow: hidden;
                       box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                   }
                   .header {
                       background-color: #65D088;
                       padding: 20px;
                       text-align: center;
                       color: #fff;
                   }
                   .content {
                       padding: 20px;
                   }
                   h2 {
                       color: #fff;
                       margin: 0;
                   }
                   p {
                       margin: 0 0 15px;
                   }
                   .link {
                       color: #007bff;
                       text-decoration: none;
                       font-weight: bold;
                   }
                   .link:hover {
                       text-decoration: underline;
                   }
                   .company-info {
                       background-color: #65D088;
                       color: #fff;
                       padding: 20px;
                       text-align: center;
                       margin-top: 20px;
                   }
                   .company-info p:first-child {
                       color: #ffeb3b; /* Yellow color for mail id */
                   }
               </style>
           </head>
           <body>
               <div class="container">
                   <div class="header">
                       <h2>Cropton Services</h2>
                   </div>
                   <div class="content">
                       <p>Dear User,</p>
                       <p>Thank you for choosing Cropton Services. You have been successfully registered for the Data Entry Services.</p>
                       <p><a href="https://croptonservice.netlify.app/stamppaper" class="link">Submit Your Agreement Form</a>
                      </p>
                   </div>
                   <div class="company-info">
                       <p>Company Information:</p>
                       <p style="color: #ffffff;">Helpline mail id: helplinessrvice156@gmail.com</p> <!-- Yellow color for mail id -->
                       <p>Helpline No: 9764841890</p> <!-- Default white color for phone number -->
                   </div>
               </div>
           </body>
           </html>
           `
        };
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

module.exports = sendConfirmationEmail;

// <a href="https://stamppapers.netlify.app/"> here</a>
