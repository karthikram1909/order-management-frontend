export interface Product {
    _id: string; // MongoDB ID
    itemName: string;
    description: string;
    unit: string;
    isActive: boolean;
}

export interface Client {
    _id: string;
    name: string;
    mobileNumber: string;
    address: string;
}

export interface OrderItem {
    itemId: string | Product; // Can be populated or ID
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
}

export interface Order {
    _id: string;
    clientId: string | Client;
    items: OrderItem[];
    orderStatus: string;
    paymentType: string;
    paymentStatus: string;
    deliveryStatus: string;
    cartTotal: number;
    createdAt: string;
}
