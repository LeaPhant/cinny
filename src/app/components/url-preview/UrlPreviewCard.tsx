import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { IPreviewUrlResponse, MsgType } from 'matrix-js-sdk';
import { Box, Icon, IconButton, Icons, Scroll, Spinner, Text, as, color, config, toRem } from 'folds';
import { AsyncStatus, useAsyncCallback } from '../../hooks/useAsyncCallback';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { UrlPreview, UrlPreviewContent, UrlPreviewDescription, UrlPreviewImg } from './UrlPreview';
import { scaleDimension } from '../../utils/common';
import { ImageContent } from '../message/content/ImageContent';
import { VideoContent } from '../message/content/VideoContent';
import { EmbedImage, Video } from '../media';
import { ImageViewer } from '../image-viewer';
import { MImage, MVideo } from '../message';
import {
  getIntersectionObserverEntry,
  useIntersectionObserver,
} from '../../hooks/useIntersectionObserver';
import * as css from './UrlPreviewCard.css';
import { tryDecodeURIComponent } from '../../utils/dom';
import { mxcUrlToHttp } from '../../utils/matrix';
import { useMediaAuthentication } from '../../hooks/useMediaAuthentication';
import {
  IImageContent, IVideoContent
} from '../../../types/matrix/common';


const linkStyles = { color: color.Success.Main };

const renderFile = () => (
  <></>
);

export const UrlPreviewCard = as<'div', { url: string, ts: number }>(
  ({ url, ts, ...props }, ref) => {
    const urlObj = new URL(url);
    const mx = useMatrixClient();
    const useAuthentication = useMediaAuthentication();
    const [previewStatus, loadPreview] = useAsyncCallback(
      useCallback(() => mx.getUrlPreview(url, ts), [url, ts, mx])
    );

    useEffect(() => {
      loadPreview();
    }, [loadPreview]);

    //if (previewStatus.status === AsyncStatus.Error) return null;

    const renderContent = (prev?: IPreviewUrlResponse) => {
      const ext = urlObj.pathname.split('.').pop() || '';

      if (['mp4', 'webm', 'mov'].includes(ext)) {
        const content: IVideoContent = {
          msgtype: MsgType.Video,
          url: url || '',
          info: {
            w: 600,
            h: 400,
            mimetype: 'video/mp4'
          }
        };

        return <MVideo
          content={content}
          renderAsFile={renderFile}
          renderVideoContent={({ body, info, mimeType, url, encInfo }) => (
            <VideoContent
              body={body}
              info={info}
              mimeType={mimeType}
              url={url}
              encInfo={encInfo}
              renderVideo={(p) => <Video {...p} />}
            />
          )}
          outlined={false}
        />;
      }

      if (['youtu.be', 'youtube.com', 'www.youtube.com', 'music.youtube.com'].includes(urlObj.host)) {
        let timestamp = 0;

        const params = new URLSearchParams(urlObj.search);

        if (params.has('t')) {
          const t = parseInt(params.get('t') || '');

          if (!isNaN(t)) timestamp = t;
        }

        let videoId = '';

        if (params.has('v')) {
          videoId = params.get('v') || '';
        } else {
          videoId = urlObj.pathname.split('/').pop() || '';
        }

        if (videoId.length === 0) return null; 

        const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?t=${timestamp}`;

        return <iframe 
          width="500" 
          height="282" 
          src={embedUrl}
          frameBorder="0"
          title="YouTube video player" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen>
        </iframe>;
      }

      if (prev === undefined) return null;

      if (urlObj.host == 'tenor.com') {
        const dim = scaleDimension(Number(prev['og:player:width']), Number(prev['og:player:height']), 16, 16, 500, 400);
        const videoUrl = String(prev['og:video']) ?? '';

        const content: IVideoContent = {
          msgtype: MsgType.Video,
          url: videoUrl || '',
          info: {
            w: dim.w,
            h: dim.h,
            mimetype: 'video/mp4'
          }
        };

        return <MVideo
          content={content}
          renderAsFile={renderFile}
          renderVideoContent={({ body, info, mimeType, url, encInfo }) => (
            <VideoContent
              body={body}
              info={info}
              autoPlay={true}
              loop={true}
              controls={false}
              mimeType={mimeType}
              url={url}
              encInfo={encInfo}
              renderVideo={(p) => <Video {...p} />}
            />
          )}
          outlined={false}
        />;
      }

      const imgUrl = mxcUrlToHttp(mx, prev['og:image'] || '',  useAuthentication, 500, 600, 'scale', false);

      if (prev['og:title'] === undefined && prev['og:image'] !== undefined) {
        const url = prev['og:image'];

        const content: IImageContent = {
          msgtype: MsgType.Image,
          url: url || '',
          info: {
            w: prev['og:image:width'] || 500,
            h: prev['og:image:height'] || 500,
            mimetype: prev['og:image:type'],
            size: prev['matrix:image:size']
          }
        };

        return <MImage
          content={content}
          renderImageContent={(props) => (
            <ImageContent
              {...props}
              autoPlay={true}
              renderImage={(p) => <EmbedImage {...p} loading="lazy" />}
              renderViewer={(p) => <ImageViewer {...p} />}
            />
          )}
          outlined={false}
        />
      }

      return (
        <>
          {imgUrl && <UrlPreviewImg src={imgUrl} alt={prev['og:title']} title={prev['og:title']} />}
          <UrlPreviewContent>
            <Text
              style={linkStyles}
              truncate
              as="a"
              href={url}
              target="_blank"
              rel="no-referrer"
              size="T200"
              priority="300"
            >
              {typeof prev['og:site_name'] === 'string' && `${prev['og:site_name']} | `}
              {tryDecodeURIComponent(url)}
            </Text>
            <Text truncate priority="400">
              <b>{prev['og:title']}</b>
            </Text>
            <Text size="T200" priority="300">
              <UrlPreviewDescription>{prev['og:description']}</UrlPreviewDescription>
            </Text>
          </UrlPreviewContent>
        </>
      );
    };

    return (
      <UrlPreview {...props} ref={ref}>
        {previewStatus.status === AsyncStatus.Success ? (
          renderContent(previewStatus.data)
        ) :
          previewStatus.status === AsyncStatus.Error ? (
            renderContent()
          ) : (
          <Box grow="Yes" style={{minWidth: `100px`, minHeight: `100px`}} alignItems="Center" justifyContent="Center">
            <Spinner variant="Secondary" size="400" />
          </Box>
        )}
      </UrlPreview>
    );
  }
);

export const UrlPreviewHolder = as<'div'>(({ children, ...props }, ref) => {
  return (
    <Box
      direction="Column"
      alignItems="Start"
      {...props}
      ref={ref}
      style={{ marginTop: config.space.S200, position: 'relative' }}
      gap="200"
    >
      {children}
    </Box>
  );
});
