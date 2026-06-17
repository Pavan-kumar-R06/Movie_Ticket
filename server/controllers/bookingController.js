//function to check availability of selected seats for a movie

import Show from "../models/Show.js"
import Movie from "../models/Movie.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import stripe from 'stripe'
import { inngest } from "../inngest/index.js";

const checkSeatsAvailability = async (showId, selectedSeats)=>{
    try {
        const showData = await Show.findById(showId)
        if(!showData) return false;

        const occupiedSeats = showData.occupiedSeats;
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;}

        catch (error){
        console.log(error.message);
    return false;
        }}


export const createBooking = async(req, res)=>{

try {

    const {userId} = req.auth();
    const {showId, selectedSeats} = req.body;
    const { origin } = req.headers;

// Check if the seat is available for the selected show
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats)
    if(!isAvailable){
    return res.json({success: false, message:"Selected Seats are not available."})}

// Get the show details
    const showData = await Show.findById(showId).populate('movie');
    // Create a new booking

    const booking = await Booking.create({
        user: userId,
        show: showId,
        amount: showData.showPrice * selectedSeats.length,
        bookedSeats: selectedSeats
        })
    // selectedSeats.map((seat)=>{
    // })
    // showData.markModified('occupiedSeats');
    // await showData.save();
//     selectedSeats.forEach((seat) => {
//     showData.occupiedSeats[seat] = userId;
// });
// showData.occupiedSeats[seat] = booking._id;
// showData.markModified("occupiedSeats");
// await showData.save();

selectedSeats.forEach((seat) => {
    showData.occupiedSeats[seat] = booking._id;
});

showData.markModified("occupiedSeats");
await showData.save();
 const stripeInstance=new stripe(process.env.STRIPE_SECRET_KEY)
 const line_items=[{
    price_data:{
        currency:'aud',
        product_data:{
            name:showData.movie.title
        },
        unit_amount:Math.floor(booking.amount)*100
    },
    quantity:1
 }]

 const session = await stripeInstance.checkout.sessions.create({
    success_url:`${origin}/loading/my-bookings`,
    cancel_url:`${origin}/my-bookings`,
    line_items: line_items,
    mode:'payment',
    metadata:{
        bookingId: booking._id.toString()},
        expires_at: Math.floor(Date.now()/ 1000)+ 30 * 60, // Expires in 30 minutes
    })
    
    booking.paymentLink = session.url
    await booking.save()

    // Run Inngest Sheduler Function to check payment status after 10 minutes
   

console.log("Sending Inngest event...");

await inngest.send({
  name: "app/checkpayment",
  data: {
    bookingId: booking._id.toString(),
  },
});

console.log("Inngest event sent successfully");
    res.json({success: true, url:session.url})
    
}
    catch (error){
        console.log(error.message);
    res.json({success: false, message:error.message})
    }

}   

export const getoccupiedSeats = async (req, res)=>{

    try{
    const {showId} = req.params;
    const showData = await Show.findById(showId)
    const occupiedSeats = Object.keys(showData.occupiedSeats)
    res.json({success: true, occupiedSeats})
    } catch (error){
    console.log(error.message);
    res.json({success: false, message: error.message})
}
}