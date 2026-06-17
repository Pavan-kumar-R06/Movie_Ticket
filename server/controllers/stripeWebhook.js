// import stripe from "stripe";
// import Booking from '../models/Booking.js';

// console.log("STRIPE WEBHOOK HIT");
// export const stripeWebhooks = async (request, response)=>{
    
// console.log("STRIPE WEBHOOK HIT");
//     const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
//     const sig = request.headers["stripe-signature"];
//     let event;
//     // try{
//     //     event = stripeInstance.webhooks.constructEvent(request.body, sig, process.
//     //     env.STRIPE_WEBHOOK_SECRET)
//     //     console.log("Event Type:", event.type);
//     //     } catch (error){
  
//     //         return response.status(400).send(`Webhook Error:${error.message}`);
//     // }
//     try {
//     event = stripeInstance.webhooks.constructEvent(
//         request.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET
//     );

//     console.log("Webhook verified");
//     console.log("Event Type:", event.type);

// } catch (error) {
//     console.log("WEBHOOK VERIFY ERROR:", error.message);

//     return response.status(400).send(
//         `Webhook Error: ${error.message}`
//     );
// }
//     try{
//     switch (event.type){
// case "payment_intent.succeeded": {

//     const paymentIntent = event.data.object;

//     const sessionList = await stripeInstance.checkout.sessions.list({
//         payment_intent: paymentIntent.id
//     });

//     if (!sessionList.data.length) {
//         console.log("No session found");
//         break;
//     }

//     const session = sessionList.data[0];

//     const { bookingId } = session.metadata;

//     console.log("Session List:", sessionList.data);
//     console.log("Booking ID:", bookingId);

//     await Booking.findByIdAndUpdate(
//         bookingId,
//         {
//             isPaid: true,
//             paymentLink: ""
//         }
//     );

//     console.log("Booking Updated");

//     break;
// }
// case "payment_intent.succeeded": {
// console.log("Session List:", sessionList.data);
// console.log("Booking ID:", bookingId);
//     const paymentIntent = event.data.object;

//     const sessionList = await stripeInstance.checkout.sessions.list({
//         payment_intent: paymentIntent.id
//     });

//     if (!sessionList.data.length) {
//         break;
//     }

//     const session = sessionList.data[0];

//     const { bookingId } = session.metadata;

//     console.log("Booking ID:", bookingId);

//     await Booking.findByIdAndUpdate(
//         bookingId,
//         {
//             isPaid: true,
//             paymentLink: ""
//         }
//     );

//     break;
// }
//     default:
//     console.log('Unhandled event type:', event.type)
//     }
// response.json({received: true})
// }
//     catch (err){
//         console.error("webhook processing error:", err);
//         response.status(500).send("Internal Server Error");
// }}/


import stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebhooks = async (request, response) => {
  console.log("STRIPE WEBHOOK HIT");

  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("Webhook verified");
    console.log("Event Type:", event.type);
  } catch (error) {
    console.log("WEBHOOK VERIFY ERROR:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        console.log("Payment Intent Succeeded");

        const paymentIntent = event.data.object;

        const sessionList =
          await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntent.id,
          });

        if (!sessionList.data.length) {
          console.log("No session found");
          break;
        }

        const session = sessionList.data[0];

        console.log("Session:", session);

        const { bookingId } = session.metadata;

        console.log("Booking ID:", bookingId);

        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: "",
        });

        console.log("Booking Updated Successfully");

        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    response.json({ received: true });
  } catch (error) {
    console.error("Webhook Processing Error:", error);
    response.status(500).send("Internal Server Error");
  }
};