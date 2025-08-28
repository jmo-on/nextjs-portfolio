'use client';

import React from "react"
import Image from "next/image"
import { TypeAnimation } from "react-type-animation";

const HeroSection  = () => {
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="order-2 lg:order-1 col-span-7 place-self-start text-center sm:text-left">
          <h1 className="text-beige mb-4 text-4xl sm:text-5xl lg:text-6xl font font-extrabold">
            <TypeAnimation
              sequence={[
                "Jin Hong ",
                1000,
              ]}
              wrapper="span"
              speed={25}
              cursor={false}
              // repeat={Infinity}
            />
            <span className="bg-clip-text-css bg-gray-gradient">
              Moon
            </span>
          </h1>
          <p className="text-khaki sm:text-lg lg:text-xl mb-6">
            Undergraduate @ Johns Hopkins University <br/>
            SWE / ML
          </p>
          <button className="bg-khaki w-full sm:w-fit rounded-full px-1 py-1 mr-4 mb-3">
            <span className="block text-khaki hover:text-olive bg-olive hover:bg-transparent rounded-full px-5 py-2">
            <a target="_blank" href="https://www.linkedin.com/in/jayden-moonjh/">Linked In</a>
            </span>
          </button>
          <button className="bg-gray-gradient w-full sm:w-fit rounded-full px-1 py-1">
            <span className="block text-gray-400 hover:text-olive bg-olive hover:bg-transparent rounded-full px-5 py-2">
            <a href="/files/Jin_Hong_Moon-Resume.pdf" target="_blank" rel="noopener noreferrer">Resumé</a>
            </span>
          </button>
          {/* <h2 className="col-span-1 md:hidden text-center sm:text-left text-4xl font-bold text-beige mt-40 my-4">
            About Me
          </h2> */}
        </div>
        <div className="order-1 lg:order-2 col-span-5 place-self-center mb-10 lg:mt-1">
          <div className="rounded-full  w-[250px] h-[250px] lg:w-[300px] lg:h-[300px] relative overflow-hidden">
            <Image
              src="/images/profile-image.jpg"
              alt="profile image"
              className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              width={500} // trivial
              height={500} // trivial
            />
          </div>
        </div>
      </div>  
    </section>
  )
}

export default HeroSection