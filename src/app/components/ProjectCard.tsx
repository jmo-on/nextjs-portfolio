import React from "react"

interface ProjectCardProps {
  imgUrl: string;
  title: string;
  description: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({imgUrl, title, description}) => {
  return (
    <div>
      <div className="h-52 md:h-72" style={{ background: `url(${imgUrl})`, backgroundSize: "cover"}}></div>
      <div className="text-beige">
        <h5>{title}</h5>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default ProjectCard