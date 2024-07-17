"use client";

import React, { useState } from "react"
import Image from "next/image";
import Link from "next/link"
import NavigationMenuItem from "./NavigationMenuItem"
import NavigationMenuOverlay from "./NavigationMenuOverlay";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid"

interface menuItem {
  href: string;
  title: string;
}

const menuItems: menuItem[] = [
  {
    href: "#about",
    title: "About"
  },
  {
    href: "#project",
    title: "Project"
  },
  {
    href: "#contact",
    title: "Contact"
  }
]

const NavigationBar: React.FC = () => {
  const [navBarOpen, setNavBarOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-[#1a200a] bg-opacity-90">
      <div className="flex flex-wrap items-center justify-between mx-auto px-4 py-2">
        <Link href={"/"} className="text-2xl md:text-5xl text-beige font-semibold">
          <Image src="/images/moon-logo.png" alt="logo image" width={100} height={100} />
        </Link>
        {/* <div className="mobile-menu block md:hidden">
          {
            ! navBarOpen ? (
              <button onClick={() => setNavBarOpen(true)} className="flex items-center px-3 py-2 border rounded border-beige">
                <Bars3Icon className="h-5 w-5 text-beige"/>
              </button>
            ) : (
              <button onClick={() => setNavBarOpen(false)} className="flex items-center px-3 py-2 border rounded border-beige">
                <XMarkIcon className="h-5 w-5"/>
              </button>
            )
          }
        </div>
        <div className="menu hidden md:block md:w-auto" id="navbar">
          <ul className="flex p-4 md:flex-row md:p-0 md:space-x-8 lg:pr-4">
            {
              menuItems.map((link, index) => (
                <li key={index}>
                  <NavigationMenuItem href={link.href} title={link.title} />
                </li>
              ))
            }
          </ul>
        </div>
      </div>
      { navBarOpen ? <NavigationMenuOverlay links={menuItems} /> : null} */}
      </div>
    </nav>
  )
}

export default NavigationBar