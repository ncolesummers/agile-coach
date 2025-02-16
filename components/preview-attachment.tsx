/**
 * Preview Attachment Component
 * Displays an attachment preview with optional loading state.
 * @module preview-attachment
 * @packageDocumentation
 */

import type { Attachment } from 'ai';

import { LoaderIcon } from './icons';

/**
 * Renders a preview of an attachment.
 *
 * @param attachment - Attachment object containing name, url, and contentType.
 * @param isUploading - Flag indicating if the attachment is being uploaded.
 * @returns JSX element showing the preview.
 * @throws Will show an error if attachment preview fails to load.
 * @example
 * <PreviewAttachment attachment={attachmentObj} isUploading={false} />
 * @see /src/shared/types.ts
 */
export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;

  return (
    <div className="flex flex-col gap-2">
      <div className="w-20 h-16 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center">
        {contentType ? (
          contentType.startsWith('image') ? (
            // NOTE: it is recommended to use next/image for images
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={name ?? 'An image attachment'}
              className="rounded-md size-full object-cover"
            />
          ) : (
            <div className="" />
          )
        ) : (
          <div className="" />
        )}

        {isUploading && (
          <div className="animate-spin absolute text-zinc-500">
            <LoaderIcon />
          </div>
        )}
      </div>
      <div className="text-xs text-zinc-500 max-w-16 truncate">{name}</div>
    </div>
  );
};
