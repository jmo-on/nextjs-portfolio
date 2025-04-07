"use client";

import React, { useTransition, useState } from "react"
import Image from "next/image"

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
      </div>
    )
  },
  {
    title: "Education",
    id: "education",
    content: (
      <div>
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
    
      {/* <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="order-2 lg:order-1 col-span-7 place-self-start text-center sm:text-left">
          
        </div>
        <div className="order-1 lg:order-2 col-span-5 place-self-center mb-10 lg:mt-1" />
      </div> */}

      <h2 className="hidden lg:block text-4xl font-bold text-beige md:mt-0 sm:mt-10">About Me</h2>

      <div className="md:grid md:grid-cols-2 gap-8 items-start sm:py-8 xl:px-16 xl:gap-16">

        <div className="grid md:w-auto pl-4 pr-4 m-auto sm:m-0">
          <p className="mr-3 mb-1 font-semibold text-beige border-b border-khaki">
            {" "}Education{" "}
          </p>
          <h2 className="text-khaki font-bold">Johns Hopkins University (GPA: 3.96/4)</h2>
          <ul className="list-disc pl-3 text-beige">
            <li>Expected Graduation: 2027</li>
            <li>Majors: Computer Science, Applied Math & Statistics</li>
          </ul>
          <br/>

          <p className="mr-3 mb-1 font-semibold text-beige border-b border-khaki">
            {" "}Experiences{" "}
          </p>
          <h2 className="text-khaki font-bold">Internships</h2>
          <ul className="list-disc pl-3 text-beige">
            <li>Bloomberg</li>
            <li>Claudius Legal Intelligence</li>
          </ul>

          <h2 className="text-khaki font-bold">Projects</h2>
          <ul className="list-disc pl-3 text-beige">
            <li>Noori AI, Summit, Delineo Modeling Project</li>
          </ul>
        </div>

        <div className="md:w-auto pl-4 pr-4 m-auto sm:m-0">
          <p className="mr-3 mb-1 font-semibold text-beige border-b border-khaki">
            {" "}Skills{" "}
          </p>
          <div className="flex-col gap-5">
            <div>
              <h2 className="text-khaki font-bold">Languages</h2>
              <ul className="list-disc pl-3 text-beige">
                <li>Python, C, C++, Go, Java, SQL</li>
              </ul>
              <h2 className="text-khaki font-bold">Frameworks</h2>
              <ul className="list-disc pl-3 text-beige">
                <li>Flask, Django, Supabase, Node.js, React.js, Next.js</li>
              </ul>
              <h2 className="text-khaki font-bold">Developer Tools</h2>
              <ul className="list-disc pl-3 text-beige">
                <li>AWS, GCP, Docker, Kubernetes, Celery, Apache Spark</li>
              </ul>
              <h2 className="text-khaki font-bold">Libraries</h2>
              <ul className="list-disc pl-3 text-beige">
                <li>PyTorch, TensorFlow, Scikit-learn, HuggingFace</li>
                <li>Numpy, Pandas, Matplotlib, SQLAlchemy</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

    </section>
  )
}

export default AboutSection