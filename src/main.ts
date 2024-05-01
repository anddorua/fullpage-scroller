export interface StreamPageScrollerOptions {
  deltaYThreshold: number;
  scrollContainerSelector: string;
  scrollSectionSelector: string;
}

enum ScrollDirection {
  UP = "up",
  DOWN = "down",
}

export default class StreamPageScroller {
  private _options: StreamPageScrollerOptions;
  private _collectedScrollY: number = 0;
  private _scrollInProgress = false;
  private _scrollContainerEl: HTMLElement | null = null;
  private _sections!: HTMLElement[];
  private _activeIndex = 0;
  private touchStartY: number = 0;

  constructor(options: Partial<StreamPageScrollerOptions>) {
    this._options = {
      deltaYThreshold: 30,
      scrollContainerSelector: ".sps-scroll-container",
      scrollSectionSelector: ".sps-section",
      ...options,
    };
    this._findElements();
    this._setupListeners();
    this._addResizeObserver();
  }

  private _setupListeners(): void {
    document.documentElement.addEventListener(
      "wheel",
      this._handleWheelEvent.bind(this)
    );
    this._scrollContainerEl?.addEventListener(
      "transitionend",
      this._handleTransitionEnd.bind(this)
    );
    document.addEventListener(
      "touchstart",
      this._handleTouchStart.bind(this),
      false
    );
    document.addEventListener(
      "touchend",
      this._handleTouchEnd.bind(this),
      false
    );
  }

  private _addResizeObserver(): void {
    const resizeObserver = new ResizeObserver(() => {
      this._scrollToIndex(this._activeIndex);
    });
    resizeObserver.observe(document.body);
  }

  private _findElements(): void {
    this._scrollContainerEl = document.querySelector(
      this._options.scrollContainerSelector
    );
    if (!this._scrollContainerEl) {
      console.warn(
        `StreamPageScroller: Scroll container element not found by selector: ${this._options.scrollContainerSelector}`
      );
    }
    this._sections = Array.from(
      document.querySelectorAll(this._options.scrollSectionSelector)
    );
    this._sections.forEach((section, i) => {
      section.dataset.spsIndex = i.toString();
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
    this.touchStartY = firstTouch.clientY; // Get the initial touch position
  }

  private _handleTouchEnd(evt: TouchEvent): void {
    const endY = evt.changedTouches[0].clientY;
    const yDiff = this.touchStartY - endY;

    if (Math.abs(yDiff) > this._options.deltaYThreshold) {
      // Minimum threshold for swipe
      this._scrollPage(yDiff > 0 ? ScrollDirection.DOWN : ScrollDirection.UP);
    }
  }
}
