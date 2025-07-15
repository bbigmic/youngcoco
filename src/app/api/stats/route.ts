import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Statystyki ogólne
    const [
      totalOrders,
      newOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue,
      todayOrders,
      todayRevenue,
      thisMonthOrders,
      thisMonthRevenue,
      topCities,
      variantStats
    ] = await Promise.all([
      // Całkowita liczba zamówień
      prisma.order.count(),
      
      // Nowe zamówienia (status: "nowe")
      prisma.order.count({ where: { status: 'nowe' } }),
      
      // Zrealizowane zamówienia (status: "zrealizowane")
      prisma.order.count({ where: { status: 'zrealizowane' } }),
      
      // Całkowity przychód
      prisma.order.aggregate({
        _sum: { total: true }
      }),
      
      // Średnia wartość zamówienia
      prisma.order.aggregate({
        _avg: { total: true }
      }),
      
      // Zamówienia z dzisiaj
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Przychód z dzisiaj
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        _sum: { total: true }
      }),
      
      // Zamówienia z tego miesiąca
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // Przychód z tego miesiąca
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { total: true }
      }),
      
      // Top 5 miast
      prisma.order.groupBy({
        by: ['city'],
        _count: { city: true },
        _sum: { total: true },
        orderBy: { _count: { city: 'desc' } },
        take: 5
      }),
      
      // Statystyki wariantów
      prisma.order.groupBy({
        by: ['variant'],
        _count: { variant: true },
        _sum: { quantity: true, total: true }
      })
    ]);

    return NextResponse.json({
      totalOrders,
      newOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      averageOrderValue: averageOrderValue._avg.total || 0,
      todayOrders,
      todayRevenue: todayRevenue._sum.total || 0,
      thisMonthOrders,
      thisMonthRevenue: thisMonthRevenue._sum.total || 0,
      topCities,
      variantStats
    });
  } catch (e) {
    console.error('Error fetching stats:', e);
    return NextResponse.json({ error: 'Błąd pobierania statystyk', details: e }, { status: 500 });
  }
} 