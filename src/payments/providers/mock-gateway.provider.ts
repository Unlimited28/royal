import type { PaymentProvider, PaymentResult } from './payment-provider.interface';
import { v4 as uuidv4 } from 'uuid';

export class MockGatewayProvider implements PaymentProvider {
  async processPayment(_data: { amount: number; email: string }): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `MOCK_${uuidv4()}`,
      paymentUrl: `https://mock-gateway.com/pay?ref=${uuidv4()}`,
      status: 'pending',
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId,
      status: 'approved',
      metadata: { gateway: 'mock', verifiedAt: new Date() },
    };
  }
}
