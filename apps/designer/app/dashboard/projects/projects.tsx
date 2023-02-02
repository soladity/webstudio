import { Flex, Text } from "@webstudio-is/design-system";
import { EmptyState } from "./empty-state";
import { Panel } from "./panel";
import type { DashboardProject } from "@webstudio-is/dashboard";
import { ProjectCard } from "./project-card";
import { CreateProject } from "./project-dialogs";

type ProjectsProps = {
  projects: Array<DashboardProject>;
};

export const Projects = ({ projects }: ProjectsProps) => {
  return (
    <Panel>
      <Flex direction="column" gap="3">
        <Flex justify="between">
          <Text variant="brandSectionTitle" as="h2">
            Projects
          </Text>
          <CreateProject />
        </Flex>
        {projects.length === 0 && <EmptyState />}
        <Flex gap="6" wrap="wrap">
          {projects.map((project) => {
            return <ProjectCard {...project} key={project.id} />;
          })}
        </Flex>
      </Flex>
    </Panel>
  );
};
