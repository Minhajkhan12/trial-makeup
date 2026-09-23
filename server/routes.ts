import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post('/api/create-checkout-session', async (req, res) => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY.' });
    }

    const { email, artistId, artistName, trialPrice } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required.' });
    if (!artistId) return res.status(400).json({ error: 'Artist is required.' });

    const origin = req.headers.origin || 'https://trialmakeup.com';

    try {
      const stripe = new Stripe(secretKey);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: 'Bridal Trial Booking',
                description: `Trial session with ${artistName || 'your selected artist'}`,
              },
              unit_amount: 5000,
            },
            quantity: 1,
          },
        ],
        metadata: {
          email,
          artistId,
          artistName: artistName || '',
          trialPrice: String(trialPrice || 50),
        },
        success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}&artist_id=${encodeURIComponent(artistId)}`,
        cancel_url: `${origin}/saved`,
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
      console.error('Stripe error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/verify-session', async (req, res) => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) return res.status(500).json({ error: 'Stripe not configured.' });

    const { session_id } = req.query;
    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ error: 'session_id required.' });
    }

    try {
      const stripe = new Stripe(secretKey);
      const session = await stripe.checkout.sessions.retrieve(session_id);
      res.json({
        paid: session.payment_status === 'paid',
        email: session.customer_email,
        artistId: session.metadata?.artistId || '',
        artistName: session.metadata?.artistName || '',
        trialPrice: session.metadata?.trialPrice || '50',
        amountPaid: session.amount_total ? session.amount_total / 100 : 50,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return httpServer;
}
