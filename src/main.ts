export interface StreamPageScrollerOptions {
  deltaYThreshold: number;
  scrollContainerSelector: string;
  scrollSectionSelector: string;
  responsiveMediaQuery: string;
}

enum ScrollDirection {
  UP = "up",
  DOWN = "down",
}

enum ScrollMode {
  SLIDE = "slide",
  RESPONSIVE = "responsive",
}

export default class StreamPageScroller {
  private _options: StreamPageScrollerOptions;
  private _collectedScrollY: number = 0;
  private _scrollInProgress = false;
  private _scrollContainerEl: HTMLElement | null = null;
  private _sections!: HTMLElement[];
  private _activeIndex = 0;
  private _touchStartY: number = 0;
  private _mode: ScrollMode | null = null;

  private _wheelEventListener = this._handleWheelEvent.bind(this);
  private _transitionEndEventListener = this._handleTransitionEnd.bind(this);
  private _touchStartEventListener = this._handleTouchStart.bind(this);
  private _touchEndEventListener = this._handleTouchEnd.bind(this);
  private _resizeObserver: ResizeObserver | null = null;
  private _defaultScrollRestoration = history.scrollRestoration;

  constructor(options: Partial<StreamPageScrollerOptions>) {
    this._options = {
      deltaYThreshold: 30,
      scrollContainerSelector: ".scroll-container",
      scrollSectionSelector: ".section",
      responsiveMediaQuery: "(max-height: 0px)",
      ...options,
    };
    this._findElements();
    this._setMediaQueryListener();
  }

  private _setMediaQueryListener(): void {
    const mediaQuery = window.matchMedia(this._options.responsiveMediaQuery);
    const handler = () => {
      if (mediaQuery.matches) {
        this._setResponsiveMode();
      } else {
        this._setSlideMode();
      }
    };
    mediaQuery.addEventListener("change", handler);
    handler();
  }

  private _setSlideMode(): void {
    if (this._mode === ScrollMode.RESPONSIVE) {
      this._tearDownResponsiveMode();
    }
    this._mode = ScrollMode.SLIDE;
    this._setupListeners();
    this._addResizeObserver();
    this._collectedScrollY = 0;
    this._scrollInProgress = false;
    history.scrollRestoration = "manual";
    document.documentElement.scrollTop = 0;
  }

  private _tearDownSlideMode(): void {
    document.documentElement.removeEventListener(
      "wheel",
      this._wheelEventListener
    );
    this._scrollContainerEl?.removeEventListener(
      "transitionend",
      this._transitionEndEventListener
    );
    document.removeEventListener(
      "touchstart",
      this._touchStartEventListener,
      false
    );
    document.removeEventListener(
      "touchend",
      this._touchEndEventListener,
      false
    );
    if (!this._scrollContainerEl) {
      return;
    }
    this._scrollContainerEl.style.transform = `translateY(0px)`;
    this._resizeObserver?.disconnect();
  }

  private _tearDownResponsiveMode(): void {
    document.body.classList.remove("sps-responsive");
  }

  private _setResponsiveMode(): void {
    if (this._mode === ScrollMode.SLIDE) {
      this._tearDownSlideMode();
    }
    this._mode = ScrollMode.RESPONSIVE;
    history.scrollRestoration = this._defaultScrollRestoration;
    document.body.classList.add("sps-responsive");
  }

  private _setupListeners(): void {
    document.documentElement.addEventListener(
      "wheel",
      this._wheelEventListener
    );
    this._scrollContainerEl?.addEventListener(
      "transitionend",
      this._transitionEndEventListener
    );
    document.addEventListener(
      "touchstart",
      this._touchStartEventListener,
      false
    );
    document.addEventListener("touchend", this._touchEndEventListener, false);
  }

  private _addResizeObserver(): void {
    if (!this._resizeObserver) {
      this._resizeObserver = new ResizeObserver(() => {
        this._scrollToIndex(this._activeIndex);
      });
    }
    this._resizeObserver.observe(document.body);
  }

  private _findElements(): void {
    document.body.classList.add("sps-body");
    this._scrollContainerEl = document.querySelector(
      this._options.scrollContainerSelector
    );
    if (!this._scrollContainerEl) {
      console.warn(
        `StreamPageScroller: Scroll container element not found by selector: ${this._options.scrollContainerSelector}`
      );
    } else {
      this._scrollContainerEl.classList.add("sps-scroll-container");
    }
    this._sections = Array.from(
      document.querySelectorAll(this._options.scrollSectionSelector)
    );
    this._sections.forEach((section, i) => {
      section.dataset.spsIndex = i.toString();
      section.classList.add("sps-section");
    });
  }

  private _handleWheelEvent(event: WheelEvent): void {
    if (this._scrollInProgress) {
      return;
    }
    this._collectedScrollY += event.deltaY;
    if (Math.abs(this._collectedScrollY) >= this._options.deltaYThreshold) {
      this._scrollPage(
        this._collectedScrollY > 0 ? ScrollDirection.DOWN : ScrollDirection.UP
      );
    }
  }

  private _scrollPage(direction: ScrollDirection): void {
    this._collectedScrollY = 0;
    if (!this._scrollContainerEl) {
      return;
    }
    const nextIndex =
      direction === ScrollDirection.DOWN
        ? this._activeIndex + 1
        : this._activeIndex - 1;
    if (nextIndex >= 0 && nextIndex < this._sections.length) {
      this._scrollInProgress = true;
      this._scrollToIndex(nextIndex);
    }
  }

  private _scrollToIndex(index: number): void {
    if (!this._scrollContainerEl) {
      return;
    }
    this._scrollContainerEl.style.transform = `translateY(-${this._sections[index].offsetTop}px)`;
    this._activeIndex = index;
  }

  private _handleTransitionEnd(): void {
    this._scrollInProgress = false;
  }

  private _handleTouchStart(evt: TouchEvent): void {
    const firstTouch = evt.touches[0];
    this._touchStartY = firstTouch.clientY; // Get the initial touch position
  }

  private _handleTouchEnd(evt: TouchEvent): void {
    const endY = evt.changedTouches[0].clientY;
    const yDiff = this._touchStartY - endY;

    if (Math.abs(yDiff) > this._options.deltaYThreshold) {
      // Minimum threshold for swipe
      this._scrollPage(yDiff > 0 ? ScrollDirection.DOWN : ScrollDirection.UP);
    }
  }
}
