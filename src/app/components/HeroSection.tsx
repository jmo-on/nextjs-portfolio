'use client';

import React from "react"
import Image from "next/image"
import { TypeAnimation } from "react-type-animation";

const HeroSection  = () => {
  return (
    <section>
      <div className="grid grid-cols-1">
        <div className="order-2 col-span-7 text-center">
          <div className="order-1 col-span-5 place-self-center mb-10">
            <div className="rounded-full  w-[250px] h-[250px] relative overflow-hidden">
                <Image
                src="/images/profile.jpg"
                alt="profile image"
                className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                width={500} // trivial
                height={500} // trivial
                />
            </div>
          </div>
          <h1 className="text-black mb-4 text-5xl font font-extrabold">
            Jin Hong Moon
          </h1>
          <p className="text-black text-xl mb-6">
            Undergraduate @ Johns Hopkins University
            <br/>
            Software & Machine Learning Engineer
          </p>
          <div className="flex justify-center gap-4 mb-3">
            <button className="bg-black rounded-full px-1 py-1">
              <span className="block text-black hover:text-gray-200 bg-gray-300 hover:bg-transparent rounded-full px-5 py-2">
                <a target="_blank" href="https://www.linkedin.com/in/jayden-moonjh/">LinkedIn</a>
              </span>
            </button>
            <a
              href="/Jin_Hong_Moon-Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black rounded-full px-1 py-1"
            >
              <span className="block text-black hover:text-gray-200 bg-gray-300 hover:bg-transparent rounded-full px-5 py-2">
                Resume
              </span>
            </a>
          </div>
        </div>
      </div>  
    </section>
  )
}

export default HeroSection