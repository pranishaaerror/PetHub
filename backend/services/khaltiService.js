const KHALTI_BASE_URL = (process.env.KHALTI_BASE_URL ?? "https://dev.khalti.com/api/v2").trim();
const KHALTI_SECRET_KEY = (process.env.KHALTI_SECRET_KEY ?? "").trim();

export const initiateKhaltiPayment = async ({
  amount,
  purchaseOrderId,
  purchaseOrderName,
  returnUrl,
  websiteUrl,
  customerInfo = {},
}) => {
  const response = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
    },
    body: JSON.stringify({
      return_url: returnUrl,
      website_url: websiteUrl,
      amount: Math.round(amount),
      purchase_order_id: purchaseOrderId,
      purchase_order_name: purchaseOrderName,
      customer_info: customerInfo,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errMsg = data?.detail
        ?? data?.customer_info?.name?.[0]
        ?? JSON.stringify(data)
        ?? "Khalti initiation failed";
    throw new Error(errMsg);
    }

    if (data.pidx) {
    data.payment_url = `https://test-pay.khalti.com/wallet?pidx=${data.pidx}`;
  }
  return data;
};


export const verifyKhaltiPayment = async (pidx) => {
  const response = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
    },
    body: JSON.stringify({ pidx }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail ?? JSON.stringify(data) ?? "Khalti lookup failed");
  }
  return data;
};
