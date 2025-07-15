import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const data = await req.json();
  console.log('Received order data:', data);
  
  // Oczekiwane dane: { firstName, lastName, email, phone, address, city, zipCode, companyName, nip, invoiceAddress, variant, quantity, price, total, delivery, payment, consent1, consent2 }
  try {
    const order = await prisma.order.create({
      data: {
        sessionId: data.sessionId || null,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        zipCode: data.zipCode,
        companyName: data.companyName,
        nip: data.nip,
        invoiceAddress: data.invoiceAddress,
        variant: parseInt(data.variant),
        quantity: parseInt(data.quantity),
        price: parseFloat(data.price),
        total: parseFloat(data.total),
        delivery: data.delivery,
        payment: data.payment,
        consent1: Boolean(data.consent1),
        consent2: Boolean(data.consent2),
      },
    });
    console.log('Order created successfully:', order);
    return NextResponse.json(order);
  } catch (e) {
    console.error('Error creating order:', e);
    return NextResponse.json({ error: 'Błąd zapisu zamówienia', details: e }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  
  // Jeśli podano sessionId, zwróć konkretne zamówienie
  if (sessionId) {
    try {
      const order = await prisma.order.findFirst({
        where: { sessionId },
      });
      
      if (!order) {
        return NextResponse.json({ error: 'Zamówienie nie znalezione' }, { status: 404 });
      }
      
      return NextResponse.json(order);
    } catch (e) {
      return NextResponse.json({ error: 'Błąd pobierania zamówienia', details: e }, { status: 500 });
    }
  }
  
  // Standardowe pobieranie listy zamówień
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') || undefined;
  const skip = (page - 1) * limit;

  try {
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Błąd pobierania zamówień', details: e }, { status: 500 });
  }
} 