import Footer from "../../../shared/components/Footer";
import { ProjectsModelShowcase } from "./ProjectsModelShowcase";
import { ProjectsShowcase } from "./ProjectsShowcase";

export function Projects() {
  return (
    <div className="relative min-h-screen bg-[#DFD6C9] text-[#2D2623] selection:bg-[#4C3E39] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Syne:wght@700;800&family=Oswald:wght@700&display=swap');

        @font-face {
          font-family: 'The Bold Font';
          src: local('The Bold Font'), local('TheBoldFont'), url('https://fonts.cdnfonts.com/s/15852/THE_BOLD_FONT.woff') format('woff');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }

        .font-bold-display {
          font-family: 'The Bold Font', 'Syne', 'Oswald', sans-serif;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }

        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <main className="w-full">
        <ProjectsShowcase />
        <ProjectsModelShowcase />
      </main>

      <Footer />
    </div>
  );
}

export default Projects;
