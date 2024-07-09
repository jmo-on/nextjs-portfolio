"use client";

import Link from "next/link"
import React, { useState } from "react"
import NavigationMenuItem from "./NavigationMenuItem"
import NavigationMenuOverlay from "./NavigationMenuOverlay";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid"

const menuItems = [
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

const NavigationBar = () => {
  const [navBarOpen, setNavBarOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-[#1a200a] bg-opacity-90">
      <div className="flex flex-wrap items-center justify-between mx-auto px-4 py-2">
        <Link href={"/"} className="text-2xl md:text-5xl text-beige font-semibold">
          Logo
        </Link>
        <div className="mobile-menu block md:hidden">
          {
            ! navBarOpen ? (
              <button onClick={() => setNavBarOpen(true)} className="flex items-center px-3 py-2 border rounded border-white">
                <Bars3Icon className="h-5 w-5"/>
              </button>
            ) : (
              <button onClick={() => setNavBarOpen(false)} className="flex items-center px-3 py-2 border rounded border-white">
                <XMarkIcon className="h-5 w-5"/>
              </button>
            )
          }
        </div>
        <div className="menu hidden md:block md:w-auto" id="navbar">
          <ul className="flex p-4 md:flex-row md:p-0 md:space-x-8">
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
      { navBarOpen ? <NavigationMenuOverlay links={menuItems} /> : null}
    </nav>
  )
}

export default NavigationBar