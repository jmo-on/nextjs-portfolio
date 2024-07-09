"use client";

import React, { useTransition, useState } from "react"
import Image from "next/image"
import AboutTabButtons from "./AboutTabButtons";

interface TabDatum {
  title: string,
  id: string,
  content: React.JSX.Element
}

const TAB_DATA: TabDatum[] = [
  {
    title: "Skills",
    id: "skills",
    content: (
      <ul className="text-khaki list-disc pl-1">
        <li>Korean</li>
        <li>Japanese</li>
        <li>C</li>
        <li>C++</li>
        <li>JAVA</li>
        <li>Python</li>
        <li>HTML</li>
        <li>CSS / Tailwind / Bootstrap</li>
        <li>JavaScript / TypeScript</li>
      </ul>
    )
  },
  {
    title: "Education",
    id: "education",
    content: (
      <ul className="text-khaki">
        <li>Johns Hopkins University</li>
      </ul>
    )
  },
  {
    title: "Certification",
    id: "certification",
    content: (
      <ul className="text-khaki">
        <li>Certificate of Appreciation</li>
      </ul>
    )
  }
]

const AboutSection: React.FC = () => {
  const [tab, setTab] = useState("skills");
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (id: string) => {
    startTransition(() => {
      setTab(id);
    });
  };

  const selectedTab = TAB_DATA.find((t) => t.id === tab) ?? TAB_DATA[0];

  return (
    <section className="text-white">
      <div className="md:grid md:grid-cols-2 gap-8 items-center py-8 px-4 sm:py-16 xl:px-16 xl:gap-16">
        <Image src="/images/about-image.png" alt="about image" width={500} height={500} />
        <div className="mt-4 lg:mt-0 text-left flex flex-col h-full">
          <h2 className="text-4xl font-bold text-beige">About Me</h2>
          <p className="text-base lg:text-lg text-khaki">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Odit ipsum dolorum provident aperiam amet consequatur illum. Autem, deserunt sunt id, laudantium labore doloremque, quas earum consequatur culpa eaque nisi dolorum?
          </p>
          <div className="flex flex-row mt-8">
            <AboutTabButtons
              selectTab={() => handleTabChange("skills")}
              active={tab === "skills"}
            >
              {" "}Skills{" "}
            </AboutTabButtons>
            <AboutTabButtons
              selectTab={() => handleTabChange("education")}
              active={tab === "education"}
            >
              {" "}Education{" "}
            </AboutTabButtons>
            <AboutTabButtons
              selectTab={() => handleTabChange("certification")}
              active={tab === "certification"}
            >
              {" "}Certification{" "}
            </AboutTabButtons>
          </div>
          <div className="mt-8">{selectedTab.content}</div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection