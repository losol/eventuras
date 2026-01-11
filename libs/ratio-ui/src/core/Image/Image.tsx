import React, { ComponentType } from 'react';

/** Minimal contract for any renderer (e.g. next/image) */
export interface ImageRendererProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  [key: string]: unknown;
}

/** Public props (see fields for details) */
export interface ImageProps {
  /** URL for the image */
  src: string;
  /** Accessible alt text */
  alt?: string;
  /** Optional caption text */
  caption?: string | null;
  /** Class for the figure element */
  figureClassName?: string;
  /** Class for the rendered image */
  imgClassName?: string;
  /** Class for the wrapper (figure/div) */
  wrapperClassName?: string;
  /** Class for the figcaption */
  figCaptionClassName?: string;
  /** Intrinsic width/height (forwarded to renderer) */
  width?: number;
  height?: number;
  /** Force wrapper semantics */
  as?: 'img' | 'figure';
  /** Loading strategy (lazy or eager) */
  loading?: 'lazy' | 'eager';
  /** Optional custom renderer (e.g. NextImage) */
  renderer?: ComponentType<ImageRendererProps>;
  /** Extra props passed to the renderer (e.g. sizes, priority) */
  rendererProps?: Record<string, unknown>;
}

/**
 * Generic Image with optional figure/caption semantics and pluggable renderer.
 * - Default: renders <img|renderer>.
 * - as="figure": wraps in <figure>.
 * - caption: always wraps in <figure> with <figcaption>.
 * @see ImageProps
 * @see ImageRendererProps
 */
export function Image(props: ImageProps) {
  // pick renderer or native <img>
  const Img: ComponentType<ImageRendererProps> =
    props.renderer ??
    ((p) => (
      // native img fallback
      <img loading={props.loading ?? 'lazy'} decoding="async" {...p} />
    ));

  // common image props
  const imgProps: ImageRendererProps = {
    src: props.src,
    alt: props.alt ?? '',
    width: props.width,
    height: props.height,
    className: props.imgClassName ?? 'h-auto max-w-full',
    loading: props.loading,
    ...(props.rendererProps ?? {}),
  };

  // decide wrapper semantics
  const mustBeFigure = Boolean(props.caption) || props.as === 'figure';

  // render figure variant
  if (mustBeFigure) {
    // wrapper class
    const wrapper = props.wrapperClassName ?? 'max-w-lg py-8';
    // caption class
    const cap =
      props.figCaptionClassName ??
      'mt-2 text-sm text-center text-gray-500 dark:text-gray-400';

    return (
      <figure className={wrapper}>
        <Img {...imgProps} />
        {props.caption ? (
          <figcaption className={cap}>
            <p>{props.caption}</p>
          </figcaption>
        ) : null}
      </figure>
    );
  }

  // render simple image (no figure)
  return <Img {...imgProps} />;
}
