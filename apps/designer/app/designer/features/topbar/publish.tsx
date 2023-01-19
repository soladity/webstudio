import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { ExternalLinkIcon, RocketIcon } from "@webstudio-is/icons";
import {
  Text,
  Button,
  DeprecatedButton,
  Flex,
  DeprecatedLabel,
  Link,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  TextField,
  useId,
} from "@webstudio-is/design-system";
import { useIsPublishDialogOpen } from "../../shared/nano-states";
import env from "~/shared/env";
import type { Project } from "@webstudio-is/project";
import { restPublishPath } from "~/shared/router-utils";
import { theme } from "@webstudio-is/design-system";
type PublishButtonProps = { project: Project };

const getHost = () => {
  if (env.PUBLISHER_ENDPOINT && env.PUBLISHER_HOST) {
    return env.PUBLISHER_HOST;
  }
  // We use location.host to get the hostname and port in development mode and to not break local testing.
  return env.DESIGNER_HOST || location.host;
};

const Content = ({ project }: PublishButtonProps) => {
  const id = useId();
  const fetcher = useFetcher();
  const [url, setUrl] = useState<string>();
  const domain = fetcher.data?.domain || project.domain;

  useEffect(() => {
    if (typeof location !== "object" || !domain) {
      return;
    }
    setUrl(`${location.protocol}//${domain}.${getHost()}`);
  }, [domain]);

  return (
    <PopoverContent
      css={{ padding: theme.spacing[9] }}
      hideArrow={true}
      onFocusOutside={(event) => {
        // Used to prevent closing when opened from the main dropdown menu
        event.preventDefault();
      }}
    >
      <fetcher.Form method="post" action={restPublishPath()}>
        <Flex direction="column" gap="2">
          {url !== undefined && (
            <Link
              href={url}
              target="_blank"
              css={{
                display: "flex",
                gap: theme.spacing[0],
              }}
            >
              <Text truncate>{`${domain}.${getHost()}`}</Text>
              <ExternalLinkIcon />
            </Link>
          )}
          <Flex gap="2" align="center">
            <input type="hidden" name="projectId" value={project.id} />
            <DeprecatedLabel htmlFor={id}>Domain:</DeprecatedLabel>
            <TextField id={id} name="domain" defaultValue={domain} />
          </Flex>
          {fetcher.data?.errors !== undefined && (
            <Text color="error">{fetcher.data?.errors}</Text>
          )}
          <Button pending={fetcher.state !== "idle"} type="submit">
            {fetcher.state !== "idle" ? "Publishing" : "Publish"}
          </Button>
        </Flex>
      </fetcher.Form>
    </PopoverContent>
  );
};

export const PublishButton = ({ project }: PublishButtonProps) => {
  const [isOpen, setIsOpen] = useIsPublishDialogOpen();
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild aria-label="Publish">
        <DeprecatedButton
          ghost
          css={{ display: "flex", gap: theme.spacing[3] }}
        >
          <RocketIcon />
          <Text>Publish</Text>
        </DeprecatedButton>
      </PopoverTrigger>
      <PopoverPortal>
        <Content project={project} />
      </PopoverPortal>
    </Popover>
  );
};
