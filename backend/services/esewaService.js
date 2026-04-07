import crypto from "crypto";

const ESEWA_PRODUCT_CODE = (process.env.ESEWA_PRODUCT_CODE ?? "EPAYTEST").trim();
const ESEWA_SECRET_KEY = (process.env.ESEWA_SECRET_KEY ?? "8gBm/:&EnhH.1/q").trim();
const ESEWA_FORM_URL = (
  process.env.ESEWA_FORM_URL ?? "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
).trim();
const ESEWA_STATUS_URL = (
  process.env.ESEWA_STATUS_URL ?? "https://uat.esewa.com.np/api/epay/transaction/status"
).trim();

const buildSignedMessage = (payload, signedFieldNames) =>
  signedFieldNames
    .split(",")
    .map((field) => `${field}=${payload[field] ?? ""}`)
    .join(",");

export const getEsewaConfig = () => ({
  productCode: ESEWA_PRODUCT_CODE,
  formUrl: ESEWA_FORM_URL,
  statusUrl: ESEWA_STATUS_URL,
});

export const generateEsewaSignature = (payload, signedFieldNames) => {
  const message = buildSignedMessage(payload, signedFieldNames);
  return crypto.createHmac("sha256", ESEWA_SECRET_KEY).update(message).digest("base64");
};

export const buildEsewaFormData = ({
  amount,
  transactionUuid,
  successUrl,
  failureUrl,
}) => {
  const totalAmount = Number(amount);
  const basePayload = {
    amount: String(totalAmount),
    tax_amount: "0",
    product_service_charge: "0",
    product_delivery_charge: "0",
    total_amount: String(totalAmount),
    transaction_uuid: transactionUuid,
    product_code: ESEWA_PRODUCT_CODE,
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
  };

  return {
    ...basePayload,
    signature: generateEsewaSignature(basePayload, basePayload.signed_field_names),
  };
};

export const verifyEsewaResponseSignature = (responsePayload) => {
  const signedFieldNames = responsePayload?.signed_field_names;
  const signature = responsePayload?.signature;

  if (!signedFieldNames || !signature) {
    return false;
  }

  const expectedSignature = generateEsewaSignature(responsePayload, signedFieldNames);
  return expectedSignature === signature;
};

export const decodeEsewaData = (encodedData) => {
  const decoded = Buffer.from(encodedData, "base64").toString("utf8");
  return JSON.parse(decoded);
};

export const verifyEsewaTransactionStatus = async ({ transactionUuid, totalAmount }) => {
  const url = new URL(ESEWA_STATUS_URL);
  url.searchParams.set("product_code", ESEWA_PRODUCT_CODE);
  url.searchParams.set("total_amount", String(totalAmount));
  url.searchParams.set("transaction_uuid", transactionUuid);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`eSewa status check failed with status ${response.status}`);
  }

  return response.json();
};
