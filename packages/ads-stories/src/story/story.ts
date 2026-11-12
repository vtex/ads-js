import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import type { Channel } from "@vtex/ads-core";
import { cardStyles, renderCard } from "../components/card";
import {
  CarouselController,
  carouselSkeletonStyles,
  carouselStyles,
  RENDERED_SIDE,
  renderCarouselSkeleton,
  type Slide,
} from "../components/carousel";
import { StoryEventsController, type ViewTarget } from "../components/events";
import { VideoController } from "../components/media";
import {
  DEFAULT_LOCALE,
  priceFormatter,
  productStyles,
  toCardCta,
  toCardProduct,
  type FetchedProduct,
} from "../components/product";
import {
  neighborOffsets,
  PlayerController,
  playerStyles,
} from "../components/player";
import type { StoryAd } from "../types";
import {
  hydrateStoryProducts,
  intelligentSearchHydration,
  type StoryHydration,
  type StoryProductDetails,
} from "../utils/hydrate-products";
import { fetchStories } from "../utils/fetch-story";
import { httpUrl } from "../utils/http-url";
import { preloadImages } from "../utils/preload-images";
import { labelsFor, type StoryLabels } from "../locales";
import { TAG_NAME } from "../tag-name";

export { TAG_NAME } from "../tag-name";

// The properties that make up the ad and product requests: a change to any of
// them fetches the Story again.
const REQUEST_PROPERTIES = [
  "publisherId",
  "sessionId",
  "placement",
  "userId",
  "accountName",
  "channel",
  "quantity",
  "hydration",
] as const;

const CHANNELS: ReadonlySet<Channel> = new Set(["site", "app"]);

const isChannel = (value: string | null): value is Channel =>
  CHANNELS.has(value as Channel);

// Reads a boolean attribute: on only when present bare (`""`, as in HTML and
// React 19) or "true"; absent, "false" or any other value is off. React 18
// writes boolean props on custom elements as strings, so
// `inactive-autoplay={false}` arrives as inactive-autoplay="false".
const booleanConverter = {
  fromAttribute: (value: string | null) =>
    typeof value === "string" &&
    (value === "" || value.toLowerCase() === "true"),
};

// Reads the `channel` attribute. An unknown value leaves the property
// undefined, so it is not sent.
const channelConverter = {
  fromAttribute: (value: string | null) =>
    isChannel(value) ? value : undefined,
};

// Reads the `hydration` attribute: only "none" means something there (no
// product request). A strategy is set as a property.
const hydrationConverter = {
  fromAttribute: (value: string | null) =>
    value === "none" ? ("none" as const) : undefined,
};

// LitElement is importable where HTMLElement doesn't exist (SSR, Node): Lit
// falls back to a minimal shim there.
export class VtexAdsStoryCarouselElement extends LitElement {
  static readonly properties = {
    publisherId: { attribute: "publisher-id" },
    sessionId: { attribute: "session-id" },
    placement: {},
    userId: { attribute: "user-id" },
    accountName: { attribute: "account-name" },
    channel: { converter: channelConverter },
    timeout: { type: Number },
    quantity: { type: Number },
    currency: {},
    labelAddToCart: { attribute: "label-add-to-cart" },
    labelViewProduct: { attribute: "label-view-product" },
    hydration: { converter: hydrationConverter },
    hydrationTimeout: { type: Number, attribute: "hydration-timeout" },
    inactiveAutoplay: {
      type: Boolean,
      attribute: "inactive-autoplay",
      converter: booleanConverter,
    },
    stories: { state: true },
    products: { state: true },
    requesting: { state: true },
    mediaLoading: { state: true },
  };

  /** Required. The publisher the ads are requested for. */
  declare publisherId?: string;
  /** Required. The store's session, also used to deduplicate events. */
  declare sessionId?: string;
  /** Required. The Story placement configured for the publisher. */
  declare placement?: string;
  declare userId?: string;
  declare accountName?: string;
  /** `site` or `app`. Any other attribute value is ignored. */
  declare channel?: Channel;
  /**
   * Time limit for the ad request, in milliseconds (default 2000). Without a
   * Story by then, the element renders nothing. A change applies to the next
   * request; it doesn't request again.
   */
  declare timeout?: number;
  /**
   * How many Stories to ask for: the carousel positions (default 8). Missing,
   * below 1 or not a number: the default.
   */
  declare quantity?: number;
  /**
   * Currency of the prices, as an ISO 4217 code ("BRL", "ARS"). Missing or
   * invalid: BRL.
   */
  declare currency?: string;
  /**
   * The add to cart button's text. Missing or blank: the default in the
   * element's language ("Adicionar ao carrinho").
   */
  declare labelAddToCart?: string;
  /**
   * The view product button's text. Missing or blank: the default in the
   * element's language ("Ver produto").
   */
  declare labelViewProduct?: string;
  /**
   * Where the products' details (for now, their prices) come from. A
   * strategy (fetcher, matcher and price reader) is set as a property; the
   * attribute takes only "none", for no product request. Missing:
   * Intelligent Search when `account-name` is set, no product request
   * otherwise.
   */
  declare hydration?: StoryHydration | "none";
  /**
   * Time limit for the product request, in milliseconds (default 5000).
   * Without the prices by then, the cards show the ad server's.
   */
  declare hydrationTimeout?: number;
  /**
   * With more than one Story, whether the cards without the highlight also
   * play their video, muted. Off by default: they show only their cover, and
   * only the highlighted card plays.
   */
  declare inactiveAutoplay: boolean;

  /** The Stories shown: none while loading, on error or with none. */
  declare private stories: StoryAd[];

  /**
   * The fetched products, by Story `ad_id`, or `"loading"` while the product
   * request runs. Undefined without a product request.
   */
  declare private products?: Map<string, StoryProductDetails> | "loading";

  /**
   * The ad request is pending (and has what it needs to go out): a skeleton
   * stands in for the carousel until the Stories arrive.
   */
  declare private requesting: boolean;

  /**
   * The first Story's cover is still loading: a skeleton covers the cards
   * until it is ready (or MEDIA_TIMEOUT passes), so the first card doesn't
   * show up piece by piece.
   */
  declare private mediaLoading: boolean;

  /**
   * Cancels the wait for the cover in progress: when other Stories replace
   * its Stories, or the element leaves the page.
   */
  private mediaWait?: AbortController;

  /**
   * Cancels the request in progress. Kept, already aborted, when leaving the
   * page cancelled it, so connecting again requests once more.
   */
  private request?: AbortController;

  static readonly styles = [
    css`
      :host {
        display: block;
        font-family: var(--vtex-ads-story-font-family, inherit);
        color: var(--vtex-ads-story-color-text, inherit);
      }
    `,
    cardStyles,
    productStyles,
    carouselStyles,
    carouselSkeletonStyles,
    playerStyles,
  ];

  /**
   * One per rendered card, by its key (see Slide): a Story can show in more
   * than one card, each with its own video.
   */
  private readonly cardVideos = new Map<number, VideoController>();

  /** The sound was on when the highlight moved: the new card turns it on. */
  private soundPending = false;

  /**
   * What to do once the next render is on screen, when the new highlighted
   * card's video exists (see leaveHighlight and onLayoutChange). A step
   * taken before then replaces it.
   */
  private afterRender?: () => void;

  private readonly carousel = new CarouselController(this, {
    onStep: (from, to) => this.leaveHighlight(from, to),
    // Every card is new: so are their videos. Behind an open player, the
    // new highlighted card stays on its cover, as after a step.
    onLayoutChange: () => {
      this.cardVideos.clear();
      if (this.player.isOpen) {
        this.afterRender = () => this.activeVideo?.pause();
      }
    },
    // The player shows the highlighted Story: the highlight stays on it.
    locked: () => this.player.isOpen || this.mediaLoading,
  });

  private readonly player = new PlayerController(this, {
    onStep: (delta) => this.stepInPlayer(delta),
    onClose: () => this.closePlayer(),
  });

  // Added after the carousel and the player: its hostUpdated reads what
  // they rendered.
  private readonly events = new StoryEventsController(this, {
    identity: () => ({ sessionId: this.sessionId, userId: this.userId }),
    viewTargets: () => this.viewTargets(),
  });

  constructor() {
    super();
    this.inactiveAutoplay = false;
    this.stories = [];
    this.requesting = false;
    this.mediaLoading = false;
  }

  // Lit keeps the card's DOM when the element is moved (removed and appended
  // again), but the browser pauses a removed video and doesn't autoplay it
  // again. resume() only plays a video that autoplays (not with reduced
  // motion), and does nothing on the first connection, before the render.
  // Not in VideoController.hostConnected: there, the player's video is still
  // in the DOM until the next update and would play for a moment.
  connectedCallback() {
    super.connectedCallback();
    for (const video of this.cardVideos.values()) video.resume();

    // Moved while its request was pending: that request was cancelled.
    if (this.request?.signal.aborted) void this.loadStory();
  }

  // A request still pending when the element leaves the page is cancelled.
  disconnectedCallback() {
    super.disconnectedCallback();
    this.request?.abort();
    this.mediaWait?.abort();
  }

  protected willUpdate(changed: PropertyValues<this>) {
    if (REQUEST_PROPERTIES.some((name) => changed.has(name))) {
      void this.loadStory();
    }
  }

  protected updated() {
    const afterRender = this.afterRender;
    this.afterRender = undefined;
    afterRender?.();
  }

  // The strategy for the products' details, if any (see `hydration`).
  private get activeHydration(): StoryHydration | undefined {
    if (this.hydration === "none") return undefined;
    if (this.hydration) return this.hydration;
    return this.accountName ? intelligentSearchHydration : undefined;
  }

  /**
   * Requests the Story and shows it, then hydrates its products. Until the
   * Story arrives, and when there is none (see fetchStories), the element
   * renders nothing.
   */
  private async loadStory() {
    // A request still pending no longer matches the attributes.
    this.request?.abort();
    const request = new AbortController();
    this.request = request;

    // The Stories shown no longer match the request either.
    this.player.close();
    this.requesting = false;
    this.showStories([]);

    // Off the page (an attribute changed just before the element was
    // removed): keep the cancelled request, so connecting again requests.
    if (!this.isConnected) {
      request.abort();
      return;
    }

    this.requesting = Boolean(
      this.publisherId && this.sessionId && this.placement,
    );
    const stories = await fetchStories(this, {
      signal: request.signal,
      timeout: this.timeout,
    });

    // Cancelled meanwhile, by a newer request or by leaving the page: this
    // response is not shown.
    if (request.signal.aborted) return;
    this.requesting = false;

    const hydration = this.activeHydration;
    if (!hydration || !stories.some((story) => story.product)) {
      this.request = undefined;
      this.showStories(stories);
      return;
    }

    // The carousel shows now; the products' details replace their
    // placeholders later.
    this.showStories(stories, "loading");
    const products = await hydrateStoryProducts(
      this.placement ?? "",
      stories,
      hydration,
      {
        accountName: this.accountName ?? "",
        publisherId: this.publisherId ?? "",
        sessionId: this.sessionId ?? "",
        userId: this.userId,
        channel: this.channel,
      },
      { signal: request.signal, timeout: this.hydrationTimeout },
    );

    if (request.signal.aborted) return;
    this.request = undefined;
    this.products = products;
  }

  // Each card's video starts fresh: a failed load of an old one doesn't hide
  // it.
  private showStories(stories: StoryAd[], products?: "loading") {
    this.products = products;
    this.cardVideos.clear();
    this.soundPending = false;
    this.afterRender = undefined;
    this.carousel.reset(stories.length);
    this.stories = stories;
    this.events.impress(stories);
    void this.waitForFirstCover(stories);
  }

  private async waitForFirstCover(stories: StoryAd[]) {
    this.mediaWait?.abort();
    const wait = new AbortController();
    this.mediaWait = wait;
    const cover = httpUrl(stories[0]?.poster_url);

    this.mediaLoading = cover !== null;
    if (!cover) return;

    await preloadImages([cover], wait.signal);
    // Other Stories came meanwhile: they wait for their own media. Leaving
    // the page ends the wait with the cards shown.
    if (this.mediaWait === wait) this.mediaLoading = false;
  }

  /**
   * Where each Story is being watched: the cards on screen (not the hidden
   * ones kept for the slide in) and the open player's video, while their
   * video plays. A card showing only its cover doesn't count. Behind the
   * expanded player, a modal over the page, the cards are covered.
   */
  private *viewTargets(): Generator<ViewTarget> {
    const { stories } = this;
    if (this.mediaLoading) return;

    if (!this.player.isExpanded) {
      for (const [card, { key, index }] of this.carousel.visibleCards()) {
        const story = stories[index];
        if (story && this.cardVideos.get(key)?.playing) yield [card, story];
      }
    }

    const stageCard = this.player.stageCard;
    const active = stories[this.carousel.active];
    if (stageCard && active && this.player.video.playing) {
      yield [stageCard, active];
    }
  }

  private videoFor(key: number) {
    let video = this.cardVideos.get(key);
    if (!video) {
      video = new VideoController(this);
      this.cardVideos.set(key, video);
    }
    return video;
  }

  private get activeVideo(): VideoController | undefined {
    return this.cardVideos.get(this.carousel.activeKey);
  }

  // The card losing the highlight goes quiet: muted if it keeps playing, or
  // back to its cover. Its next video then starts fresh. If its sound was
  // on, the sound moves to the new highlighted card, once its video renders.
  // With the player open (it stepped), the new card stays on its cover
  // behind it instead. Cards no longer rendered (the rolling layout drops
  // them as it moves) leave with their videos.
  private leaveHighlight(from: number, to: number) {
    const video = this.cardVideos.get(from);
    // Still pending: moved again before the last step rendered.
    this.soundPending ||= video !== undefined && !video.muted;
    if (this.inactiveAutoplay) video?.mute();
    else video?.reset();

    // The step requested its render before calling this: updated() runs the
    // action once the new card is on screen.
    if (this.player.isOpen) {
      this.soundPending = false;
      // Paused before it starts, its autoplay doesn't start either.
      this.afterRender = () => this.videoFor(to).pause();
    } else if (this.soundPending) {
      this.afterRender = () => {
        this.soundPending = false;
        this.videoFor(to).playWithSound();
      };
    }

    for (const key of this.cardVideos.keys()) {
      if (Math.abs(key - to) > RENDERED_SIDE) this.cardVideos.delete(key);
    }
  }

  // The player's previous and next buttons: the highlight moves with the
  // Story the player shows.
  private stepInPlayer(delta: number) {
    this.carousel.step(delta, { evenIfLocked: true });
    void this.player.showNext(delta);
  }

  // From the card's product, the player opens with the product panel open.
  private openPlayer({ productOpen = false } = {}) {
    if (this.player.isOpen) return;

    // While the player is open, the card behind it stops on its cover.
    this.activeVideo?.pause();
    void this.player.open({ productOpen });
  }

  // The player also closes on its own when the element leaves the page,
  // without this: there is no card to give focus back to or to resume playing
  // (it would play out of sight).
  private closePlayer() {
    if (!this.player.isOpen) return;

    this.player.close();
    // The highlighted card, and with inactive-autoplay the others, which may
    // have been highlighted and paused while the player stepped.
    for (const video of this.cardVideos.values()) video.resume();
    this.carousel.focusActive();
  }

  // The formatter for the current language and currency, made again only
  // when either changes.
  private formatter?: {
    key: string;
    format: (amount: number) => string;
  };

  // Prices and texts follow the language of the closest element with a
  // `lang`, the element itself included, so a store can set one for the
  // widget alone. An empty `lang` (unknown) is skipped; none, or an unknown
  // one, falls back to pt-BR.
  private get locale() {
    return (
      this.closest<HTMLElement>('[lang]:not([lang=""])')?.lang ?? DEFAULT_LOCALE
    );
  }

  // The texts for the current language and label attributes, made again
  // only when any of them changes.
  private labelSet?: { key: string; labels: StoryLabels };

  private get labels() {
    const { locale, labelAddToCart = "", labelViewProduct = "" } = this;
    const key = JSON.stringify([locale, labelAddToCart, labelViewProduct]);
    if (this.labelSet?.key !== key) {
      this.labelSet = {
        key,
        labels: labelsFor(locale, {
          addToCart: labelAddToCart,
          viewProduct: labelViewProduct,
        }),
      };
    }
    return this.labelSet.labels;
  }

  private get formatPrice() {
    const { locale } = this;
    const key = `${locale}|${this.currency ?? ""}`;
    if (this.formatter?.key !== key) {
      this.formatter = { key, format: priceFormatter(locale, this.currency) };
    }
    return this.formatter.format;
  }

  private productOf(story: StoryAd) {
    const fetched: FetchedProduct =
      this.products === "loading" ? "loading" : this.products?.get(story.ad_id);
    return toCardProduct(story, this.formatPrice, this.labels, fetched);
  }

  // The highlighted card opens the player; another one takes the highlight.
  // Hidden cards, out of sight, show only their cover.
  private readonly renderSlide = (
    story: StoryAd,
    { key, index, offset, active, hidden, cardRef, focusRef }: Slide,
  ) =>
    renderCard(story, this.videoFor(key), {
      label: this.labels.position(
        active ? this.labels.watch : this.labels.show,
        index,
        this.stories.length,
      ),
      labels: this.labels,
      withVideo: active || (this.inactiveAutoplay && !hidden),
      product: this.productOf(story),
      onSelect: active
        ? () => this.openPlayer()
        : () => this.carousel.step(offset),
      // On a card without the highlight, the product moves it, as the card.
      onProductSelect: active
        ? () => this.openPlayer({ productOpen: true })
        : undefined,
      // On the highlighted card it follows the link; on another, it moves the
      // highlight.
      cta: toCardCta(story),
      onCtaSelect: active ? undefined : () => this.carousel.step(offset),
      onPress: () => this.events.click(story),
      ref: cardRef,
      openRef: focusRef,
    });

  protected render() {
    const { stories } = this;
    const index = this.carousel.active;
    const active = stories[index];
    if (!active && !this.requesting) return nothing;

    const loading = this.requesting || this.mediaLoading;

    return html`
      <div
        class="root"
        ?data-loading=${loading}
        ?data-requesting=${this.requesting}
      >
        ${active
          ? this.carousel.render(stories, this.renderSlide, this.labels)
          : nothing}
        ${renderCarouselSkeleton({ done: !loading })}
      </div>
      ${active ? this.renderPlayer(active) : nothing}
    `;
  }

  private renderPlayer(active: StoryAd) {
    const { stories } = this;
    const index = this.carousel.active;
    const neighbors = neighborOffsets(stories.length, index).map((offset) => {
      const neighbor = (index + offset + stories.length) % stories.length;
      return {
        offset,
        story: stories[neighbor],
        label: this.labels.position(this.labels.show, neighbor, stories.length),
      };
    });

    return this.player.render(active, {
      labels: this.labels,
      navigation: stories.length > 1,
      neighbors,
      product: this.productOf(active),
      cta: toCardCta(active),
      onPress: () => this.events.click(active),
    });
  }
}

// Types `document.createElement("vtex-ads-story-carousel")` and
// `querySelector` results as VtexAdsStoryCarouselElement in any TypeScript
// project, no framework needed.
declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: VtexAdsStoryCarouselElement;
  }
}

export function defineVtexAdsStoryCarousel() {
  if (typeof customElements === "undefined") return;
  if (customElements.get(TAG_NAME)) return;

  customElements.define(TAG_NAME, VtexAdsStoryCarouselElement);
}
