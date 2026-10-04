"use client";

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  tagline?: string | null;
  size?: string | null;
  salePrice: number;
  compareAt?: number | null;
  unitCost: number;
  stockQty: number;
  lowStockLevel: number;
  image?: string | null;
  isActive: boolean;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELLED";

export interface OrderItem {
  id?: string;
  productId?: string;
  productName?: string;
  name?: string;
  qty: number;
  unitPrice: number;
}

export interface OrderEvent {
  status: OrderStatus;
  at?: string;
  createdAt?: string;
  reason?: string | null;
}

export interface Order {
  id: string;
  orderNo: string;
  createdAt: string;
  customerName: string;
  name?: string;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  address?: string | null;
  notes?: string | null;
  items: OrderItem[];
  itemsCount?: number;
  subtotal?: number;
  deliveryCharge?: number;
  discount?: number;
  total: number;
  payment?: string | null;
  paymentMethod?: string | null;
  status: OrderStatus;
  timeline?: OrderEvent[];
  history?: OrderEvent[];
}

export interface Investor {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

export interface ProductInvestor {
  id: string;
  productId: string;
  investorId: string;
  profitSharePct: number;
  investor?: { id?: string; name: string };
}

export interface Investment {
  id: string;
  productId?: string;
  investorId?: string;
  amount: number;
  investedAt?: string;
  createdAt?: string;
  notes?: string | null;
  investor?: { name?: string };
  product?: { name?: string };
}

export type ExpenseCategory =
  | "RAW_MATERIAL"
  | "PACKAGING"
  | "DELIVERY"
  | "MARKETING"
  | "SALARY"
  | "UTILITIES"
  | "OTHER";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  productId: string | null;
  amount: number;
  date: string;
  note?: string | null;
  product?: { name?: string } | null;
}

export interface Session {
  id: string;
  email: string;
  name?: string | null;
  role: "OWNER" | "STAFF";
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string | null;
  role: "OWNER" | "STAFF";
  createdAt?: string;
}

export interface InvestorPayout {
  investorId: string;
  name: string;
  amountInvested: number;
  sharePct: number;
  payout: number;
}

export interface ProductPnl {
  productId: string;
  productName: string;
  invested: number;
  expensesDirect: number;
  expensesByCategory: Record<string, number>;
  expensesGeneralAllocated: number;
  expensesTotal: number;
  revenue: number;
  deliveryCollected: number;
  discounts: number;
  collected: number;
  returnsLoss: number;
  returnedUnits: number;
  deliveredUnits: number;
  deliveredOrders: number;
  pipelineValue: number;
  pipelineOrders: number;
  net: number;
  operatingProfit: number;
  marginPct: number | null;
  roiPct: number | null;
  breakEvenUnits: number | null;
  investors: InvestorPayout[];
}

export interface GlobalPnl {
  products: ProductPnl[];
  totals: {
    invested: number;
    expenses: number;
    revenue: number;
    collected: number;
    returnsLoss: number;
    net: number;
    deliveredOrders: number;
    pipelineValue: number;
    pipelineOrders: number;
  };
}

export interface DashboardStats {
  kpis: {
    revenue: number;
    collected: number;
    expenses: number;
    invested: number;
    net: number;
    deliveredOrders: number;
    pipelineValue: number;
    visitors: number;
    lowStock: { id: string; name: string; sku?: string; stockQty: number; lowStockLevel: number }[];
  };
  series: { daily: { date: string; revenue: number; expenses: number }[] };
  profitByProduct: { name: string; net: number }[];
  funnel: { status: string; count: number }[];
  visitors: { date: string; views: number }[];
}
