import 'react';

declare namespace JSX {
  interface IntrinsicElements {
    'gdm-live-audio': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        theme?: string;
        ref?: React.Ref<any>;
      },
      HTMLElement
    >;
  }
}
