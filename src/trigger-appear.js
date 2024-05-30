export function triggerAppear(observeSelector, threshold, selectorToClick) {
  const elementToObserve = document.querySelector(observeSelector);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (typeof selectorToClick === "function") {
            selectorToClick(entry);
          } else {
            const clickElement = document.querySelector(selectorToClick);
            clickElement?.click();
          }
        }
      });
    },
    {
      threshold,
    }
  );
  observer.observe(elementToObserve);
  return () => {
    observer.unobserve(elementToObserve);
  };
}

function triggerAppearOnce(observeSelector, threshold, selectorToClick) {
  const tearDown = triggerAppear(observeSelector, threshold, (entry) => {
    if (typeof selectorToClick === "function") {
      selectorToClick(entry);
    } else {
      const clickElement = document.querySelector(selectorToClick);
      clickElement?.click();
    }
    tearDown();
  });
}
