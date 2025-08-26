import { DEEP_RESEARCH, SCHEDULE_ALERTS } from "@/constants/landingConstants";
import { useTheme } from "@/lib/useTheme";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

// Helper function to get appropriate image for each point
const getImageForPoint = (title: string, theme: string) => {
  const imageMap: Record<string, string> = {
    "Price Rate": theme !== "dark" ? "/playground.png" : "/playground.png",
    Fundamental: theme !== "dark" ? "/chat.png" : "/chat-dark.png",
    Technical: theme !== "dark" ? "/chat.png" : "/chat-dark.png",
    News: theme !== "dark" ? "/chat.png" : "/chat-dark.png",
    Social: theme !== "dark" ? "/chat.png" : "/chat-dark.png",
    Sentiment: theme !== "dark" ? "/chat.png" : "/chat-dark.png",
    Reminder: theme !== "dark" ? "/playground.png" : "/playground.png",
    Alert: theme !== "dark" ? "/chat.png" : "/chat-dark.png",
    Notification: theme !== "dark" ? "/chat.png" : "/chat-dark.png",
  };

  return imageMap[title] || (theme !== "dark" ? "/chat.png" : "/chat-dark.png");
};

// Reusable Carousel Section Component
interface CarouselSectionProps {
  title: string;
  subtitle: string;
  data: Array<{
    title: string;
    content?: string;
    options?: string;
  }>;
  imageHeight?: string;
}

const CarouselSection = ({
  title,
  subtitle,
  data,
  imageHeight = "h-auto",
}: CarouselSectionProps) => {
  const { theme } = useTheme();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleDotClick = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <div className="bg-white dark:bg-black-90 rounded-2xl p-2 pt-4 shadow-lg">
      <div className="text-center mb-6 font-thin">
        <h3 className="text-xl text-blue-astryx dark:text-white font-family-parkinsans">{title}</h3>
        <h3 className="text-xl text-blue-astryx dark:text-white font-family-parkinsans">
          {subtitle}
        </h3>
      </div>

      <Carousel className="w-full" setApi={setApi}>
        <CarouselContent>
          {data.map((item, index) => (
            <CarouselItem className="" key={index}>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-black dark:text-white font-family-parkinsans mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-black-50 dark:text-gray-400 font-family-inter">
                  {item.content || item.options}
                </p>
              </div>

              {/* Image Display */}
              <div className="flex justify-center mt-4 mb-2">
                <img
                  src={getImageForPoint(item.title, theme)}
                  alt={`${item.title} Preview`}
                  className={`w-full max-w-sm ${imageHeight} border  rounded-xl  object-cover transition-all duration-500 ease-out`}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 hidden" />
        <CarouselNext className="right-2 hidden" />
      </Carousel>

      {/* Dots Indicator */}
      <div className="flex justify-center space-x-2 -mt-4">
        {data.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              index === current ? "bg-blue-astryx dark:bg-white" : "bg-gray-300 dark:bg-gray-600"
            }`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

const LandingOverviewMobile = () => {
  return (
    <div className="w-full px-4 space-y-8 lg:hidden">
      {/* Deep Research Section */}
      <CarouselSection
        title="astryx helps with"
        subtitle="deep research across markets"
        data={DEEP_RESEARCH}
      />

      {/* Scheduler Section */}
      <CarouselSection
        title="scheduling"
        subtitle="smart alerts"
        data={SCHEDULE_ALERTS}
        imageHeight="h-48"
      />
    </div>
  );
};

export default LandingOverviewMobile;
