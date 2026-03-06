export interface User {
    _id?: string;
    id: string;
    username: string;
    email: string;
    status: 'NOT_APPROVED' | 'APPROVED';
    balance: number;
    accountExpiresAt?: Date | string;
}

export interface Card {
    id: string;
    title: string;
    price: number;
    description: string;
    forSale: boolean;
    cardNumber: string; // Fake card number for display
    cvv?: string;
    expiry?: string;
    holder?: string;
    address?: string;
    bank?: string;
    type?: string;
    zip?: string;
    city?: string;
    state?: string;
    country?: string;
    ssn?: string;
    dob?: string;
    email?: string;
    phone?: string;
    userAgent?: string;
    password?: string;
    ip?: string;
    videoLink?: string;
    proxy?: string;
    soldAt?: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}


export interface Order {
    _id?: string;
    id: string;
    userId: string;
    cardId: string;
    cardTitle: string;
    cardNumber: string;
    cvv?: string;
    expiry?: string;
    holder?: string;
    address?: string;
    bank?: string;
    type?: string;
    zip?: string;
    city?: string;
    state?: string;
    country?: string;
    ssn?: string;
    dob?: string;
    email?: string;
    phone?: string;
    userAgent?: string;
    password?: string;
    ip?: string;
    videoLink?: string;
    proxy?: string;
    purchaserUsername?: string;
    purchaserEmail?: string;
    price: number;
    purchaseDate: Date | string;
}


export interface Payment {
    paymentId: string;
    trxId: string;
    amount: number;
    type: 'SIGNUP' | 'DEPOSIT';
    paymentStatus: 'PENDING' | 'APPROVED';
    userId: string;
    username: string;
    email: string;
    userStatus: 'NOT_APPROVED' | 'APPROVED' | 'N/A';
    createdAt: Date | string;
}

export interface ActivityLog {
    _id: string;
    userId: string;
    action: string;
    details: string;
    ip?: string;
    userAgent?: string;
    createdAt: Date | string;
}

export interface BundleOrder {
    _id: string;
    id: string;
    userId: string;
    username: string;
    bundleTitle: string;
    cardCount: number;
    discount: number;
    originalPrice: number;
    price: number;
    purchaseDate: Date | string;
}

export interface Offer {
    _id: string;
    id: string;
    title: string;
    description: string;
    country: string;
    state?: string;
    type: 'CARD' | 'PROXY';
    cardCount: number;
    proxyType?: string;
    proxyFile?: string;
    discount: number;
    originalPrice: number;
    price: number;
    avgPricePerCard: number;
    badge?: string;
    isActive: boolean;
    styleIndex: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface OfferCard {
    _id: string;
    offerId: string;
    cardNumber: string;
    cvv?: string;
    expiry?: string;
    holder?: string;
    address?: string;
    bank?: string;
    type?: string;
    zip?: string;
    city?: string;
    state?: string;
    country?: string;
    ssn?: string;
    dob?: string;
    email?: string;
    phone?: string;
    userAgent?: string;
    password?: string;
    ip?: string;
    videoLink?: string;
    proxy?: string;
}

export interface OfferOrderCard {
    cardNumber: string;
    cvv?: string;
    expiry?: string;
    holder?: string;
    address?: string;
    bank?: string;
    type?: string;
    zip?: string;
    city?: string;
    state?: string;
    country?: string;
    ssn?: string;
    dob?: string;
    email?: string;
    phone?: string;
    userAgent?: string;
    password?: string;
    ip?: string;
    videoLink?: string;
    proxy?: string;
}

export interface OfferOrder {
    _id: string;
    id: string;
    userId: string;
    username: string;
    offerId: string;
    offerTitle: string;
    offerCountry: string;
    offerState?: string;
    offerType: 'CARD' | 'PROXY';
    cardCount: number;
    proxyType?: string;
    proxyFile?: string;
    discount: number;
    originalPrice: number;
    price: number;
    cards: OfferOrderCard[];
    purchaseDate: Date | string;
    createdAt: Date | string;
}

export interface Proxy {
    _id?: string;
    id: string;
    title: string;
    price: number;
    description: string;
    forSale: boolean;
    host: string;
    port: string;
    username?: string;
    password?: string;
    type: string;
    country: string;
    state?: string;
    city?: string;
    createdAt?: Date | string;
    soldToUsername?: string;
    soldToEmail?: string;
    soldAt?: Date | string;
    pdfUrl?: string;
}

export interface ProxyOrder {
    _id?: string;
    id: string;
    userId: string;
    username: string;
    proxyId: string;
    proxyTitle: string;
    host: string;
    port: string;
    username_proxy?: string;
    password_proxy?: string;
    type: string;
    country: string;
    state?: string;
    city?: string;
    price: number;
    purchaseDate: Date | string;
    pdfUrl?: string;
}
