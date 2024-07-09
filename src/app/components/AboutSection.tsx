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
      <div className="flex">
        <div>
          <h2 className="text-khaki font-bold">Coding</h2>
          <ul className="text-khaki list-disc pl-3">
            <li>C</li>
            <li>C++</li>
            <li>JAVA</li>
            <li>Python</li>
            <li>R</li>
            <li>SQL</li>
            <li>HTML</li>
            <li>CSS / Tailwind / Bootstrap</li>
            <li>JavaScript / TypeScript</li>
            <li>Linux</li>
            <li>AWS / GCP</li>
            <li>Django / MERN / Spring Boot</li>
          </ul>
        </div>
        <div>
          <h2 className="text-khaki font-bold">Language</h2>
          <ul className="text-khaki list-disc pl-3">
            <li>Korean</li>
            <li>Japanese</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "Education",
    id: "education",
    content: (
      <div>
        <h2 className="text-khaki font-bold">Johns Hopkins University (GPA: 4.0/4)</h2>
        <ul className="text-khaki list-disc pl-3">
          <li>Expected Graduation: 2026</li>
          <li>Majors: Computer Science, Applied Math & Statistics</li>
          <li>Minors: Arts, Entrepreneursip & Management, Computer Integrated Surgery</li>
        </ul>
        <br/>
        <h2 className="text-khaki font-bold">Korea University</h2>
        <ul className="text-khaki list-disc pl-3">
          <li>2024 International Winter Campus</li>
          <li>Courses: Linear Algebra (A)</li>
        </ul>
      </div>
    )
  },
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
        <div className="md:w-auto pl-4 pr-4 m-auto sm:m-0">
          <Image src="/images/about-image.png" alt="about image" width={500} height={500} />
        </div>
        <div className="mt-4 lg:mt-0 text-left flex flex-col h-full">
          <h2 className="hidden md:block text-4xl font-bold text-beige">About Me</h2>
          <p className="text-base lg:text-lg text-khaki">
            
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
          </div>
          <div className="mt-4">{selectedTab.content}</div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection