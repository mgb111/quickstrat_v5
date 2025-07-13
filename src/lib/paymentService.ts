import { supabase } from './supabase';

export interface PaymentSuccessData {
  paymentId: string;
  plan: string;
  billing: string;
  userId?: string;
  email?: string;
}

export class PaymentService {
  static async handlePaymentSuccess(data: PaymentSuccessData): Promise<boolean> {
    try {
      console.log('Processing payment success:', data);
      
      // Update user's subscription in the database
      if (data.userId) {
        const { error } = await supabase
          .from('users')
          .update({ 
            plan: 'premium',
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.userId);

        if (error) {
          console.error('Error updating user subscription:', error);
          return false;
        }
      }

      // Log the payment for analytics
      await this.logPayment(data);
      
      return true;
    } catch (error) {
      console.error('Error handling payment success:', error);
      return false;
    }
  }

  static async logPayment(data: PaymentSuccessData): Promise<void> {
    try {
      // You can create a payments table to log all transactions
      const { error } = await supabase
        .from('payments')
        .insert({
          payment_id: data.paymentId,
          user_id: data.userId,
          email: data.email,
          plan: data.plan,
          billing_cycle: data.billing,
          amount: data.billing === 'monthly' ? 49 : 399,
          currency: 'INR',
          status: 'completed',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging payment:', error);
      }
    } catch (error) {
      console.error('Error in logPayment:', error);
    }
  }

  static async verifyPayment(paymentId: string): Promise<boolean> {
    try {
      // In a real implementation, you would verify the payment with Razorpay
      // For now, we'll assume the payment is valid if we receive a payment ID
      console.log('Verifying payment:', paymentId);
      return true;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  static async getPaymentHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPaymentHistory:', error);
      return [];
    }
  }
} 