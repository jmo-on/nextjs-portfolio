import React from 'react'
import Image from 'next/image'
import { TypeAnimation } from 'react-type-animation';

export const HeroSection  = () => {
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="col-span-7 place-self-center text-center sm:text-left">
          <h1 className="text-khaki mb-4 text-4xl sm:text-5xl lg:text-6xl font font-extrabold">
            <TypeAnimation
              sequence={[
                'Jin Hong ',
                1000,
              ]}
              wrapper="span"
              speed={50}
              cursor={false}
              // repeat={Infinity}
            />
            <span className="text-transparent bg-clip-text-css bg-gray-gradient">
              Moon
            </span>
          </h1>
          <p className="text-gray-400 sm:text-lg lg:text-xl mb-6">
          Enthusiastic UG @ Johns Hopkins University majoring in Computer Science and aiming for Masters.
          Area of focus is Full-stack, NLP, ML, and Computer Graphics.
          </p>
          <button className="bg-khaki w-full sm:w-fit rounded-full px-1 py-1 mr-4 mb-3">
            <span className="block text-khaki hover:text-olive bg-olive hover:bg-transparent rounded-full px-5 py-2">
              Linked In
            </span>
          </button>
          <button className="bg-gray-gradient w-full sm:w-fit rounded-full px-1 py-1">
            <span className="block text-gray-400 hover:text-olive bg-olive hover:bg-transparent rounded-full px-5 py-2">
              Resumé
            </span>
          </button>
        </div>
        <div className="col-span-5 place-self-center mt-4 lg:mt-1">
          <div className="rounded-full  w-[250px] h-[250px] lg:w-[300px] lg:h-[300px] relative overflow-hidden">
            <Image
              src="/images/profile.png"
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
