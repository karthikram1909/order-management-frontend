export interface Product {
  id: string;
  name: string;
  description: string;
  unit: string;
  imageUrl?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  items: OrderItem[];
  status: "pending_pricing" | "quote_sent" | "confirmed" | "in_transit" | "delivered" | "completed" | "overdue";
  createdAt: string;
  updatedAt: string;
  total?: number;
  paymentDue?: string;
}

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Premium Steel Rods",
    description: "High-quality steel rods for construction, corrosion-resistant",
    unit: "kg",
  },
  {
    id: "p2",
    name: "Cement Portland",
    description: "Grade 43 Portland cement, ideal for general construction",
    unit: "bag",
  },
  {
    id: "p3",
    name: "Sand (Fine)",
    description: "Fine-grain river sand, washed and filtered",
    unit: "ton",
  },
  {
    id: "p4",
    name: "Bricks (Red)",
    description: "Standard size red clay bricks, high durability",
    unit: "1000 pcs",
  },
  {
    id: "p5",
    name: "Aggregate (20mm)",
    description: "Crushed stone aggregate, 20mm size for concrete",
    unit: "ton",
  },
  {
    id: "p6",
    name: "TMT Bars 12mm",
    description: "Thermo-mechanically treated steel bars, Fe-500 grade",
    unit: "ton",
  },
];

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    clientName: "Rajesh Kumar",
    clientPhone: "+91 98765 43210",
    items: [
      { productId: "p1", productName: "Premium Steel Rods", quantity: 500, unit: "kg", unitPrice: 65 },
      { productId: "p2", productName: "Cement Portland", quantity: 100, unit: "bag", unitPrice: 350 },
    ],
    status: "pending_pricing",
    createdAt: "2024-01-15T09:30:00Z",
    updatedAt: "2024-01-15T09:30:00Z",
  },
  {
    id: "ORD-002",
    clientName: "Priya Sharma",
    clientPhone: "+91 87654 32109",
    items: [
      { productId: "p3", productName: "Sand (Fine)", quantity: 10, unit: "ton", unitPrice: 1200 },
      { productId: "p4", productName: "Bricks (Red)", quantity: 5, unit: "1000 pcs", unitPrice: 7500 },
      { productId: "p5", productName: "Aggregate (20mm)", quantity: 8, unit: "ton", unitPrice: 1500 },
    ],
    status: "quote_sent",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T16:45:00Z",
    total: 61500,
  },
  {
    id: "ORD-003",
    clientName: "Mohammed Ali",
    clientPhone: "+91 76543 21098",
    items: [
      { productId: "p6", productName: "TMT Bars 12mm", quantity: 2, unit: "ton", unitPrice: 55000 },
      { productId: "p2", productName: "Cement Portland", quantity: 50, unit: "bag", unitPrice: 345 },
    ],
    status: "confirmed",
    createdAt: "2024-01-13T11:00:00Z",
    updatedAt: "2024-01-14T08:15:00Z",
    total: 127250,
    paymentDue: "2024-01-28",
  },
  {
    id: "ORD-004",
    clientName: "Sunita Patel",
    clientPhone: "+91 65432 10987",
    items: [
      { productId: "p1", productName: "Premium Steel Rods", quantity: 1000, unit: "kg", unitPrice: 62 },
    ],
    status: "in_transit",
    createdAt: "2024-01-12T16:30:00Z",
    updatedAt: "2024-01-14T10:00:00Z",
    total: 62000,
    paymentDue: "2024-01-26",
  },
  {
    id: "ORD-005",
    clientName: "Amit Verma",
    clientPhone: "+91 54321 09876",
    items: [
      { productId: "p3", productName: "Sand (Fine)", quantity: 15, unit: "ton", unitPrice: 1150 },
      { productId: "p5", productName: "Aggregate (20mm)", quantity: 12, unit: "ton", unitPrice: 1450 },
    ],
    status: "overdue",
    createdAt: "2024-01-05T10:15:00Z",
    updatedAt: "2024-01-10T14:30:00Z",
    total: 34650,
    paymentDue: "2024-01-12",
  },
  {
    id: "ORD-006",
    clientName: "Deepak Singh",
    clientPhone: "+91 43210 98765",
    items: [
      { productId: "p2", productName: "Cement Portland", quantity: 200, unit: "bag", unitPrice: 340 },
      { productId: "p4", productName: "Bricks (Red)", quantity: 10, unit: "1000 pcs", unitPrice: 7200 },
    ],
    status: "completed",
    createdAt: "2024-01-02T09:00:00Z",
    updatedAt: "2024-01-08T17:00:00Z",
    total: 140000,
  },
];

export const getStatusConfig = (status: Order["status"]) => {
  const configs = {
    pending_pricing: {
      label: "Pending Pricing",
      variant: "pending" as const,
      priority: 1,
    },
    quote_sent: {
      label: "Quote Sent",
      variant: "action" as const,
      priority: 2,
    },
    confirmed: {
      label: "Confirmed",
      variant: "success" as const,
      priority: 3,
    },
    in_transit: {
      label: "In Transit",
      variant: "action" as const,
      priority: 4,
    },
    delivered: {
      label: "Delivered",
      variant: "success" as const,
      priority: 5,
    },
    completed: {
      label: "Completed",
      variant: "success" as const,
      priority: 6,
    },
    overdue: {
      label: "Overdue",
      variant: "danger" as const,
      priority: 0,
    },
  };
  return configs[status];
};
