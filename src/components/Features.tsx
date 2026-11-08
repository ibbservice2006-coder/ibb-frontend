import convenienceImg from "@/assets/features/convenience.jpg";
import safetyImg from "@/assets/features/safety.jpg";
import premiumCarsImg from "@/assets/features/premium-cars.jpg";
import standardSedanImg from "@/assets/features/vehicles/standard-sedan.png";
import executiveSedanImg from "@/assets/features/vehicles/executive-sedan.webp";
import evSedanImg from "@/assets/features/vehicles/ev-sedan.webp";
import suvImg from "@/assets/features/vehicles/suv.png";
import premiumImg from "@/assets/features/vehicles/premium.webp";
import luxuryImg from "@/assets/features/vehicles/luxury.webp";
import standardVanImg from "@/assets/features/vehicles/standard-van.webp";
import executiveVanImg from "@/assets/features/vehicles/executive-van.webp";
import premiumMpvImg from "@/assets/features/vehicles/premium-mpv.webp";
import luxuryMpvImg from "@/assets/features/vehicles/luxury-mpv.webp";
import minibusImg from "@/assets/features/vehicles/minibus.webp";
import mediumBusImg from "@/assets/features/vehicles/medium-bus.webp";
import { useLevel2Language } from "@/hooks/useLevel2Language";
import type { VehicleType } from "@/components/Pricing";

interface FeaturesProps {
  compact?: boolean;
  vehicleType?: VehicleType;
}

type VehicleCard = {
  title: string;
  model: string;
  passengers: number;
  smallBags: number;
  largeBags: number;
  image: string;
  alt: string;
};

const Features = ({ compact = false, vehicleType = "car" }: FeaturesProps) => {
  const { t } = useLevel2Language();

  const features = [
    {
      title: t('features.convenience', 'Convenience'),
      desc: t('features.convenienceDesc', 'Easy online booking with flexible scheduling and door-to-door service.'),
      image: convenienceImg,
      alt: "IBB Shuttle Convenience - Comfortable travel experience with premium amenities",
    },
    {
      title: t('features.safety', 'Safety'),
      desc: t('features.safetyDesc', 'Verified drivers, insured vehicles, and real-time GPS tracking for peace of mind.'),
      image: safetyImg,
      alt: "IBB Shuttle Safety - Professional drivers and verified vehicles for secure travel",
    },
    {
      title: t('features.premiumCars', 'Premium Cars'),
      desc: t('features.premiumCarsDesc', 'Modern, clean, and well-maintained fleet of luxury vehicles for your comfort.'),
      image: premiumCarsImg,
      alt: "IBB Premium Cars - Modern luxury fleet with clean and well-maintained vehicles",
    },
  ];

  const vehicleCardsByType: Record<VehicleType, VehicleCard[]> = {
    car: [
      { title: "Standard Sedan", model: "Toyota Vios or equivalent", passengers: 2, smallBags: 2, largeBags: 2, image: standardSedanImg, alt: "IBB Standard Sedan vehicle" },
      { title: "Executive Sedan", model: "Toyota Camry or equivalent", passengers: 2, smallBags: 2, largeBags: 2, image: executiveSedanImg, alt: "IBB Executive Sedan vehicle" },
      { title: "EV Sedan", model: "GAC AION S or equivalent", passengers: 2, smallBags: 2, largeBags: 2, image: evSedanImg, alt: "IBB EV Sedan vehicle" },
      { title: "SUV", model: "Toyota Fortuner or equivalent", passengers: 4, smallBags: 4, largeBags: 4, image: suvImg, alt: "IBB SUV vehicle" },
      { title: "Premium", model: "Mercedes-Benz C-Class or equivalent", passengers: 2, smallBags: 2, largeBags: 2, image: premiumImg, alt: "IBB Premium vehicle" },
      { title: "Luxury", model: "Mercedes-Benz S-Class or equivalent", passengers: 2, smallBags: 2, largeBags: 2, image: luxuryImg, alt: "IBB Luxury vehicle" },
    ],
    van: [
      { title: "Standard Van", model: "Toyota Commuter or equivalent", passengers: 7, smallBags: 7, largeBags: 7, image: standardVanImg, alt: "IBB Standard Van vehicle" },
      { title: "Executive Van", model: "Toyota Commuter or equivalent", passengers: 7, smallBags: 7, largeBags: 7, image: executiveVanImg, alt: "IBB Executive Van vehicle" },
      { title: "Premium MPV", model: "Hyundai H-1 or equivalent", passengers: 4, smallBags: 4, largeBags: 4, image: premiumMpvImg, alt: "IBB Premium MPV vehicle" },
      { title: "Luxury MPV", model: "Toyota Alphard or equivalent", passengers: 2, smallBags: 2, largeBags: 2, image: luxuryMpvImg, alt: "IBB Luxury MPV vehicle" },
    ],
    bus: [
      { title: "Minibus", model: "Standard Minibus or equivalent", passengers: 14, smallBags: 0, largeBags: 0, image: minibusImg, alt: "IBB Minibus vehicle" },
      { title: "Medium Bus", model: "Medium Bus or equivalent", passengers: 24, smallBags: 24, largeBags: 24, image: mediumBusImg, alt: "IBB Medium Bus vehicle" },
    ],
  };

  const displayedFeatures = compact ? vehicleCardsByType[vehicleType] : features;
  const compactColumns = vehicleType === "car" ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <section className="bg-secondary pt-6 md:pt-8 pb-12 md:pb-16">
      <div className="container mx-auto px-4">
        <div
          className={`grid grid-cols-1 ${compact ? compactColumns : "md:grid-cols-3"} gap-6 lg:gap-8`}
          style={compact ? { columnGap: "0rem", transform: "translateY(-10px)" } : undefined}
        >
          {displayedFeatures.map((feature, index) => (
            <div
              key={`${feature.title}-${index}`}
              className={`bg-secondary rounded-lg text-center group ${compact ? "vehicle-coverage-card border-2 w-[90%] justify-self-center p-3 !border-[#c9a55b] transition-[border-color,box-shadow] hover:!border-[#f5e6a8]" : "border border-primary-foreground/20 transition-colors hover:border-primary-foreground/40 p-5"}`}
            >
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={feature.image}
                  alt={feature.alt}
                  loading="lazy"
                  className={`w-full group-hover:scale-105 transition-transform duration-500 ${compact ? "h-auto object-contain" : "h-40 md:h-44 object-cover"}`}
                />
              </div>
              {compact ? (
                <div className="mt-3 text-left">
                  <h4 className="font-heading font-bold text-secondary-foreground text-base md:text-lg pl-2">
                    {feature.title}
                  </h4>
                  <p className="text-secondary-foreground/80 text-xs md:text-sm mt-1 pl-2">
                    {feature.model}
                  </p>
                  <p className="inline-block rounded-full bg-secondary text-secondary-foreground/90 text-xs font-semibold px-2 py-1 mt-2">
                    Recommended capacity
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-secondary-foreground/80 text-xs md:text-sm mt-2 pl-2">
                    <span><strong className="text-secondary-foreground">{feature.passengers}</strong> passengers</span>
                    <span><strong className="text-secondary-foreground">{feature.smallBags}</strong> small bags</span>
                    <span><strong className="text-secondary-foreground">{feature.largeBags}</strong> large bags</span>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="font-heading font-bold text-secondary-foreground text-lg md:text-xl mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-secondary-foreground/80 text-sm md:text-base mb-4">
                    {feature.desc}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
