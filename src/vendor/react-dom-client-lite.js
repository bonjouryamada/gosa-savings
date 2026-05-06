import { __setRootRenderer, renderElement } from "./react-lite.js";

export function createRoot(container) {
  return {
    render(vnode) {
      const draw = () => {
        container.replaceChildren(renderElement(vnode));
      };
      __setRootRenderer(draw);
      draw();
    },
  };
}
