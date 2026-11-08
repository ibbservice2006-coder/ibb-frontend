import { useLevel2Language } from "@/hooks/useLevel2Language";

interface ImpressiveServiceProps {
  descriptionOverride?: string;
  titleOverride?: string;
}

const ImpressiveService = ({ descriptionOverride, titleOverride }: ImpressiveServiceProps) => {
  const { t } = useLevel2Language();

  return (
    <section className="bg-secondary pt-12 md:pt-14 pb-8 md:pb-10">
      <div
        className="container mx-auto px-4 text-center"
        style={{ transform: `translateY(${titleOverride ? "0px" : "-14px"})` }}
      >
        <h3 className={`font-heading text-xl md:text-2xl lg:text-3xl font-bold mb-3 ${titleOverride ? "vehicle-capacity-title" : "text-secondary-foreground"}`}>
          {titleOverride ?? t('impressive.title', 'Impressive Service Coverage')}
        </h3>
        <p className="text-secondary-foreground/90 text-base md:text-lg max-w-2xl mx-auto">
          {descriptionOverride ?? t('impressive.description', 'We cover all major destinations across Thailand, from Bangkok to Chiang Mai, Phuket, and beyond.')}
        </p>
      </div>
    </section>
  );
};

export default ImpressiveService;
