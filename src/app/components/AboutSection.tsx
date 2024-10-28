"use client";

import React, { useTransition, useState } from "react"
import Image from "next/image"
import AboutTabButtons from "./AboutTabButtons";

interface tabDatum {
  title: string,
  id: string,
  content: React.JSX.Element
}

const tabData: tabDatum[] = [
  {
    title: "Skills",
    id: "skills",
    content: (
      <div className="flex">
        <div>
        <h2 className="text-khaki font-bold">Language</h2>
          <ul className="text-khaki list-disc pl-3">
            <li>Python / C / C++ / C# / Java / R</li>
            <li>JavaScript / TypeScript</li>
            <li>HTML / CSS (Tailwind, Bootstrap)</li>
            <li>SQL (PostgreSQL, MySQL) / NoSQL (MongoDB)</li>
          </ul>
          <h2 className="text-khaki font-bold">Frameworks</h2>
          <ul className="text-khaki list-disc pl-3">
            <li>React.js / Next.js / Node.js / Django / Flask / Spring Boot</li>
            <li>JMonkeyEngine / Unity</li>
          </ul>
          <h2 className="text-khaki font-bold">Tools</h2>
          <ul className="text-khaki list-disc pl-3">
            <li>AWS / Google Cloud</li>
            <li>Git / Docker / Kubernetes</li>
          </ul>
          <h2 className="text-khaki font-bold">Libraries</h2>
          <ul className="text-khaki list-disc pl-3">
            <li>TensorFlow / PyTorch / scikit-learn</li>
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
          <li>Minors: Arts</li>
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

  const selectedTab = tabData.find((t) => t.id === tab) ?? tabData[0];

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