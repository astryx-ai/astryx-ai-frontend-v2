import { ExternalLink } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

interface SourceLinkPreviewProps {
  sources: Array<{
    title?: string;
    image?: string;
    url: string;
  }>;
}

export function SourceLinkPreview({ sources }: SourceLinkPreviewProps) {
  if (!sources || sources.length === 0) return null;

  const getDisplayText = (item: { title?: string; url: string }) => {
    return item.title || new URL(item.url).hostname;
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white-100">
          Sources ({sources.length})
        </h4>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: false,
          dragFree: true,
        }}
        className="w-full "
      >
        <CarouselContent
          className="-ml-2 overflow-x-auto snap-x scroll-smooth scrollbar-hidden"
          onWheel={e => {
            const container = e.currentTarget;
            if (e.deltaY !== 0) {
              container.scrollLeft += e.deltaY;
            }
          }}
        >
          {sources.map((item, index) => (
            <CarouselItem key={index} className="pl-2 basis-[31.25%] ">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="bg-gray-50 dark:bg-black-85 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-black-80 transition-all duration-200 hover:shadow-sm ">
                  <div className="relative">
                    {/* Image */}
                    <div className="overflow-hidden rounded-lg mb-2 ">
                      <img
                        src={
                          item.image && item.image.startsWith("https:")
                            ? item.image
                            : "/notfound.png"
                        }
                        alt={getDisplayText(item)}
                        className="w-full h-full object-cover aspect-video rounded-lg  !border-none dark:bg-black-85 border dark:[&[src*='notfound.png']]:invert  !m-0"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/notfound.png";
                        }}
                      />
                    </div>

                    {/* External Link Icon */}
                    <div className="absolute top-2 right-2 bg-white/90 dark:bg-black-85 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 dark:border-white/10">
                      <ExternalLink className="w-3 h-3 text-gray-600 dark:text-white/70" />
                    </div>

                    {/* Title/URL */}
                    <div className="text-center">
                      <p className="text-xs text-gray-900 dark:text-white-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {getDisplayText(item)}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
