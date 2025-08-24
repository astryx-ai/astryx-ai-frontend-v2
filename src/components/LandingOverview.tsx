import { DEEP_RESEARCH, SCHEDULE_ALERTS } from "@/constants/landingConstants";
import { ArrowRightIcon } from "lucide-react";

const LandingOverview = ({ sectionName }: { sectionName?: string }) => {
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-3 justify-around">
        <div>
          <div
            className={`heading py-2 flex flex-col ${sectionName !== "scheduling-alerts" && "border-(--primary-blue) dark:border-white-30  border-b"}  space-y-2`}
          >
            <h3
              className={`text-2xl md:text-lg lg:text-2xl ${sectionName === "scheduling-alerts" ? "text-blue-200 dark:text-black-70" : "text-(--primary-blue) dark:text-white"} `}
            >
              astryx helps with
            </h3>
            <h3
              className={`text-2xl md:text-lg lg:text-2xl ${sectionName === "scheduling-alerts" ? "text-blue-200 dark:text-black-70" : "text-(--primary-blue) dark:text-white"} `}
            >
              deep research across markets
            </h3>
          </div>
          <div className="content mt-10">
            <div>
              {DEEP_RESEARCH.map((item, index) => (
                <div
                  key={index}
                  className={`my-5 ${sectionName === "deep-research" ? "hover:border-b-1 hover:border-blue-500 pb-3 relative before:absolute before:w-[75%] before:h-1 hover:before:bg-(--primary-blue) dark:hover:before:bg-white-80 dark:hover:border-white-80 before:bottom-0 transition-all duration-300 ease-in" : ""}`}
                >
                  <h3 className="text-black dark:text-white text-sm lg:text-lg font-semibold">
                    {item.title}
                  </h3>
                  <p
                    className={`${sectionName !== "scheduling-alerts" ? "text-black-50" : "text-black-20 dark:text-black-70"}  text-sm lg:text-base`}
                  >
                    {item.options}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div
            className={`heading space-y-2 flex justify-between items-center ${sectionName === "scheduling-alerts" && "py-2 border-b border-(--primary-blue) dark:border-white-30"}`}
          >
            <div className="space-y-3">
              <h3
                className={`text-2xl md:text-lg lg:text-2xl  ${sectionName === "scheduling-alerts" ? "text-(--primary-blue) dark:text-white" : "text-blue-200 dark:text-black-70"} `}
              >
                Scheduling
              </h3>
              <h3
                className={`text-2xl md:text-lg lg:text-2xl  ${sectionName === "scheduling-alerts" ? "text-(--primary-blue) dark:text-white" : "text-blue-200 dark:text-black-70"} `}
              >
                Smart Alerts
              </h3>
            </div>
            <div
              className={`border rounded-full  p-2 ${sectionName === "scheduling-alerts" ? "text-(--primary-blue) border-(--primary-blue) cursor-pointer dark:text-white dark:border-white" : "text-blue-200 border-blue-200 dark:text-white-20 dark:border-white-20"} `}
            >
              <ArrowRightIcon />
            </div>
          </div>
          <div className="content mt-10">
            <div>
              {SCHEDULE_ALERTS.map((item, index) => (
                <div
                  key={index}
                  className={`my-5 ${sectionName === "scheduling-alerts" ? "hover:border-b-1 hover:border-blue-500 pb-3 relative before:absolute before:w-[75%] before:h-1 hover:before:bg-(--primary-blue) dark:hover:before:bg-white-80 dark:hover:border-white-80 before:bottom-0 transition-all duration-300 ease-in" : ""}`}
                >
                  <h3
                    className={`${sectionName === "scheduling-alerts" ? "text-black dark:text-white" : "text-black-20 dark:text-white-40 "} text-sm lg:text-lg font-semibold`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`${sectionName === "scheduling-alerts" ? "text-black-50" : "text-black-20 dark:text-black-70"}  text-sm lg:text-base`}
                  >
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingOverview;
