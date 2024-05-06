export interface StreamPageScrollerOptions {
  deltaYThreshold: number;
  scrollContainerSelector: string;
  scrollSectionSelector: string;
  responsiveMediaQuery: string;
  /**
   * Each section can contain subsections. In case there are more than one subsection specified for a section
   * each scroll hit (mouse wheel or touch swipe) will emit a next subsection event instead of
   * scrolling to the next section. When entering a section the subsection event will be emitted
   * for the first subsection. Such event will be emitted before the transition starts.
   * Caution! They can't have zeroes, otherwise it will break logic.
   */
  subsections?: number[]; // sets how many subsections are in each section, default all sections have 1 subsection
  subsectionTransitionDuration: number; // used to block scroll events during subsection transition
  onSubsectionEnter: (sectionIndex: number, subsectionIndex: number) => void;
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
  private _activeSubsectionIndex = -1;
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
      subsectionTransitionDuration: 700,
      onSubsectionEnter: () => {},
      ...options,
    };
    this._findElements();
    this._setMediaQueryListener();
  }

  /**
   * Sets the current subsection index for the active section.
   * Intended to be used in slide mode when subsection content has been changed
   * as a result of user interaction. It doesn't causes event emission.
   * @param subsectionIndex number
   */
  public setSubsection(subsectionIndex: number): void {
    this._activeSubsectionIndex = subsectionIndex;
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
        this._scrollToIndex(
          this._activeIndex,
          this._activeSubsectionIndex >= 0 ? this._activeSubsectionIndex : 0
        );
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
    if (
      (this._isTopPosition() && event.deltaY < 0) ||
      (this._isBottomPosition() && event.deltaY > 0)
    ) {
      return;
    }
    this._collectedScrollY += event.deltaY;
    if (Math.abs(this._collectedScrollY) >= this._options.deltaYThreshold) {
      this._scrollPage(
        this._collectedScrollY > 0 ? ScrollDirection.DOWN : ScrollDirection.UP
      );
    }
  }

  private _isTopPosition(): boolean {
    return this._activeIndex === 0 && this._activeSubsectionIndex === 0;
  }

  private _isBottomPosition(): boolean {
    return (
      this._activeIndex === this._sections.length - 1 &&
      this._activeSubsectionIndex ===
        (this._options.subsections?.[this._activeIndex] ?? 1) - 1
    );
  }

  private _scrollPage(direction: ScrollDirection): void {
    if (!this._scrollContainerEl) {
      return;
    }
    if (this._scrollSubsection(direction)) {
      return;
    }
    const nextIndex =
      direction === ScrollDirection.DOWN
        ? this._activeIndex + 1
        : this._activeIndex - 1;
    if (nextIndex >= 0 && nextIndex < this._sections.length) {
      this._scrollInProgress = true;
      let subsection = 0;
      const subsectionCount = this._options.subsections?.[nextIndex] ?? 1;
      if (subsectionCount > 1 && direction === ScrollDirection.UP) {
        subsection = subsectionCount - 1;
      }
      this._scrollToIndex(nextIndex, subsection);
    }
  }

  private _scrollSubsection(direction: ScrollDirection): boolean {
    if (!this._options.subsections) {
      return false;
    }
    const subsections = this._options.subsections[this._activeIndex];
    if (!subsections || subsections <= 1) {
      return false;
    }
    const nextSubsectionIndex =
      direction === ScrollDirection.DOWN
        ? this._activeSubsectionIndex + 1
        : this._activeSubsectionIndex - 1;
    if (nextSubsectionIndex < 0 || nextSubsectionIndex >= subsections) {
      return false;
    }
    this._activeSubsectionIndex = nextSubsectionIndex;
    this._options.onSubsectionEnter(this._activeIndex, nextSubsectionIndex);
    this._scrollInProgress = true;
    setTimeout(
      this._transitionEndEventListener,
      this._options.subsectionTransitionDuration
    );
    return true;
  }

  private _scrollToIndex(index: number, startingSubsection: number): void {
    if (!this._scrollContainerEl) {
      return;
    }
    this._scrollContainerEl.style.transform = `translateY(-${this._sections[index].offsetTop}px)`;
    if (
      this._activeIndex !== index ||
      this._activeSubsectionIndex !== startingSubsection
    ) {
      this._options.onSubsectionEnter(index, startingSubsection);
    }
    this._activeIndex = index;
    this._activeSubsectionIndex = startingSubsection;
  }

  private _handleTransitionEnd(): void {
    this._collectedScrollY = 0;
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
