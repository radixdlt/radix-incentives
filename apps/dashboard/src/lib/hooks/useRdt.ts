import { useContext } from "react";
import { RadixContext } from "~/lib/providers/rdtProvider";

export const useDappToolkit = () => {
  const context = useContext(RadixContext);

  if (!context) {
    return;
  }
  return context;
};
