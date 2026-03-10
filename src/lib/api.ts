import { supabase } from './supabase';

// Helper to map Supabase 'id' to MongoDB-style '_id' and other field mappings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapFromDb = (data: any): any => {
    if (!data) return data;
    if (Array.isArray(data)) return data.map(mapFromDb);
    if (typeof data !== 'object') return data;

    const {
        id,
        client_id,
        clientId: joinedClientId,
        created_at,
        item_name,
        is_active,
        mobile_number,
        cart_total,
        image_url,
        order_status,
        payment_status,
        delivery_status,
        payment_type,
        credit_due_date,
        due_date,
        ...rest
    } = data;

    // Transform Google Drive URLs to be more embed-friendly
    const transformUrl = (url: any) => {
        if (!url || typeof url !== 'string') return url;

        // Extract ID from various Drive URL formats (d/ID, id=ID, etc.)
        const driveMatch = url.match(/(?:id=|d\/|thumbnail\?id=)([\w-]{20,100})/);
        if (driveMatch && driveMatch[1]) {
            const id = driveMatch[1];
            // Thumbnail endpoint is often faster and handles resizes
            return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
        }

        // If it's a generic link but no ID matched, return as is
        return url;
    };

    const mapped = {
        ...rest,
        _id: id,
        createdAt: created_at,
        ...(item_name !== undefined && { itemName: item_name }),
        ...(is_active !== undefined && { isActive: is_active }),
        ...(mobile_number !== undefined && { mobileNumber: mobile_number }),
        ...((cart_total !== undefined) && { totalOrderValue: cart_total, cartTotal: cart_total }), // Provide both for compatibility
        ...(image_url !== undefined && { imageUrl: transformUrl(image_url) }),
        ...(order_status !== undefined && { orderStatus: order_status }),
        ...(payment_status !== undefined && { paymentStatus: payment_status }),
        ...(delivery_status !== undefined && { deliveryStatus: delivery_status }),
        ...(payment_type !== undefined && { paymentType: payment_type }),
        ...(credit_due_date !== undefined && { creditDueDate: credit_due_date }),
        ...(due_date !== undefined && !credit_due_date && { creditDueDate: due_date }),
        clientId: mapFromDb(joinedClientId || client_id)
    };

    return mapped;
};

// Helper to map frontend camelCase to Supabase snake_case
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapToDb = (data: any): any => {
    if (!data || typeof data !== 'object') return data;
    const {
        _id,
        createdAt,
        itemName,
        isActive,
        mobileNumber,
        totalOrderValue,
        cartTotal,
        clientId,
        imageUrl,
        orderStatus,
        paymentStatus,
        deliveryStatus,
        paymentType,
        creditDueDate,
        ...rest
    } = data;

    return {
        ...rest,
        ...(itemName !== undefined && { item_name: itemName }),
        ...(isActive !== undefined && { is_active: isActive }),
        ...(mobileNumber !== undefined && { mobile_number: mobileNumber }),
        ...((totalOrderValue !== undefined || cartTotal !== undefined) && { cart_total: totalOrderValue || cartTotal }),
        ...(imageUrl !== undefined && { image_url: imageUrl }),
        ...(clientId !== undefined && { client_id: clientId }),
        ...(orderStatus !== undefined && { order_status: orderStatus }),
        ...(paymentStatus !== undefined && { payment_status: paymentStatus }),
        ...(deliveryStatus !== undefined && { delivery_status: deliveryStatus }),
        ...(paymentType !== undefined && { payment_type: paymentType }),
        ...(creditDueDate !== undefined && { credit_due_date: creditDueDate })
    };
};

// Products API
export const getProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('item_name');

    if (error) throw error;
    return mapFromDb(data);
};

export const addProduct = async (product: Record<string, unknown>) => {
    const { data, error } = await supabase
        .from('products')
        .insert(mapToDb(product))
        .select()
        .single();

    if (error) throw error;
    return mapFromDb(data);
};

export const updateProduct = async (id: string, product: Record<string, unknown>) => {
    const { data, error } = await supabase.from('products').update(mapToDb(product)).eq('id', id).select().single();
    if (error) throw error;
    return mapFromDb(data);
};

export const deleteProduct = async (id: string) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return { message: "Product deleted" };
};

// Auth API
export const adminLogin = async (email: string, password: string) => {
    // Bypass for specific admin user - WARNING: This does not authenticate with Supabase
    if (email === 'admin@gmail.com' && password === 'admin123') {
        const token = 'admin_bypass_token';
        localStorage.setItem('adminToken', token);
        console.warn("Using Administrative Bypass. Database write operations will fail because you are not authenticated with Supabase.");
        return {
            token,
            user: { email: 'admin@gmail.com' },
            isBypass: true
        };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const token = data.session?.access_token;
    const refreshToken = data.session?.refresh_token;

    if (token) localStorage.setItem('adminToken', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    return {
        token,
        refreshToken,
        user: data.user,
        isBypass: false
    };
};

export const requestOtp = async (mobileNumber: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone: mobileNumber });
    if (error) throw error;
    return { message: "OTP sent" };
};

export const verifyOtp = async (mobileNumber: string, otp: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
        phone: mobileNumber,
        token: otp,
        type: 'sms'
    });
    if (error) throw error;
    return {
        token: data.session?.access_token,
        user: data.user
    };
};

export const clientLogin = async (name: string, mobileNumber: string) => {
    // Check if client exists
    let { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('mobile_number', mobileNumber)
        .maybeSingle();

    if (error) throw error;

    if (!client) {
        // Create client if not exists
        const { data: newClient, error: createError } = await supabase
            .from('clients')
            .insert({ name, mobile_number: mobileNumber })
            .select()
            .single();

        if (createError) throw createError;
        client = newClient;
    }

    const token = 'supabase_managed_token'; // In a real app, you might use Supabase Auth token
    localStorage.setItem('clientToken', token);
    localStorage.setItem('clientInfo', JSON.stringify(mapFromDb(client)));

    return {
        token,
        client: mapFromDb(client)
    };
};

export const getClientHistory = async () => {
    const clientInfoStr = localStorage.getItem('clientInfo') || sessionStorage.getItem('clientInfo');
    if (!clientInfoStr) return [];

    const clientInfo = JSON.parse(clientInfoStr);
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            clients (*)
        `)
        .eq('client_id', clientInfo._id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return mapFromDb(data);
};

export const isClientLoggedIn = () => !!localStorage.getItem('clientToken');

export const submitInquiry = async (data: { name: string; mobileNumber: string; items: unknown[] }) => {
    // First ensure client exists (logic similar to clientLogin)
    const { name, mobileNumber, items } = data;

    let { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('mobile_number', mobileNumber)
        .maybeSingle();

    if (!client) {
        const { data: newClient } = await supabase
            .from('clients')
            .insert({ name, mobile_number: mobileNumber })
            .select('id')
            .single();
        client = newClient;
    }

    const { data: order, error } = await supabase
        .from('orders')
        .insert({
            client_id: client?.id,
            items: items,
            order_status: 'NEW_INQUIRY'
        })
        .select()
        .single();

    if (error) throw error;
    return mapFromDb(order);
};

// Admin Client Management
export const getClients = async () => {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

    if (error) throw error;
    return mapFromDb(data);
};

export const createOrder = async (orderData: { clientId: string; items: any[] }) => {
    const { data, error } = await supabase
        .from('orders')
        .insert({
            client_id: orderData.clientId,
            items: orderData.items,
            order_status: 'NEW_INQUIRY'
        })
        .select()
        .single();

    if (error) throw error;
    return mapFromDb(data);
};

// Orders API
export const getOrders = async () => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            clientId:clients (*)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return mapFromDb(data);
};

export const getOrder = async (orderId: string) => {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            clientId:clients (*)
        `)
        .eq('id', orderId)
        .single();

    if (error) throw error;
    return mapFromDb(data);
};

export const setPricing = async (orderId: string, items: any[]) => {
    // Get existing order to preserve item details like name and unit
    const { data: order } = await supabase.from('orders').select('items').eq('id', orderId).single();

    // Merge unitPrice into items and calculate totals
    const updatedItems = items.map(item => {
        const pid = item.itemId?._id || item.itemId;
        const originalItem = order?.items?.find((i: any) => (i.itemId?._id || i.itemId) === pid);

        const quantity = item.quantity || originalItem?.quantity || 1;
        const unitPrice = item.unitPrice || 0;

        return {
            ...originalItem,
            ...item,
            quantity,
            unitPrice,
            totalPrice: quantity * unitPrice
        };
    });

    const total = updatedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    const { data, error } = await supabase
        .from('orders')
        .update({
            items: updatedItems,
            cart_total: total,
            order_status: 'WAITING_CLIENT_APPROVAL'
        })
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return mapFromDb(data);
};

export const updatePaymentStatus = async (orderId: string, status: string) => {
    const { data, error } = await supabase
        .from('orders')
        .update({ payment_status: status })
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return mapFromDb(data);
};

export const dispatchOrder = async (orderId: string) => {
    const { data, error } = await supabase
        .from('orders')
        .update({
            order_status: 'IN_TRANSIT',
            delivery_status: 'SHIPPED'
        })
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return mapFromDb(data);
};

export const modifyOrder = async (orderId: string, items: any[]) => {
    const { data, error } = await supabase
        .from('orders')
        .update({
            items,
            order_status: 'PENDING_PRICING'
        })
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return mapFromDb(data);
};

export const confirmOrder = async (orderId: string) => {
    const { data, error } = await supabase
        .from('orders')
        .update({ order_status: 'ORDER_CONFIRMED' })
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return mapFromDb(data);
};

export const confirmDelivery = async (orderId: string) => {
    const { data, error } = await supabase
        .from('orders')
        .update({ order_status: 'DELIVERED', delivery_status: 'RECEIVED' })
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return mapFromDb(data);
};

export const cancelOrder = async (orderId: string) => {
    const { data, error } = await supabase
        .from('orders')
        .update({ order_status: 'CANCELLED' })
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return mapFromDb(data);
};

export const extendDueDate = async (orderId: string, date: string) => {
    const { data, error } = await supabase
        .from('orders')
        .update({ due_date: date })
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return mapFromDb(data);
};

/**
 * Load last known unit prices for items in a given order.
 * Searches past orders for the same client (excluding the current order)
 * that already have priced items, then maps itemId -> unitPrice.
 */
export const getLastPrices = async (orderId: string): Promise<Record<string, number>> => {
    // 1. Get the current order to find the clientId
    const { data: currentOrder, error: orderError } = await supabase
        .from('orders')
        .select('client_id, items')
        .eq('id', orderId)
        .single();

    if (orderError || !currentOrder) throw orderError || new Error('Order not found');

    const clientId = currentOrder.client_id;

    // 2. Fetch previous orders for the same client (excluding the current one)
    //    that have been priced — we look at all statuses except pure NEW_INQUIRY
    const { data: pastOrders, error: pastError } = await supabase
        .from('orders')
        .select('items, created_at')
        .eq('client_id', clientId)
        .neq('id', orderId)
        .not('order_status', 'eq', 'NEW_INQUIRY')
        .order('created_at', { ascending: false });

    if (pastError) throw pastError;
    if (!pastOrders || pastOrders.length === 0) return {};

    // 3. Build a map of itemId -> unitPrice from past orders (most recent wins)
    const priceMap: Record<string, number> = {};

    for (const pastOrder of pastOrders) {
        const items: any[] = pastOrder.items || [];
        for (const item of items) {
            const itemId = item.itemId?._id || item.itemId || item.productId;
            const unitPrice = item.unitPrice;
            if (itemId && unitPrice && unitPrice > 0 && !priceMap[itemId]) {
                priceMap[itemId] = unitPrice;
            }
        }
    }

    return priceMap;
};

export const adminDeliverOrder = async (orderId: string) => {
    const { data, error } = await supabase
        .from('orders')
        .update({
            order_status: 'DELIVERED',
            delivery_status: 'RECEIVED'
        })
        .eq('id', orderId)
        .select()
        .single();

    if (error) throw error;
    return mapFromDb(data);
};

// Storage API
export const uploadProductImage = async (file: File) => {
    // 1. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Get the Public URL
    const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

// Local History (Remains unchanged as it's local)
export const getLocalHistory = () => {
    const history = localStorage.getItem('localOrderHistory');
    return history ? JSON.parse(history) : [];
};

export const addToLocalHistory = (order: { _id: string; createdAt: string; items: unknown[]; orderStatus: string; clientId?: unknown; mobileNumber?: string }) => {
    const history = getLocalHistory();
    if (!history.find((o: any) => o._id === order._id)) {
        const entry = {
            _id: order._id,
            createdAt: order.createdAt,
            itemCount: order.items.length,
            status: order.orderStatus,
            mobileNumber: (order.clientId as any)?.mobileNumber || order.mobileNumber
        };
        const newHistory = [entry, ...history].slice(0, 20);
        localStorage.setItem('localOrderHistory', JSON.stringify(newHistory));
    }
};

