const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "$",
  AUD: "$",
  JPY: "¥"
};

export const formatCurrency = (amount, currencyCode = "USD") => {
  const symbol = currencySymbols[currencyCode] || "$";
  return `${symbol}${amount.toLocaleString()}`;
};