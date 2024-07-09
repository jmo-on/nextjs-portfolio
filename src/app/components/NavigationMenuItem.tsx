import Link from "next/link"
import { FC } from "react";

interface NavigationMenuItemProps {
  href: string;
  title: string;
}


const NavigationMenuItem: FC<NavigationMenuItemProps> = ({ href, title }) => {
  return (
    <Link href={href} className="block py-2 pl-3 pr-4 text-beige sm:text-xl rounded md:p-0 hover:text-white">
      {title}
    </Link>
  );
}

export default NavigationMenuItem