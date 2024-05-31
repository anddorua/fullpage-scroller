# Fullpage Vertical Slider

A JavaScript library for creating full-page vertical sliders. It is inspired by fullPage.js library. For some reason I wasn't able to setup it for my usecase so I decided to implement my own solution. I use it in webflow for creating vertical full-page slide effect. It also implements subsection slides which can be utilized to scroll horizontal slides inside the current section.

## Installation

```bash
npm install fullpage-vertical-slider
```

## Usage

__TODO__

- as module

```html
<script type="module">
  import FullpageVerticalSlider from "fullpage-vertical-slider";

  const fvs = new FullpageVerticalSlider({
    scrollContainerSelector: ".scroll-container",
    scrollSectionSelector: ".section",
    responsiveMediaQuery: "(max-height: 600px)",
    subsections: [1, 1, 4, 1],
    onSubsectionEnter: (sectionIndex, subsectionIndex) => {
      if (sectionIndex === 2) {
        const subsections = document.querySelectorAll(
          ".s3 .subsections .subsection"
        );
        subsections.forEach((subsection, index) => {
          if (index === subsectionIndex) {
            subsection.classList.add("active");
          } else {
            subsection.classList.remove("active");
          }
        });
      }
    },
  });
</script>
```
