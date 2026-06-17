import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "movie-ticket-booking",
});

// Sync User Creation
const syncUserCreation = inngest.createFunction(
  {
    id: "user-created",
    triggers: [
      {
        event: "clerk/user.created",
      },
    ],
  },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    };

    await User.create(userData);
  }
);

// Sync User Deletion
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
    triggers: [
      {
        event: "clerk/user.deleted",
      },
    ],
  },
  async ({ event }) => {
    const { id } = event.data;

    await User.findByIdAndDelete(id);
  }
);

// Sync User Updation
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: [
      {
        event: "clerk/user.updated",
      },
    ],
  },
  async ({ event }) => {
    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
    } = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    };

    await User.findByIdAndUpdate(id, userData);
  }
);

const releaseSeatsAndDeleteBooking = inngest.createFunction(
  {
    id: "release-seats-delete-booking",
    triggers: [
      {
        event: "app/checkpayment",
      },
    ],
  },

  async ({ event, step }) => {
    console.log("FUNCTION STARTED");
    console.log("Event Data:", event.data);

    
    const tenMinutesLater = new Date(
  Date.now() + 30 * 1000
);

    await step.sleepUntil(
      "wait-for-10-minutes",
      tenMinutesLater
    );

    console.log("WAKE UP AFTER 10 MINUTES");

    await step.run(
      "check-payment-status",
      async () => {
        try {
          const bookingId = event.data.bookingId;

          console.log("Booking ID:", bookingId);

          const booking = await Booking.findById(
            bookingId
          );

          console.log("Booking:", booking);

          if (!booking) {
            console.log("Booking not found");
            return;
          }

          console.log(
            "Payment Status:",
            booking.isPaid
          );

          if (!booking.isPaid) {
            const show = await Show.findById(
              booking.show
            );

            if (!show) {
              console.log("Show not found");
              return;
            }

            console.log(
              "Occupied Seats Before:",
              show.occupiedSeats
            );

            booking.bookedSeats.forEach((seat) => {
              console.log(
                "Removing Seat:",
                seat
              );
              delete show.occupiedSeats[seat];
            });

            console.log(
              "Occupied Seats After:",
              show.occupiedSeats
            );

            show.markModified(
              "occupiedSeats"
            );

            await show.save();

            console.log(
              "Seats Released Successfully"
            );

            await Booking.findByIdAndDelete(
              booking._id
            );

            console.log(
              "Booking Deleted Successfully"
            );
          } else {
            console.log(
              "Booking already paid. No action required."
            );
          }
        } catch (error) {
          console.log(
            "Release Seats Error:",
            error.message
          );
        }
      }
    );
  }
);


// Export all functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  
releaseSeatsAndDeleteBooking,

];
console.log(
  "Functions loaded:",
  functions.map((fn) => fn.id)
);
console.log("Functions loaded:", functions.length);