import React from "react"
import ProjectCard from "./ProjectCard"

interface projectDatum {
  id: number;
  title: string;
  description: string;
  imgUrl: string;
  gitUrl:string;
}

const projectData: projectDatum[] = [
]

const ProjectSection: React.FC = () => {
  return (
    <div>
      <h2>My Projects</h2>
      <div className="text-beige flex flex-row justify-center items-center gap-2 py-6">
        <button className="rounded-full border-2 border-khaki px-6 py-3 text-xl cursor-pointer">All</button>
        <button className="rounded-full border-2 border-beige hover:border-white px-6 py-3 text-xl cursor-pointer">In Progress</button>
      </div>
      <div>
        {projectData.map((project) => (
          <ProjectCard key={project.id} title={project.title} description={project.description} imgUrl={project.imgUrl} gitUrl={project.gitUrl}/>
        ))}
      </div>
    </div>
  )
}

export default ProjectSection