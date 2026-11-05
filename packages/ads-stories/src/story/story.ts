import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import type { Channel } from "@vtex/ads-core";
import { cardStyles, renderCard } from "../components/card";
import {
  CarouselController,
  carouselStyles,
  RENDERED_SIDE,
  type Slide,
} from "../components/carousel";
import { VideoController } from "../components/media";
import { PlayerController, playerStyles } from "../components/player";
import type { StoryAd } from "../types";
import { fetchStories } from "../utils/fetch-story";

export const TAG_NAME = "vtex-ads-story";

// The properties that make up the ad request: a change to any of them fetches
// the Story again.
const REQUEST_PROPERTIES = [
  "publisherId",
  "sessionId",
  "placement",
  "userId",
  "accountName",
  "channel",
  "quantity",
] as const;

const CHANNELS: ReadonlySet<Channel> = new Set(["site", "app"]);

const isChannel = (value: string | null): value is Channel =>
  CHANNELS.has(value as Channel);

// Reads the `channel` attribute. An unknown value leaves the property
// undefined, so it is not sent.
const channelConverter = {
  fromAttribute: (value: string | null) =>
    isChannel(value) ? value : undefined,
};

// Temporary: fixed texts until the store can set them by attribute.
const LABELS = {
  watch: "Assistir vídeo",
  show: "Mostrar vídeo",
  carousel: "Vídeos",
  carouselRole: "carrossel",
  previous: "Vídeo anterior",
  next: "Próximo vídeo",
  player: "Vídeo",
  expand: "Expandir vídeo",
  collapse: "Reduzir vídeo",
  close: "Fechar vídeo",
  play: "Reproduzir vídeo",
  pause: "Pausar vídeo",
  soundOn: "Ativar som",
  soundOff: "Desativar som",
};

// LitElement is importable where HTMLElement doesn't exist (SSR, Node): Lit
// falls back to a minimal shim there.
export class VtexAdsStoryElement extends LitElement {
  static readonly properties = {
    publisherId: { attribute: "publisher-id" },
    sessionId: { attribute: "session-id" },
    placement: {},
    userId: { attribute: "user-id" },
    accountName: { attribute: "account-name" },
    channel: { converter: channelConverter },
    timeout: { type: Number },
    quantity: { type: Number },
    inactiveAutoplay: { type: Boolean, attribute: "inactive-autoplay" },
    stories: { state: true },
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
   * With more than one Story, whether the cards without the highlight also
   * play their video, muted. Off by default: they show only their cover, and
   * only the highlighted card plays.
   */
  declare inactiveAutoplay: boolean;

  /** The Stories shown: none while loading, on error or with none. */
  declare private stories: StoryAd[];

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
    carouselStyles,
    playerStyles,
  ];

  /**
   * One per rendered card, by its key (see Slide): a Story can show in more
   * than one card, each with its own video.
   */
  private readonly cardVideos = new Map<number, VideoController>();

  private readonly carousel = new CarouselController(this, {
    labels: LABELS,
    onStep: (from, to) => this.leaveHighlight(from, to),
    // Every card is new: so are their videos.
    onLayoutChange: () => this.cardVideos.clear(),
    // The player shows the highlighted Story: the highlight stays on it.
    locked: () => this.player.isOpen,
  });

  private readonly player = new PlayerController(this, {
    label: LABELS.player,
    expandLabel: LABELS.expand,
    collapseLabel: LABELS.collapse,
    closeLabel: LABELS.close,
    playLabel: LABELS.play,
    pauseLabel: LABELS.pause,
    soundOnLabel: LABELS.soundOn,
    soundOffLabel: LABELS.soundOff,
    onClose: () => this.closePlayer(),
  });

  constructor() {
    super();
    this.inactiveAutoplay = false;
    this.stories = [];
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
  }

  protected willUpdate(changed: PropertyValues<this>) {
    if (REQUEST_PROPERTIES.some((name) => changed.has(name))) {
      void this.loadStory();
    }
  }

  /**
   * Requests the Story and shows it. Until it arrives, and when there is none
   * (see fetchStories), the element renders nothing.
   */
  private async loadStory() {
    // A request still pending no longer matches the attributes.
    this.request?.abort();
    const request = new AbortController();
    this.request = request;

    // The Stories shown no longer match the request either.
    this.player.close();
    this.showStories([]);

    // Off the page (an attribute changed just before the element was
    // removed): keep the cancelled request, so connecting again requests.
    if (!this.isConnected) {
      request.abort();
      return;
    }

    const stories = await fetchStories(this, {
      signal: request.signal,
      timeout: this.timeout,
    });

    // Cancelled meanwhile, by a newer request or by leaving the page: this
    // response is not shown.
    if (request.signal.aborted) return;
    this.request = undefined;
    this.showStories(stories);
  }

  // Each card's video starts fresh: a failed load of an old one doesn't hide
  // it.
  private showStories(stories: StoryAd[]) {
    this.cardVideos.clear();
    this.carousel.reset(stories.length);
    this.stories = stories;
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
  // back to its cover. Its next video then starts fresh. Cards no longer
  // rendered (the rolling layout drops them as it moves) leave with their
  // videos.
  private leaveHighlight(from: number, to: number) {
    const video = this.cardVideos.get(from);
    if (this.inactiveAutoplay) video?.mute();
    else video?.reset();

    for (const key of this.cardVideos.keys()) {
      if (Math.abs(key - to) > RENDERED_SIDE) this.cardVideos.delete(key);
    }
  }

  private openPlayer() {
    if (this.player.isOpen) return;

    // While the player is open, the card behind it stops on its cover.
    this.activeVideo?.pause();
    void this.player.open();
  }

  // The player also closes on its own when the element leaves the page,
  // without this: there is no card to give focus back to or to resume playing
  // (it would play out of sight).
  private closePlayer() {
    if (!this.player.isOpen) return;

    this.player.close();
    this.activeVideo?.resume();
    this.renderRoot
      .querySelector<HTMLElement>(
        '.carousel[data-layout="solo"] .card-open, .slide[data-active] .card-open',
      )
      ?.focus();
  }

  // The highlighted card opens the player; another one takes the highlight.
  // Hidden cards, out of sight, show only their cover.
  private readonly renderSlide = (
    story: StoryAd,
    { key, offset, active, hidden }: Slide,
  ) =>
    renderCard(story, this.videoFor(key), {
      label: active ? LABELS.watch : LABELS.show,
      soundOnLabel: LABELS.soundOn,
      soundOffLabel: LABELS.soundOff,
      withVideo: active || (this.inactiveAutoplay && !hidden),
      onSelect: active
        ? () => this.openPlayer()
        : () => this.carousel.step(offset),
    });

  protected render() {
    const { stories } = this;
    const active = stories[this.carousel.active];
    if (!active) return nothing;

    return html`
      <div class="root">${this.carousel.render(stories, this.renderSlide)}</div>
      ${this.player.render(active)}
    `;
  }
}

// Types `document.createElement("vtex-ads-story")` and `querySelector` results
// as VtexAdsStoryElement in any TypeScript project, no framework needed.
declare global {
  interface HTMLElementTagNameMap {
    "vtex-ads-story": VtexAdsStoryElement;
  }
}

export function defineVtexAdsStories() {
  if (typeof customElements === "undefined") return;
  if (customElements.get(TAG_NAME)) return;

  customElements.define(TAG_NAME, VtexAdsStoryElement);
}
