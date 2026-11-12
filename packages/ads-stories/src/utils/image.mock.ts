/**
 * An `Image` whose decode() settles when the test says so. Every decode() call
 * is tracked on its own, so the same URL requested twice never overwrites an
 * earlier one.
 */
export interface PendingDecode {
  /** The image's URL when decode() was called. */
  src: string;
  resolve: () => void;
  reject: () => void;
}

/** The decode() calls made since the last resetImageMock(), in order. */
export const pendingDecodes: PendingDecode[] = [];

export class FakeImage {
  src = "";

  decode() {
    return new Promise<void>((resolve, reject) => {
      pendingDecodes.push({
        src: this.src,
        resolve,
        reject: () => reject(new Error("decode failed")),
      });
    });
  }
}

/** Forgets the decode() calls of the previous test. */
export const resetImageMock = () => {
  pendingDecodes.length = 0;
};

/** The first decode() call for `src`. */
export const decodeOf = (src: string) =>
  pendingDecodes.find((decode) => decode.src === src);
