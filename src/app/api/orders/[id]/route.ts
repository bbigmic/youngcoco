import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    const orderId = parseInt(id);

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (e) {
    return NextResponse.json({ error: 'Błąd aktualizacji zamówienia', details: e }, { status: 500 });
  }
} 