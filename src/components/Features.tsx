import convenienceImg from "@/assets/features/convenience.jpg";
import safetyImg from "@/assets/features/safety.jpg";
import premiumCarsImg from "@/assets/features/premium-cars.jpg";
import standardSedanImg from "@/assets/features/vehicles/standard-sedan.png";
import executiveSedanImg from "@/assets/features/vehicles/executive-sedan.webp";
import evSedanImg from "@/assets/features/vehicles/ev-sedan.webp";
import suvImg from "@/assets/features/vehicles/suv.png";
import premiumImg from "@/assets/features/vehicles/premium.webp";
import luxuryImg from "@/assets/features/vehicles/luxury.webp";
import { useLevel2Language } from "@/hooks/useLevel2Language";

interface FeaturesProps {
  compact?: boolean;
}

const Features = ({ compact = false }: FeaturesProps) => {
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

  const compactVehicleImages = [
    standardSedanImg,
    executiveSedanImg,
    evSedanImg,
    suvImg,
    premiumImg,
    luxuryImg,
  ];

  const compactVehicleDetails = [
    { title: "Standard Sedan", model: "Toyota Vios or equivalent", passengers: 2, smallBags: 2, largeBags: 2 },
    { title: "Executive Sedan", model: "Toyota Camry or equivalent", passengers: 2, smallBags: 2, largeBags: 2 },
    { title: "EV Sedan", model: "GAC AION S or equivalent", passengers: 2, smallBags: 2, largeBags: 2 },
    { title: "SUV", model: "Toyota Fortuner or equivalent", passengers: 4, smallBags: 4, largeBags: 4 },
    { title: "Premium", model: "Mercedes-Benz C-Class or equivalent", passengers: 2, smallBags: 2, largeBags: 2 },
    { title: "Luxury", model: "Mercedes-Benz S-Class or equivalent", passengers: 2, smallBags: 2, largeBags: 2 },
  ];

  const displayedFeatures = compact
    ? [...features, ...features].map((feature, index) => ({
        ...feature,
        image: compactVehicleImages[index],
        vehicle: compactVehicleDetails[index],
      }))
    : features;

  return (
    <section className="bg-secondary pt-6 md:pt-8 pb-12 md:pb-16">
      <div className="container mx-auto px-4">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          style={compact ? { columnGap: "0rem" } : undefined}
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
              {compact && feature.vehicle ? (
                <div className="mt-3 text-left">
                  <h4 className="font-heading font-bold text-secondary-foreground text-base md:text-lg pl-2">
                    {feature.vehicle.title}
                  </h4>
                  <p className="text-secondary-foreground/80 text-xs md:text-sm mt-1 pl-2">
                    {feature.vehicle.model}
                  </p>
                  <p className="inline-block rounded-full bg-secondary text-secondary-foreground/90 text-xs font-semibold px-2 py-1 mt-2">
                    Recommended capacity
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-secondary-foreground/80 text-xs md:text-sm mt-2 pl-2">
                    <span><strong className="text-secondary-foreground">{feature.vehicle.passengers}</strong> passengers</span>
                    <span><strong className="text-secondary-foreground">{feature.vehicle.smallBags}</strong> small bags</span>
                    <span><strong className="text-secondary-foreground">{feature.vehicle.largeBags}</strong> large bags</span>
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
