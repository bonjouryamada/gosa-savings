let currentComponent = null;
let hookIndex = 0;
const hookState = new Map();
let rootRenderer = null;

function flattenChildren(children) {
  return children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false);
}

export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...(props || {}),
      children: flattenChildren(children),
    },
  };
}

export function useState(initialValue) {
  const component = currentComponent;
  const hooks = hookState.get(component) || [];
  if (!(hookIndex in hooks)) {
    hooks[hookIndex] = typeof initialValue === "function" ? initialValue() : initialValue;
  }
  const stateIndex = hookIndex;
  const setState = (nextValue) => {
    const value = typeof nextValue === "function" ? nextValue(hooks[stateIndex]) : nextValue;
    hooks[stateIndex] = value;
    hookState.set(component, hooks);
    if (rootRenderer) rootRenderer();
  };
  const value = hooks[hookIndex];
  hookIndex += 1;
  hookState.set(component, hooks);
  return [value, setState];
}

export function useMemo(factory) {
  return factory();
}

export function renderElement(vnode) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(String(vnode));
  }

  if (!vnode) {
    return document.createTextNode("");
  }

  if (typeof vnode.type === "function") {
    const previousComponent = currentComponent;
    currentComponent = vnode.type;
    hookIndex = 0;
    const rendered = vnode.type(vnode.props || {});
    currentComponent = previousComponent;
    return renderElement(rendered);
  }

  const node = document.createElement(vnode.type);
  const props = vnode.props || {};

  Object.entries(props).forEach(([key, value]) => {
    if (key === "children" || value === null || value === undefined || value === false) return;
    if (key === "className") {
      node.setAttribute("class", value);
      return;
    }
    if (key === "htmlFor") {
      node.setAttribute("for", value);
      return;
    }
    if (key === "style" && typeof value === "object") {
      Object.assign(node.style, value);
      return;
    }
    if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
      return;
    }
    if (value === true) {
      node.setAttribute(key, "");
      return;
    }
    node.setAttribute(key, value);
  });

  flattenChildren(props.children || []).forEach((child) => {
    node.appendChild(renderElement(child));
  });

  return node;
}

export function __setRootRenderer(renderer) {
  rootRenderer = renderer;
}

const React = {
  StrictMode({ children }) {
    return children?.[0] || null;
  },
  createElement,
};

export default React;
