export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  metadata?: any;
}

export interface PaymentProvider {
  processPayment(data: any): Promise<PaymentResult>;
  verifyPayment(transactionId: string): Promise<PaymentResult>;
}
