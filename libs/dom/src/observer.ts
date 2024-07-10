export type RemoveCallback = (node: Node) => void;

const $$callbacks = new Map<Node, RemoveCallback>();

const $$observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      for (const removedNode of mutation.removedNodes) {
        const callback = $$callbacks.get(removedNode);
        if (typeof callback !== 'undefined') {
          callback(removedNode);
        }
      }
    }
  }
});

export function observe(node: Node) {
  $$observer.observe(node, { childList: true, subtree: true });
}

export function onRemoveNode(node: Node, cb: RemoveCallback) {
  $$callbacks.set(node, cb);
}
