# Backend Application README

## Setting Up and Running the Application

1. **Clone the Repository**
   - Clone the backend repository to your local machine.

2. **Install Dependencies**
   - Run `npm install` in the project directory to install required dependencies.

3. **Environment Configuration**
   - Create a `.env` file in the project root.
   - Define the following environment variables:
     - `DATABASE`: Your MongoDB connection URL.
     - `ZAP_WEBHOOK`: The URL for the Zapier webhook.

4. **Zapier Webhook Setup**
   - Log into [Zapier](https://zapier.com/).
   - Create a new Zap with "Catch Hook" in "Webhooks by Zapier".
   - Set up an action to send an email.
   - Copy the webhook URL provided by Zapier into the `.env` file.

5. **Starting the Server**
   - Run `npm start` to start the server.

## Features

- **Google OAuth Integration**: For user authentication.
- **CRUD Operations**: Manage tasks or other entities through Create, Read, Update, Delete (CRUD) functionalities.
- **Usage and Billing API**: To track and bill user activities.
- **Automated Invoice Generation**: Utilizes a cron job (`node-cron`) to trigger the Zapier webhook monthly, sending invoices via email.

## Additional Notes

- Ensure MongoDB and Zapier configurations are correctly set up.
- The server utilizes Express.js and connects to MongoDB for data management.
- Regularly check server logs for any errors or issues.
