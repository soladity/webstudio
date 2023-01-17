import type { Publish } from "~/shared/pubsub";
import {
  Text,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  Paragraph,
  Box,
  Flex,
  EnhancedTooltipProvider,
} from "@webstudio-is/design-system";
import { StylePanel } from "~/designer/features/style-panel";
import { PropsPanel } from "~/designer/features/props-panel";
import { useSelectedInstanceData } from "~/designer/shared/nano-states";
import { FloatingPanelProvider } from "~/designer/shared/floating-panel";
import { useRef } from "react";
import { theme } from "@webstudio-is/design-system";

type InspectorProps = {
  publish: Publish;
};

const contentStyle = {
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
};

export const Inspector = ({ publish }: InspectorProps) => {
  const [selectedInstanceData] = useSelectedInstanceData();
  const tabsRef = useRef<HTMLDivElement>(null);

  if (selectedInstanceData === undefined) {
    return (
      <Box css={{ p: theme.spacing[5], flexBasis: "100%" }}>
        {/* @todo: use this space for something more usefull: a-la figma's no instance selected sate, maybe create an issue with a more specific proposal? */}
        <Card
          css={{ p: theme.spacing[9], mt: theme.spacing[9], width: "100%" }}
        >
          <Paragraph>Select an instance on the canvas</Paragraph>
        </Card>
      </Box>
    );
  }

  return (
    <EnhancedTooltipProvider
      delayDuration={1600}
      disableHoverableContent={false}
      skipDelayDuration={0}
    >
      <FloatingPanelProvider container={tabsRef}>
        <Flex as={Tabs} defaultValue="style" ref={tabsRef}>
          <TabsList>
            <TabsTrigger value="style">
              <Text>Style</Text>
            </TabsTrigger>
            {/* @note: events would be part of props */}
            <TabsTrigger value="props">
              <Text>Props</Text>
            </TabsTrigger>
            <TabsTrigger value="inspect">
              <Text>Inspect</Text>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="style" css={contentStyle}>
            <StylePanel
              publish={publish}
              selectedInstanceData={selectedInstanceData}
            />
          </TabsContent>
          <TabsContent value="props" css={contentStyle}>
            <PropsPanel
              publish={publish}
              key={
                selectedInstanceData.id /* Re-render when instance changes */
              }
              selectedInstanceData={selectedInstanceData}
            />
          </TabsContent>
        </Flex>
      </FloatingPanelProvider>
    </EnhancedTooltipProvider>
  );
};
