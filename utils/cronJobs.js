import cron from 'node-cron';
import Ticket from '../models/Ticket.js';
import Notification from '../models/Notification.js';

export const startCronJobs = () => {
  // Run every hour to check for expired tickets
  // 0 * * * * = minute 0 of every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running ticket expiration cron job...');
    try {
      const currentDate = new Date();

      // Find tickets that need to be expired (for notification purposes)
      const expiringTickets = await Ticket.find({
        status: 'available',
        eventDate: { $lt: currentDate }
      }).select('_id title seller');

      // Update all matching tickets to expired
      const result = await Ticket.updateMany(
        { 
          status: 'available',
          eventDate: { $lt: currentDate }
        },
        { 
          $set: { status: 'expired' } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`Cron Job: Successfully expired ${result.modifiedCount} tickets.`);

        // Create notifications for each expired ticket's seller
        const notifications = expiringTickets.map(ticket => ({
          recipient: ticket.seller,
          type: 'system',
          title: 'Ticket Expired',
          message: `Your ticket "${ticket.title}" has been automatically expired because the event date has passed.`,
          relatedTicket: ticket._id,
        }));

        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
          console.log(`Cron Job: Sent ${notifications.length} expiry notifications.`);
        }
      }
    } catch (error) {
      console.error('Error in ticket expiration cron job:', error);
    }
  });
};
