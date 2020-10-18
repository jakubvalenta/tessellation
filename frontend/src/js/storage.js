export const MAX_COMPOSITIONS_PER_USER = 100;

// Keep in sync with Django setting MAX_UPLOAD_SIZE_BYTES
const MAX_UPLOAD_SIZE_BYTES = 1000000;

export function validateLocalStateBeforePublish() {
  if (this.items.length >= MAX_COMPOSITIONS_PER_USER) {
    return 'You have reached the maximum number of published compositions. Delete some compositions to be able to publish new ones.';
  }
  return null;
}

export function validateStateBeforePublish(state) {
  for (let i = 0; i < state.images.length; i++) {
    if (state.images[i].url.length > MAX_UPLOAD_SIZE_BYTES) {
      return `When publishing, the maximum allowed size of a tile image is ${MAX_UPLOAD_SIZE_BYTES} bytes. Please choose a smaller image.`;
    }
  }
  return null;
}
