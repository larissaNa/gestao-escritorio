import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Monkey patch para evitar crash com Google Translate e outras extensões que modificam o DOM
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    try {
      return originalRemoveChild.call(this, child);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        console.warn('Node.removeChild: The node to be removed is not a child of this node. Ignoring to prevent crash.');
        return child;
      }
      throw error;
    }
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    try {
      return originalInsertBefore.call(this, newNode, referenceNode);
    } catch (error) {
       if (error instanceof DOMException && error.name === 'NotFoundError') {
        console.warn('Node.insertBefore: The node before which the new node is to be inserted is not a child of this node. Ignoring to prevent crash.');
        return newNode;
      }
      throw error;
    }
  }
}

createRoot(document.getElementById("root")!).render(<App />);
