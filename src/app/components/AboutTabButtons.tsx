import React, { ReactNode } from "react"

interface AboutTabButtonsProps {
  active: boolean;
  selectTab: () => void;
  children: ReactNode;
}

const AboutTabButtons: React.FC<AboutTabButtonsProps> = ({ active, selectTab, children }) => {
  const buttonClasses = active ? "text-beige border-b border-khaki" : "text-beige"

  return (
    <button onClick={selectTab}>
      <p className={`mr-3 font-semibold ${buttonClasses}`}>{ children }</p>
    </button>
  )
}

export default AboutTabButtons