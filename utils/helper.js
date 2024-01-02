const axios = require("axios");
const User = require("../models/user"); // Path to your User model
const Bill = require("../models/bill"); // Path to your User model

function formatDateToDDMMYYYY(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is zero-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

exports.generateAndSendInvoice=async (user)=> {
    const billingDate = new Date(); // Current date as the billing date
    const nextStartDate = new Date(billingDate); // Copy billing date
    nextStartDate.setDate(billingDate.getDate() + 1); // Increment by one day for next start date

    console.log("hey1")

    // Aggregate the action counts
    const aggregatedData = user.actionLogs.reduce(
      (acc, log) => {
        if (log.actionType === "POST") {
          acc.created = (acc.created || 0) + 1;
        } else if (log.actionType === "PUT") {
          acc.updated = (acc.updated || 0) + 1;
        } else if (log.actionType === "DELETE") {
          acc.deleted = (acc.deleted || 0) + 1;
        }
        return acc;
      },
      { created: 0, updated: 0, deleted: 0 }
    );

    console.log("hey2")

    const webhookPayload = {
        userEmail: user.email,
        totalAmount: user.currentAmount,
        startDate: formatDateToDDMMYYYY(user.startDate),
        billingDate: formatDateToDDMMYYYY(billingDate),
        createdCount: aggregatedData.created,
        updatedCount: aggregatedData.updated,
        deletedCount: aggregatedData.deleted,
        
    };

    try {
        await axios.post(process.env.ZAP_WEBHOOK, webhookPayload);
        console.log("Invoice sent for user:", user.email);

        // Reset user's billing data and set startDate to the next day
        user.currentAmount = 0;
        user.actionCount = 0;
        user.actionLogs = [];
        user.startDate = nextStartDate;
        await user.save();
    } catch (error) {
        console.error('Error sending invoice:', error);
    }
}

exports.sendInvoice = async () => {
  try {
    const users = await User.find({ currentAmount: { $gt: 0 } });

    for (const user of users) {
      const billingAmount = user.currentAmount;

      // Aggregate the action counts
      const aggregatedData = user.actionLogs.reduce(
        (acc, log) => {
          if (log.actionType === "POST") {
            acc.created = (acc.created || 0) + 1;
          } else if (log.actionType === "PUT") {
            acc.updated = (acc.updated || 0) + 1;
          } else if (log.actionType === "DELETE") {
            acc.deleted = (acc.deleted || 0) + 1;
          }
          return acc;
        },
        { created: 0, updated: 0, deleted: 0 }
      );

      // Prepare the payload for the webhook
      const webhookPayload = {
        name: user.name,
        userEmail: user.email,
        totalAmount: billingAmount,
        startDate: formatDateToDDMMYYYY(user.startDate),
        billingDate: formatDateToDDMMYYYY(new Date()),
        createdCount: aggregatedData.created,
        updatedCount: aggregatedData.updated,
        deletedCount: aggregatedData.deleted,
      };

      // Trigger Zapier webhook
      await axios.post(
        "process.env.ZAP_WEBHOOK",
        webhookPayload
      );

      // Reset user's billing cycle and set startDate to the first of next month
      user.currentAmount = 0;
      user.actionCount = 0;
      user.actionLogs = [];
      user.startDate = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        1
      );
      await user.save();

      console.log(
        "Invoice sent and user billing data reset for user:",
        user.email
      );
    }
  } catch (error) {
    console.error("Error in monthly billing cron job:", error);
  }
};

const COST_PER_ACTION = {
  GET: 0, // Assuming 'GET' requests are free
  POST: 0.1, // Example cost for 'POST' request
  PUT: 0.2, // Example cost for 'PUT' request
  DELETE: 0, // Assuming 'DELETE' requests are free
};

exports.billUpdater = async (req, res, next) => {
  const userId = req.params.userId;
  const actionType = req.method;

  try {
    // Fetch the user document
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Add the action log
    user.actionLogs.push({ actionType, date: new Date() });

    // Increment the action count and update the current amount
    user.actionCount += 1;
    const actionCost = COST_PER_ACTION[actionType] || 0;
    user.currentAmount += actionCost;

    // Save the updated user document
    await user.save();
  } catch (err) {
    console.error("Error recording user action:", err);
  }
  next();
};
