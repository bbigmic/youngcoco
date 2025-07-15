import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  // Dla localhost - pomiń weryfikację webhook
  const isLocalhost = process.env.NODE_ENV === 'development';
  
  if (!signature && !isLocalhost) {
    return NextResponse.json({ error: 'Brak podpisu' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    if (isLocalhost) {
      // Dla localhost - parsuj event bez weryfikacji
      event = JSON.parse(body) as Stripe.Event;
    } else {
      // Dla produkcji - weryfikuj podpis
      event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
    }
  } catch (err) {
    console.error('Błąd weryfikacji webhook:', err);
    return NextResponse.json({ error: 'Nieprawidłowy podpis' }, { status: 400 });
  }

  // Obsługa różnych typów zdarzeń
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Płatność zakończona:', session.id);
      console.log('Webhook metadata:', session.metadata);
      // Webhook nie zapisuje zamówień - to robi strona konfirmacji
      break;
    
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Płatność udana:', paymentIntent.id);
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('Płatność nieudana:', failedPayment.id);
      break;
    
    default:
      console.log(`Nieobsługiwane zdarzenie: ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 