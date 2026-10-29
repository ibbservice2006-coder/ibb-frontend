import { useState, useEffect, useCallback } from "react";

interface ExchangeRates {
  [key: string]: number;
}

const MARKUP_RATE = 1.04; // 4% markup
const FALLBACK_RATES: ExchangeRates = {
  THB: 1,
  USD: 0.028,
  EUR: 0.026,
  GBP: 0.022,
  CNY: 0.2,
  JPY: 4.2,
  MYR: 0.13,
  IDR: 450,
  SGD: 0.038,
  BND: 0.038,
  AED: 0.1,
  RUB: 2.5,
  SAR: 0.1,
  OMR: 0.011,
  INR: 2.35,
};

export const useCurrencyConverter = () => {
  const [rates, setRates] = useState<ExchangeRates>({ THB: 1 });
  const [selectedCurrency, setSelectedCurrency] = useState("THB");

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/THB");
        if (!response.ok) throw new Error("Failed to fetch rates");
        const data = await response.json();
        setRates(data.rates);
      } catch {
        setRates(FALLBACK_RATES);
      }
    };

    fetchRates();
  }, []);

  const convertPrice = useCallback(
    (priceInTHB: number): number => {
      if (selectedCurrency === "THB") return priceInTHB;
      const rate = rates[selectedCurrency] || 1;
      return Math.round(priceInTHB * rate * MARKUP_RATE);
    },
    [rates, selectedCurrency]
  );

  const formatPrice = useCallback(
    (priceInTHB: number, symbol: string): string => {
      return `${symbol}${convertPrice(priceInTHB).toLocaleString()}`;
    },
    [convertPrice]
  );

  const handleSetCurrency = useCallback((code: string) => {
    setSelectedCurrency(code);
  }, []);

  return {
    selectedCurrency,
    setSelectedCurrency: handleSetCurrency,
    convertPrice,
    formatPrice,
  };
};
