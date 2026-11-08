import { useState, useCallback, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLevel2Language } from "@/hooks/useLevel2Language";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";
import { currencies } from "@/data/pricingDataComplete";
import { cn } from "@/lib/utils";

export type VehicleType = "car" | "van" | "bus";

type PricingProps = {
  selectedVehicle: VehicleType;
  onVehicleChange: (vehicle: VehicleType) => void;
  onGetQuote?: (vehicle: VehicleType) => void;
  children?: ReactNode;
};

const STARTING_PRICES: Record<VehicleType, number> = {
  car: 1100,
  van: 1400,
  bus: 6000,
};

const Pricing = ({ selectedVehicle, onVehicleChange, onGetQuote, children }: PricingProps) => {
  const { t } = useLevel2Language();
  const { selectedCurrency, setSelectedCurrency, convertPrice } = useCurrencyConverter();
  const currencyInfo = currencies.find(c => c.code === selectedCurrency) || currencies[0];

  const formatStartingPrice = useCallback((priceTHB: number): string => {
    if (selectedCurrency === "THB") return `฿${priceTHB.toLocaleString()}`;
    const converted = convertPrice(priceTHB);
    return `${currencyInfo.symbol}${converted.toLocaleString()}`;
  }, [selectedCurrency, convertPrice, currencyInfo]);

  const pricingPlans: { vehicle: VehicleType; name: string; passengers: string; desc: string; features: string[]; popular: boolean }[] = [
    {
      vehicle: "car",
      name: t('pricing.car', 'Car'),
      passengers: t('pricing.carCategory', 'Sedan & SUV options'),
      desc: t('pricing.carDesc', 'Choose the vehicle that best fits your passengers and luggage'),
      features: [
        t('pricing.carOptions', 'Sedan and SUV options'),
        t('pricing.airportPickup', 'Airport Pickup'),
        t('pricing.airConditioning', 'Air Conditioning'),
        t('pricing.professionalDriver', 'Professional Driver'),
      ],
      popular: false,
    },
    {
      vehicle: "van",
      name: t('pricing.van', 'Van'),
      passengers: t('pricing.vanCategory', 'Standard and Executive Van options'),
      desc: t('pricing.vanDesc', 'Choose the vehicle that best fits your passengers and luggage'),
      features: [
        t('pricing.vanOptions', 'Standard and Executive Van options'),
        t('pricing.airportPickup', 'Airport Pickup'),
        t('pricing.airConditioning', 'Air Conditioning'),
        t('pricing.professionalDriver', 'Professional Driver'),
      ],
      popular: true,
    },
    {
      vehicle: "bus",
      name: t('pricing.bus', 'Bus'),
      passengers: t('pricing.busCategory', 'Minibus and Medium Bus options'),
      desc: t('pricing.busDesc', 'For larger groups and organized travel'),
      features: [
        t('pricing.busOptions', 'Minibus and Medium Bus options'),
        t('pricing.airportPickup', 'Airport Pickup'),
        t('pricing.airConditioning', 'Air Conditioning'),
        t('pricing.professionalDriver', 'Professional Driver'),
      ],
      popular: false,
    },
  ];

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="bg-muted">
      <div className="container mx-auto px-4 pt-16 md:pt-20">
        <div className="text-center mb-8" style={{ transform: "translateY(-15px)" }}>
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-primary mb-4">
            {t('pricing.title', 'Simple & Transparent Pricing')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('pricing.description', 'Choose your vehicle type. Prices vary by route and distance.')}
          </p>

          <div className="flex justify-center gap-2">
            {(["car", "van", "bus"] as VehicleType[]).map((vehicle) => (
              <button
                key={vehicle}
                onClick={() => onVehicleChange(vehicle)}
                aria-pressed={selectedVehicle === vehicle}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  selectedVehicle === vehicle
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-card text-muted-foreground hover:bg-card/80 hover:text-foreground border border-border"
                )}
              >
                {vehicle === "car" ? t('pricing.car', 'Car') : vehicle === "van" ? t('pricing.van', 'Van') : t('pricing.bus', 'Bus')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {children}

      <div className="container mx-auto px-4 pb-16 md:pb-20" style={{ transform: "translateY(80px)" }}>
        <div className="flex justify-center items-center gap-2 mb-8" style={{ transform: "translateY(-20px)" }}>
          <span className="text-sm text-muted-foreground">{t('pricingPage.currency', 'Currency')}:</span>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border rounded-lg bg-card text-foreground cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:border-primary"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code}
              </option>
            ))}
          </select>
        </div>

        <div className="pricing-cards-grid grid grid-cols-1 md:grid-cols-3 items-stretch gap-6 lg:gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const isSelected = plan.vehicle === selectedVehicle;
            return (
              <div
                key={index}
                onClick={() => onVehicleChange(plan.vehicle)}
                className={cn(
                  "relative h-full flex flex-col bg-card rounded-xl shadow-soft hover:shadow-medium hover:scale-105 hover:z-10 transition-all p-6 lg:p-8 cursor-pointer",
                  isSelected
                    ? "border-2 border-primary ring-2 ring-primary/20 shadow-medium z-10"
                    : "border border-border hover:border-primary/30",
                  plan.popular && !isSelected && "border-primary/50"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    {t('pricing.mostPopular', 'Most Popular')}
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="font-heading text-xl lg:text-2xl font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-primary font-semibold">
                    {plan.vehicle === "car" ? (
                      <>
                        {plan.passengers.replace(/\s+options$/i, "")}
                        <br />
                        options
                      </>
                    ) : plan.passengers}
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">{plan.desc}</p>
                </div>

                <div className="text-center mb-6 py-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {t('pricing.startingFrom', 'Starting from')}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatStartingPrice(STARTING_PRICES[plan.vehicle])}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isSelected ? "cta" : "outline"}
                  className="w-full mt-auto"
                  onClick={(event) => {
                    event.stopPropagation();
                    onVehicleChange(plan.vehicle);
                    onGetQuote?.(plan.vehicle);
                    scrollToBooking();
                  }}
                >
                  {t('pricing.getQuote', 'Get a Quote')}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <Link to="/pricing" className="text-primary hover:text-primary/80 text-sm font-medium underline underline-offset-4 transition-colors">
            {t('pricing.viewFullPricing', 'View Full Price List →')}
          </Link>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-4">
          {t('pricing.festivalNote', '* Prices may vary during festival seasons and peak periods.')}
        </p>
      </div>
    </section>
  );
};

export default Pricing;
