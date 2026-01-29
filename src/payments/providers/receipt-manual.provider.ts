import type { PaymentProvider, PaymentResult } from './payment-provider.interface';

export class ReceiptManualProvider implements PaymentProvider {
  async processPayment(data: { receiptUrl: string; fileMetadata?: any }): Promise<PaymentResult> {
    return {
      success: true,
      receiptUrl: data.receiptUrl,
      status: 'pending',
      metadata: data.fileMetadata,
    };
  }

  async verifyPayment(_transactionId: string): Promise<PaymentResult> {
    return { success: true, status: 'pending' };
  }
}
