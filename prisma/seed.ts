import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.order.create({
    data: {
      firstName: 'Jan',
      lastName: 'Kowalski',
      email: 'jan.kowalski@example.com',
      phone: '+48 123 456 789',
      address: 'ul. Przykładowa 1',
      city: 'Warszawa',
      zipCode: '00-001',
      variant: 24,
      quantity: 1,
      price: 105.36,
      total: 105.36,
      delivery: 'Kurier InPost',
      payment: 'stripe',
      status: 'nowe',
      consent1: true,
      consent2: false,
    },
  });
}

main().finally(() => prisma.$disconnect()); 