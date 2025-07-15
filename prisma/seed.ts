import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Produkty
  const product1 = await prisma.product.create({
    data: {
      name: 'Young Coco 330 ml',
      price: 12900,
      imageUrl: '/can.png',
    },
  });
  const product2 = await prisma.product.create({
    data: {
      name: 'Young Coco premium',
      price: 12900,
      imageUrl: '/can.png',
    },
  });

  // Klient
  const customer = await prisma.customer.create({
    data: {
      firstName: 'Magdalena',
      lastName: 'Wierzbicka',
      email: 'user@user435.pl',
      phone: '+48 765 435 231',
      address: 'Skarżyńskiego 12d/18',
      city: 'Gdańsk',
      zipCode: '80-963',
    },
  });

  // Zamówienie
  await prisma.order.create({
    data: {
      customerId: customer.id,
      status: 'paid',
      total: 51600,
      delivery: 'Kurier',
      deliveryCost: 1499,
      payment: 'stripe',
      stripeSessionId: 'cs_test_123',
      orderItems: {
        create: [
          { productId: product1.id, quantity: 24, price: 12900 },
          { productId: product2.id, quantity: 48, price: 12900 },
        ],
      },
    },
  });
}

main().finally(() => prisma.$disconnect()); 