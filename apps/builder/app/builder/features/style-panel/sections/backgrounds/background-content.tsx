/**
 * Will be fully rewritten in next iteration,
 * as of now just implement feature parity with old backgrounds section
 **/

import type { RgbValue, StyleValue } from "@webstudio-is/css-data";
import {
  theme,
  Flex,
  Grid,
  ToggleGroup,
  ToggleGroupButton,
  Separator,
  styled,
} from "@webstudio-is/design-system";
import { ImageControl, SelectControl, PositionControl } from "../../controls";
import type { StyleInfo } from "../../shared/style-info";
import type {
  DeleteProperty,
  SetProperty,
  StyleUpdateOptions,
} from "../../shared/use-style-data";

import {
  type DeleteBackgroundProperty,
  isBackgroundLayeredProperty,
  isBackgroundStyleValue,
  type SetBackgroundProperty,
} from "./background-layers";

import { FloatingPanelProvider } from "~/builder/shared/floating-panel";
import { useRef, useState } from "react";
import { BackgroundSize } from "./background-size";
import { ToggleGroupControl } from "../../controls/toggle/toggle-control";
import {
  RepeatGridIcon,
  RepeatColumnIcon,
  RepeatRowIcon,
  CrossSmallIcon,
} from "@webstudio-is/icons";
import { toValue } from "@webstudio-is/css-engine";
import { BackgroundGradient } from "./background-gradient";
import { NonResetablePropertyName } from "../../shared/property-name";

type BackgroundContentProps = {
  currentStyle: StyleInfo;
  setProperty: SetBackgroundProperty;
  deleteProperty: DeleteBackgroundProperty;
  setBackgroundColor: (color: RgbValue) => void;
};

const safeDeleteProperty = (
  deleteProperty: DeleteBackgroundProperty
): DeleteProperty => {
  return (property, options) => {
    const isLayered = isBackgroundLayeredProperty(property);
    if (isLayered) {
      return deleteProperty(property, options);
    }
    throw new Error(`Property ${property} should be background style property`);
  };
};

const safeSetProperty = (setBackgroundProperty: SetBackgroundProperty) => {
  const result: SetProperty = (property) => {
    if (isBackgroundLayeredProperty(property)) {
      return (style: string | StyleValue, options?: StyleUpdateOptions) => {
        if (typeof style === "string") {
          throw new Error("style should be StyleValue and not a string");
        }

        if (isBackgroundStyleValue(style)) {
          return setBackgroundProperty(property)(style, options);
        }

        throw new Error("Style should be valid BackgroundStyleValue");
      };
    }

    throw new Error(`Property ${property} should be background style property`);
  };

  return result;
};

const detectImageOrGradientToggle = (currentStyle: StyleInfo) => {
  if (currentStyle?.backgroundImage?.value.type === "image") {
    return "image";
  }

  if (currentStyle?.backgroundImage?.value.type === "keyword") {
    // The only allowed keyword for backgroundImage is none
    return "image";
  }

  return "gradient";
};

const isImageOrGradient = (value: string): value is "image" | "gradient" => {
  return value === "image" || value === "gradient";
};

const BackgroundSection = styled("div", {
  mx: theme.spacing[9],
  my: theme.spacing[6],
});

const Spacer = styled("div", {
  height: theme.spacing[5],
});

export const BackgroundContent = (props: BackgroundContentProps) => {
  const setProperty = safeSetProperty(props.setProperty);
  const deleteProperty = safeDeleteProperty(props.deleteProperty);

  const elementRef = useRef<HTMLDivElement>(null);
  const [imageGradientToggle, setImageGradientToggle] = useState<
    "image" | "gradient"
  >(() => detectImageOrGradientToggle(props.currentStyle));

  return (
    <>
      <BackgroundSection ref={elementRef}>
        <Flex justify="center">
          <ToggleGroup
            type="single"
            value={imageGradientToggle}
            onValueChange={(value) => {
              if (isImageOrGradient(value)) {
                setImageGradientToggle(value);
              }
            }}
          >
            <ToggleGroupButton value={"image"}>
              <Flex css={{ px: theme.spacing[2] }}>Image</Flex>
            </ToggleGroupButton>
            <ToggleGroupButton value={"gradient"}>
              <Flex css={{ px: theme.spacing[2] }}>Gradient</Flex>
            </ToggleGroupButton>
          </ToggleGroup>
        </Flex>
      </BackgroundSection>

      <Separator css={{ gridColumn: "span 2" }} />

      <BackgroundSection>
        <Grid
          css={{ gridTemplateColumns: `1fr ${theme.spacing[23]}` }}
          align="center"
          gap={2}
        >
          {imageGradientToggle === "image" && (
            <>
              <NonResetablePropertyName
                style={props.currentStyle}
                properties={["backgroundImage"]}
                label="Image"
              />

              <FloatingPanelProvider container={elementRef}>
                <ImageControl
                  setProperty={setProperty}
                  deleteProperty={deleteProperty}
                  currentStyle={props.currentStyle}
                  property="backgroundImage"
                />
              </FloatingPanelProvider>
            </>
          )}

          {imageGradientToggle === "gradient" && (
            <Flex css={{ gridColumn: "span 2" }} direction="column">
              <NonResetablePropertyName
                style={props.currentStyle}
                description={
                  <>
                    Paste a CSS gradient, for example:
                    <br />
                    <br />
                    linear-gradient(...)
                    <br />
                    <br />
                    If pasting from figma, remove the “background” property
                    name.
                  </>
                }
                properties={["backgroundImage"]}
                label="Code"
              />

              <BackgroundGradient
                setProperty={setProperty}
                deleteProperty={deleteProperty}
                currentStyle={props.currentStyle}
                setBackgroundColor={props.setBackgroundColor}
              />
            </Flex>
          )}

          <NonResetablePropertyName
            style={props.currentStyle}
            properties={["backgroundClip"]}
            label="Clip"
          />

          <SelectControl
            setProperty={setProperty}
            deleteProperty={deleteProperty}
            currentStyle={props.currentStyle}
            property="backgroundClip"
          />

          <NonResetablePropertyName
            style={props.currentStyle}
            properties={["backgroundOrigin"]}
            label="Origin"
          />

          <SelectControl
            setProperty={setProperty}
            deleteProperty={deleteProperty}
            currentStyle={props.currentStyle}
            property="backgroundOrigin"
          />
        </Grid>

        <Spacer />

        <BackgroundSize
          setProperty={setProperty}
          deleteProperty={deleteProperty}
          currentStyle={props.currentStyle}
        />

        <Spacer />

        <PositionControl
          setProperty={setProperty}
          deleteProperty={deleteProperty}
          currentStyle={props.currentStyle}
          property="backgroundPosition"
        />

        <Grid
          css={{
            gridTemplateColumns: `1fr ${theme.spacing[23]}`,
            mt: theme.spacing[5],
          }}
          align="center"
          gap={2}
        >
          {imageGradientToggle === "image" && (
            <>
              <NonResetablePropertyName
                style={props.currentStyle}
                properties={["backgroundRepeat"]}
                label="Repeat"
              />

              <Flex css={{ justifySelf: "end" }}>
                <ToggleGroupControl
                  styleSource={"default"}
                  onValueChange={(value) =>
                    setProperty("backgroundRepeat")({
                      type: "keyword",
                      value,
                    })
                  }
                  value={toValue(props.currentStyle.backgroundRepeat?.value)}
                  items={[
                    {
                      child: <CrossSmallIcon />,
                      label: "background-repeat: no-repeat",
                      value: "no-repeat",
                    },
                    {
                      child: <RepeatGridIcon />,
                      label: "background-repeat: repeat",
                      value: "repeat",
                    },
                    {
                      child: <RepeatColumnIcon />,
                      label: "background-repeat: repeat-y",
                      value: "repeat-y",
                    },
                    {
                      child: <RepeatRowIcon />,
                      label: "background-repeat: repeat-x",
                      value: "repeat-x",
                    },
                  ]}
                />
              </Flex>
            </>
          )}

          <NonResetablePropertyName
            style={props.currentStyle}
            properties={["backgroundAttachment"]}
            label="Attachment"
          />

          <Flex css={{ justifySelf: "end" }}>
            <ToggleGroup
              type="single"
              value={toValue(props.currentStyle.backgroundAttachment?.value)}
              onValueChange={(value) => {
                setProperty("backgroundAttachment")({
                  type: "keyword",
                  value,
                });
              }}
            >
              <ToggleGroupButton value={"scroll"}>
                <Flex css={{ px: theme.spacing[3] }}>Scroll</Flex>
              </ToggleGroupButton>
              <ToggleGroupButton value={"fixed"}>
                <Flex css={{ px: theme.spacing[3] }}>Fixed</Flex>
              </ToggleGroupButton>
            </ToggleGroup>
          </Flex>

          <NonResetablePropertyName
            style={props.currentStyle}
            properties={["backgroundBlendMode"]}
            label="Blend mode"
          />

          <SelectControl
            setProperty={setProperty}
            deleteProperty={deleteProperty}
            currentStyle={props.currentStyle}
            property="backgroundBlendMode"
          />
        </Grid>
      </BackgroundSection>
    </>
  );
};
