import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' });

export async function POST(req: Request) {
  const { orderData, successUrl, cancelUrl } = await req.json();

  // Oblicz cenę w groszach (Stripe wymaga wartości w groszach)
  const totalInCents = Math.round(orderData.total * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'pln',
          product_data: {
            name: `Young COCO woda kokosowa - ${orderData.variant} sztuk`,
            // Usuwam images, bo wymagają pełnego URL HTTPS
          },
          unit_amount: totalInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    customer_email: orderData.email,
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      orderId: orderData.orderId,
      customerName: `${orderData.firstName} ${orderData.lastName}`,
      customerEmail: orderData.email,
      customerPhone: orderData.phone,
      deliveryAddress: orderData.address,
      deliveryCity: orderData.city,
      deliveryZipCode: orderData.zipCode,
      variant: orderData.variant.toString(),
      quantity: orderData.quantity.toString(),
      price: orderData.price.toString(),
      delivery: orderData.delivery,
      payment: orderData.payment,
      consent1: orderData.consent1.toString(),
      consent2: orderData.consent2.toString(),
      companyName: orderData.companyName || '',
      nip: orderData.nip || '',
      invoiceAddress: orderData.invoiceAddress || '',
    },
  });

  return NextResponse.json({ id: session.id, url: session.url });
} 