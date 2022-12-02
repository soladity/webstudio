import BodyMeta from "./body.ws";
import BoxMeta from "./box.ws";
import TextBlockMeta from "./text-block.ws";
import HeadingMeta from "./heading.ws";
import ParagraphMeta from "./paragraph.ws";
import LinkMeta from "./link.ws";
import RichTextLinkMeta from "./rich-text-link.ws";
import SpanMeta from "./span.ws";
import BoldMeta from "./bold.ws";
import ItalicMeta from "./italic.ws";
import SuperscriptMeta from "./superscript.ws";
import SubscriptMeta from "./subscript.ws";
import ButtonMeta from "./button.ws";
import InputMeta from "./input.ws";
import FormMeta from "./form.ws";
import ImageMeta from "./image.ws";

import { Body } from "./body";
import { Box } from "./box";
import { TextBlock } from "./text-block";
import { Heading } from "./heading";
import { Paragraph } from "./paragraph";
import { Link } from "./link";
import { RichTextLink } from "./rich-text-link";
import { Span } from "./span";
import { Bold } from "./bold";
import { Italic } from "./italic";
import { Superscript } from "./superscript";
import { Subscript } from "./subscript";
import { Button } from "./button";
import { Input } from "./input";
import { Form } from "./form";
import { Image } from "./image";

import type { WsComponentMeta, MetaProps } from "./component-type";

const meta = {
  Box: BoxMeta,
  Body: BodyMeta,
  TextBlock: TextBlockMeta,
  Heading: HeadingMeta,
  Paragraph: ParagraphMeta,
  Link: LinkMeta,
  RichTextLink: RichTextLinkMeta,
  Span: SpanMeta,
  Bold: BoldMeta,
  Italic: ItalicMeta,
  Superscript: SuperscriptMeta,
  Subscript: SubscriptMeta,
  Button: ButtonMeta,
  Input: InputMeta,
  Form: FormMeta,
  Image: ImageMeta,
} as const;

const components = {
  Box,
  Body,
  TextBlock,
  Heading,
  Paragraph,
  Link,
  RichTextLink,
  Span,
  Bold,
  Italic,
  Superscript,
  Subscript,
  Button,
  Input,
  Form,
  Image,
} as const;

export type ComponentName = keyof typeof components;
type RegisteredComponents = Partial<{
  // eslint-disable-next-line @typescript-eslint/ban-types
  [p in ComponentName]: {};
}>;

type RegisteredComponentsMeta = Partial<{
  [p in ComponentName]: Partial<WsComponentMeta>;
}>;

let registeredComponents: RegisteredComponents | null = null;
let registeredComponentsMeta: RegisteredComponentsMeta | null = null;

const componentNames = Object.keys(components) as ComponentName[];

export const getComponentNames = (): ComponentName[] => {
  const uniqueNames = new Set([
    ...componentNames,
    ...Object.keys(registeredComponents || {}),
  ]);

  return [...uniqueNames.values()] as ComponentName[];
};

export const getComponentMeta = (name: ComponentName): WsComponentMeta => {
  if (registeredComponentsMeta != null && name in registeredComponentsMeta) {
    return { ...meta[name], ...registeredComponentsMeta[name] };
  }

  return meta[name];
};

export const getComponent = (
  name: ComponentName
): typeof components[ComponentName] => {
  return registeredComponents != null && name in registeredComponents
    ? (registeredComponents[name] as typeof components[ComponentName])
    : components[name];
};

export const getComponentMetaProps = (name: ComponentName): MetaProps => {
  if (registeredComponentsMeta != null && name in registeredComponentsMeta) {
    const allMetaPropKeys = new Set([
      ...Object.keys(meta[name]?.props ?? {}),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...Object.keys(registeredComponentsMeta[name]!.props!),
    ]);

    const props: MetaProps = {};
    /**
     * Merge props, taking non null defaultValue and required=true from meta
     **/
    for (const key of allMetaPropKeys.values()) {
      props[key] = {
        ...meta[name]?.props[key],
        ...registeredComponentsMeta[name]?.props?.[key],
        defaultValue:
          registeredComponentsMeta[name]?.props?.[key]?.defaultValue ??
          meta[name]?.props[key]?.defaultValue ??
          null,
        required:
          registeredComponentsMeta[name]?.props?.[key]?.required ||
          meta[name]?.props[key]?.required,
      } as MetaProps[string];
    }
    return props;
  }

  return meta[name].props;
};

/**
 *  @todo: Allow register any component.
 * Now we can register only existings Components, as all our type system would
 * break otherwise, see getComponent etc. So its overwriteComponent now
 **/
export const registerComponents = (components: RegisteredComponents) => {
  registeredComponents = components;
};

export const registerComponentsMeta = (
  componentsMeta: RegisteredComponentsMeta
) => {
  registeredComponentsMeta = componentsMeta;
};
