import { DEEP_RESEARCH, SCHEDULE_ALERTS } from "@/constants/landingConstants";
import { useTheme } from "@/lib/useTheme";
import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";

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

enum SectionType {
  BOTH = "both",
  LEFT = "deep-research",
  RIGHT = "scheduling-alerts",
}

// Reusable Section Component
interface SectionProps {
  type: SectionType;
  title: string;
  subtitle: string;
  data: Array<{
    title: string;
    content?: string;
    options?: string;
  }>;
  sectionName: SectionType;
  setSectionName: (section: SectionType) => void;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  showArrow?: boolean;
}

const Section = ({
  type,
  title,
  subtitle,
  data,
  sectionName,
  setSectionName,
  hoveredIndex,
  setHoveredIndex,
  showArrow = false,
}: SectionProps) => {
  const { theme } = useTheme();
  const isOppositeActive = sectionName !== type && sectionName !== SectionType.BOTH;
  const showImage = hoveredIndex !== null && isOppositeActive;

  return (
    <div className="transition-all duration-500 ease-out transform relative">
      <div className={isOppositeActive ? "opacity-40" : "opacity-100"}>
        <div
          className={`py-4 flex flex-col space-y-3 font-family-parkinsans transition-all duration-200 pb-4 text-blue-astryx dark:text-white font-thin ${
            sectionName === type ? "border-b border-blue-astryx dark:border-white-30" : ""
          }`}
        >
          <h3 className="text-2xl md:text-lg lg:text-2xl transition-colors duration-200">
            {title}
          </h3>
          <h3 className="text-2xl md:text-lg lg:text-2xl transition-colors duration-200">
            {subtitle}
          </h3>
          {showArrow && (
            <div className="border-2 absolute top-0 right-0 rounded-full p-3 transition-all duration-200 group-hover:border-blue-astryx dark:group-hover:border-white-30 border-transparent">
              <ArrowRightIcon size={24} />
            </div>
          )}
        </div>
        <div
          className="content mt-8"
          onMouseEnter={() => setSectionName(type)}
          onMouseLeave={() => setSectionName(SectionType.BOTH)}
        >
          <div className="">
            {data.map((item, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group  cursor-pointer transition-all duration-200 ease-out border-b-2 group-hover:border-blue-astryx dark:group-hover:border-white-30 border-transparent pb-2"
              >
                <div className="transition-all duration-200 group-hover:border-b-2 border-blue-astryx dark:border-white-80 py-3 ">
                  <h3 className="text-base lg:text-xl font-family-parkinsans transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-black-50 font-family-inter transition-colors duration-200">
                    {item.content || item.options}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showImage && (
        <div
          style={{
            top: hoveredIndex ? hoveredIndex * 86 + 20 : "20px",
          }}
          className={`absolute  ${type === SectionType.LEFT ? "left-0" : "right-0"} flex items-center justify-center z-50 pointer-events-none transition-all duration-500 ease-out animate-in fade-in-0 zoom-in-95`}
        >
          <img
            src={getImageForPoint(data[hoveredIndex]?.title, theme)}
            alt={`${data[hoveredIndex]?.title} Preview`}
            className="w-[500px] h-[350px] lg:w-[600px] lg:h-[400px] rounded-3xl shadow-2xl dark:shadow-white-30 object-cover transition-all duration-500 ease-out"
          />
        </div>
      )}
    </div>
  );
};

const LandingOverview = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [sectionName, setSectionName] = useState<SectionType>(SectionType.BOTH);

  return (
    <div className="w-full hidden lg:grid max-w-7xl mx-auto grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 px-4">
      {/* Left Section - Deep Research */}
      <Section
        type={SectionType.LEFT}
        title="astryx helps with"
        subtitle="deep research across markets"
        data={DEEP_RESEARCH}
        sectionName={sectionName}
        setSectionName={setSectionName}
        hoveredIndex={hoveredIndex}
        setHoveredIndex={setHoveredIndex}
      />

      {/* Right Section - Scheduling Alerts */}
      <Section
        type={SectionType.RIGHT}
        title="scheduling"
        subtitle="smart Alerts"
        data={SCHEDULE_ALERTS}
        sectionName={sectionName}
        setSectionName={setSectionName}
        hoveredIndex={hoveredIndex}
        setHoveredIndex={setHoveredIndex}
        showArrow={true}
      />
    </div>
  );
};

export default LandingOverview;
