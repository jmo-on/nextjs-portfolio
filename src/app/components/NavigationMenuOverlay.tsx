import React from "react"
import NavigationMenuItem from "./NavigationMenuItem";

interface Link {
  href: string;
  title: string;
}

interface NavigationMenuOverlayProps {
  links: Link[];
}

const NavigationMenuOverlay: React.FC<NavigationMenuOverlayProps> = ({ links }) => {
  return (
    <ul className="flex flex-col items-center py-4 pl-2">
      {
        links.map((link, index) => (
          <li key={index}>
            <NavigationMenuItem href={link.href} title={link.title} />
          </li>
        ))
      }
    </ul>
  )
}

export default NavigationMenuOverlay