import React from "react"

interface ProjectCardProps {
  title: string;
  description: string;
  imgUrl: string;
  gitUrl: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({title, description, imgUrl, gitUrl}) => {
  return (
    <div>
      <div className="h-52 md:h-72 rounded-t-xl relative group" style={{ background: `url(${imgUrl})`, backgroundSize: "cover"}}>
        <div className="overlay absolute top-0 left-0 w-full h-full bg-olive bg-opacity-0 hidden group-hover:flex group-hover:bg-opacity-80 transition-all duration-500">
          <a href={gitUrl}></a>
        </div>
      </div>
      <div className="text-beige bg-olive rounded-b-xl py-6 px-4 mt-3">
        <h5 className="font-xl font-semibold mb-2">{title}</h5>
        <p className="text-khaki">{description}</p>
      </div>
    </div>
  )
}

export default ProjectCard