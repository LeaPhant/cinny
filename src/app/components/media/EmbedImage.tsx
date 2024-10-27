import React, { ImgHTMLAttributes, forwardRef } from 'react';
import classNames from 'classnames';
import * as css from './media.css';

export const EmbedImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, alt, ...props }, ref) => (
    <img className={classNames(css.EmbedImage, className)} x-test="embedimage" alt={alt} {...props} ref={ref} />
  )
);
