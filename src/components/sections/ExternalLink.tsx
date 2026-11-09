import type { ComponentProps } from "react";

/** Link que abre em outra aba (WhatsApp, Instagram): sempre com `rel` seguro, em um lugar só. */
export function ExternalLink(props: ComponentProps<"a">) {
  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}
