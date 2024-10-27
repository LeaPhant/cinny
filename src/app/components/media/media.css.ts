import { style } from '@vanilla-extract/css';
import { DefaultReset, toRem } from 'folds';

export const Image = style([
  DefaultReset,
  {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  },
]);

export const EmbedImage = style([
  DefaultReset,
  {
    minWidth: toRem(16),
    minHeight: toRem(16),
    maxWidth: toRem(500),
    maxHeight: toRem(400)
  },
]);

export const Video = style([
  DefaultReset,
  {
    objectFit: 'contain',
    width: '100%',
    height: '100%',
  },
]);
