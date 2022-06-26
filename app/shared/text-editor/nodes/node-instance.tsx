import { type EditorConfig, TextNode } from "lexical";
import { render } from "react-dom";

type Options = {
  component: JSX.Element;
  text: string;
};

export class InstanceNode extends TextNode {
  static getType(): "instance" {
    return "instance";
  }

  static clone(node: InstanceNode) {
    return new InstanceNode(node.options);
  }

  constructor(options: Options) {
    // This makes sure caret is at the end of the selection after inserting this node instance
    super(options.text);
    this.options = options;
  }

  createDOM(config: EditorConfig) {
    const container = super.createDOM(config);
    render(this.options.component, container);
    return container;
  }

  updateDOM(prevNode: TextNode, dom: HTMLElement, config: EditorConfig) {
    const inner = dom.firstChild as HTMLElement;
    if (inner === null) {
      return true;
    }
    super.updateDOM(prevNode, inner, config);

    return false;
  }

  isInline(): true {
    return true;
  }

  canInsertTextBefore(): false {
    return false;
  }

  canInsertTextAfter(): false {
    return false;
  }
}

export function $createInstanceNode(options: Options) {
  return new InstanceNode(options);
}
