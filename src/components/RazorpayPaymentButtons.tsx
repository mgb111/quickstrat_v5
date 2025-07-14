import React from 'react';

// Replace these with your actual Razorpay Payment Button IDs
const MONTHLY_BUTTON_ID = 'pl_MonthlyButtonIdHere';
const YEARLY_BUTTON_ID = 'pl_YearlyButtonIdHere';

interface RazorpayPaymentButtonsProps {
  showMonthly?: boolean;
  showYearly?: boolean;
}

const RazorpayPaymentButtons: React.FC<RazorpayPaymentButtonsProps> = ({ showMonthly = true, showYearly = true }) => {
  return (
    <div className="flex flex-col gap-6 items-center w-full">
      {showMonthly && (
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div
            dangerouslySetInnerHTML={{
              __html: `
                <form>
                  <script src="https://cdn.razorpay.com/static/widget/payment-button.js"
                    data-payment_button_id="${MONTHLY_BUTTON_ID}"
                    async> </script>
                </form>
              `
            }}
          />
        </div>
      )}
      {showYearly && (
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div
            dangerouslySetInnerHTML={{
              __html: `
                <form>
                  <script src="https://cdn.razorpay.com/static/widget/payment-button.js"
                    data-payment_button_id="${YEARLY_BUTTON_ID}"
                    async> </script>
                </form>
              `
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RazorpayPaymentButtons; 