import 'react';

declare namespace JSX {
  interface IntrinsicElements {
    'gdm-live-audio': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}
