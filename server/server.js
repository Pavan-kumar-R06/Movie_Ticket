// // import express from 'express';
// // import cors from 'cors';
// // import 'dotenv/config';
// // import connectDB from './configs/db.js';
// // import { clerkMiddleware } from '@clerk/express'
// // import { serve } from "inngest/express";
// // import { inngest, functions } from "./inngest/index.js"
// // import showRouter from './routes/showRoutes.js';
// // import bookingRouter from './routes/bookingRoutes.js';
// // import adminRouter from './routes/adminRoutes.js';
// // import userRouter from './routes/userRoutes.js';
// // import { stripeWebhooks } from './controllers/stripeWebhook.js';


// // const app=express();
// // const port=3000;
// // app.use(
// //   "/api/inngest",
// //   serve({
// //     client: inngest,
// //     functions,
// //   })
// // );

// // app.use('/api/stripe',
// //   express.raw({ type: 'application/json' }),
// //   stripeWebhooks
// // );


// // app.use(express.json())
// // app.use(cors())
// // app.use(clerkMiddleware())
// // await connectDB()
// // app.get('/',(req,res)=>
// //     res.send('Server is Live')
// // )


// // app.use('/api/show',showRouter)
// // app.use('/api/booking',bookingRouter)
// // app.use('/api/admin',adminRouter)
// // app.use('/api/user',userRouter)


// // app.listen(port,()=>console.log(`Server listening at http://localhost:${port}`));


// import express from 'express';
// import cors from 'cors';
// import 'dotenv/config';
// import connectDB from './configs/db.js';
// import { clerkMiddleware } from '@clerk/express'
// import { serve } from "inngest/express";
// import { inngest, functions } from "./inngest/index.js"
// import showRouter from './routes/showRoutes.js';
// import bookingRouter from './routes/bookingRoutes.js';
// import adminRouter from './routes/adminRoutes.js';
// import userRouter from './routes/userRoutes.js';
// import { stripeWebhooks } from './controllers/stripeWebhook.js';

// const app = express();
// const port = 3000;

// // 1. Connect Database immediately
// await connectDB();

// // 2. Global Enable CORS
// app.use(cors());

// // 3. Public Webhook & Background Worker Routes (MUST be before any parsers or Auth middlewares)
// // app.use(
// //   "/api/inngest",
// //   serve({
// //     client: inngest,
// //     functions,
// //   })
// // );
// app.use(
//   "/api/inngest",
//   serve({
//     client: inngest,
//     functions,
//     signingKey: process.env.INNGEST_SIGNING_KEY, 
//     // This allows local dev mode to skip strict authentication handshakes:
//     allowAnonymousEncryption: true 
//   })
// );

// app.use('/api/stripe',
//   express.raw({ type: 'application/json' }),
//   stripeWebhooks
// );

// // 4. Standard Body Parsers (Only applies to standard application routes below)
// app.use(express.json());

// // 5. Clerk Auth Middleware (Applies to all application routers declared below it)
// app.use(clerkMiddleware());

// // 6. Application Routes
// app.get('/', (req, res) => res.send('Server is Live'));

// app.use('/api/show', showRouter);
// app.use('/api/booking', bookingRouter);
// app.use('/api/admin', adminRouter);
// app.use('/api/user', userRouter);

// app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import { stripeWebhooks } from './controllers/stripeWebhook.js';

const app = express();
const port = 3000;

// 1. Connect Database
await connectDB();

// 2. Enable CORS
app.use(cors());

// 3. Stripe Webhook (MUST be above express.json() because it needs the raw request body)
app.use('/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhooks
);

// 4. Global JSON Body Parser (MUST be above Inngest so Inngest can read req.body)
app.use(express.json());

// 5. Inngest Serve Handler (Bypasses Clerk, but gets the parsed JSON body from step 4)
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  })
);

// 6. Clerk Auth Middleware (Protects standard application routes below it)
app.use(clerkMiddleware());

// 7. Application Routes
app.get('/', (req, res) => res.send('Server is Live'));

app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));