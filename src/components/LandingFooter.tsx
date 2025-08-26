import { Linkedin, LucideFacebook, Twitter } from "lucide-react";

const LandingFooter = () => {
  return (
    <div className="bg-black-90 pt-20">
      <div className=" flex flex-col md:flex-row gap-10 justify-between w-full">
        <div className="px-10 md:ps-24 md:w-3/4">
          <div className="text-white text-xl sm:text-3xl font-light font-family-inter">
            <h2>let astryx </h2>
            <h2>automate it for you.</h2>
          </div>

          <div className="mt-6">
            <input
              placeholder="enter your email id here."
              className="text-white-80 placeholder:text-white-40 text-lg sm:text-3xl md:text-2xl outline-none border-b border-white-50 py-4 w-full md:w-[70%] font-family-inter"
            />
            <div className="text-white flex gap-2 items-center mt-5 cursor-pointer">
              <button className="text-white text-lg sm:text-3xl md:text-2xl lg:text-3xl cursor-pointer font-family-inter">
                start free trail
              </button>
              <img src={"/icons/rightArrow.svg"} alt="->" className="" />
            </div>
          </div>
        </div>
        <div className="md:w-2/4">
          <div className="relative">
            <img src={"./footerAstryx.png"} alt="astry-logo" />
            <img
              src={"./playground.png"}
              alt="playground-image"
              className="lg:w-[200px] lg:h-[100px] md:w-[150px] md:h-[70px] w-[180px] h-[80px] absolute top-5 left-[20%] md:left-[35%] cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="bg-black text-white-40 py-7 mt-5">
        <div className=" flex justify-between items-center px-2 md:px-20 w-full">
          <div className="flex gap-3 items-center text-sm md:text-base">
            <p>&copy; Astryx</p>
            <p>Bengaluru, India</p>
          </div>
          <div className="flex gap-2 md:gap-5 items-center">
            <a href="#">
              <LucideFacebook color="white" />
            </a>
            <a href="#">
              <Twitter color="white" />
            </a>
            <a href="#">
              <Linkedin color="white" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingFooter;
