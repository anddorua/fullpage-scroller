# fullpage-vertical-slider

A JavaScript library for creating full-page vertical sliders. It is inspired by [fullPage.js](https://alvarotrigo.com/fullPage/) library. For some reason I wasn't able to setup it for my usecase so I decided to implement my own solution. I use it in [webflow](https://webflow.com/) for creating vertical full-page slide effect. It also implements subsection slides which can be utilized to scroll horizontal slides inside the current section.

[Demo](https://anddorua.github.io/fullpage-scroller/as-module/index.html)

## Installation

```bash
npm install fullpage-vertical-slider
```

## Usage

### Load as module

```html
<script type="module">
  import FullpageVerticalSlider from "https://cdn.jsdelivr.net/npm/fullpage-vertical-slider@0.0.0/dist/fvs.es.js";

  const fvs = new FullpageVerticalSlider({});
</script>
```

See demo
[here](https://anddorua.github.io/fullpage-scroller/as-module/index.html)

### Load as UMD

```html
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/fullpage-vertical-slider@0.0.0/dist/fvs.umd.js"
></script>

<script>
  const fvs = new FullpageVerticalSlider({});
</script>
```

See demo
[here](https://anddorua.github.io/fullpage-scroller/as-umd/index.html)

### Library styles

Library uses its specific styles which is attached to the DOM elements after initialization. You should load it from the CDN or bundle to your own bundle.

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/fullpage-vertical-slider@0.0.0/dist/style.css"
/>
```

| Style                   | Description                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `.fvs-html-lock`        | Applied to the document root element and stops body from scrolling while user applies the scroll gesture |
| `.fvs-body`             | Provides full-height body size                                                                           |
| `.fvs-responsive`       | Applied to the body in responsive mode                                                                   |
| `.fvs-section`          | Applied to the slide                                                                                     |
| `.fvs-scroll-container` | Applied to the slides container                                                                          |

The transition duration and type specified in the `.fvs-scroll-container` style as follows:

```css
.fvs-scroll-container {
  ...
  transition: transform 0.7s;
  ...
}
```

You can redefine it to provide your own transition style.

### HTML structure

HTML document should have container element which contains sections. Each section represens one slide. The document body, the root element, the container and sections will be applied with the librarie's specific classes providing desired behavior.

## Library parameters

| Parameter                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slidesContainerSelector`      | The selector for the container element that holds all the slides.<br/>**Type**: `string`<br/>**Default**: ".scroll-container"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `slideSectionSelector`         | The selector for the slide sections.<br/>**Type**: `string`<br/>**Default**: ".section"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `responsiveMediaQuery`         | The media query that will be used to determine if the responsive mode should be enabled.<br/>**Type**: `string`<br/>**Default**: "(max-height: 0px)" which means no responsive mode                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `deltaYThreshold`              | The minimum amount of pixels the user has to scroll to trigger the next slide. Library listens for scroll events and after user have scrolled more than this threshold the slide transition triggered. During the transition user scroll events are ignored and start counting again after transition ends. Touchpad generated scroll events has some momentum which produces scroll events during some period after user lifted fingers from the touchpad. This momentum can trigger sequential slide changes. Smaller number will cause more slide changes per single gesture, bigger can make user feel the content is stuck.<br/>**Type**: `number`<br/>**Default**: 30 |
| `subsections`                  | Each section can have subsections. For instance, section can have horizontal slider or tabs component. If you want this subsections to be switched with the same scroll stream you should specify how many subsections in each section. If there specified more than 1 subsection then per each subsection the callback will be called instead of vertical scrolling the section. In the callback you can implement the logic of switching subsection content. See more detals [here](#working-with-subsections).<br/>**Required**: no<br/>**Type**: `number[]`<br/>**Default**: Array filled with `1`                                                                      |
| `subsectionTransitionDuration` | This library doesn't control duration of the subsection transitions but it needs to implement scroll event ignorance period, otherwise all subsections will transition at once. This parameter specifies such period.<br/>**Type**: `number`<br/>**Default**: 700                                                                                                                                                                                                                                                                                                                                                                                                           |
| `onSubsectionEnter`            | The callback called when each section or subsection is switched. It is called when transition starts.<br/>**Required**: no<br/>**Type**: `(sectionIndex: number, subsectionIndex: number) => void`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## Methods

| Method          | Description                                                                                                                                                                                                                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setSubsection` | Switches subsection of the particular section. You can't switch the section with this method<br/>**Parameters:**<br/>`sectionIndex: number` - specifies section number, starting from 0<br/>`subsectionIndex: number` - specifies subsection number to set, starting from 0<br/>`emitEvent: boolean = false` - specifies whether to call the `onSubsectionEnter` callback. |

The `setSubsection` method is designed to inform the library when a subsection has been manually switched by user interaction. This ensures that subsequent scroll events will correctly transition to the next subsection or section (if it's the first or last subsection within the section). For example, if you have a tabs component and the user clicks to switch tabs, this method ensures that future scroll gestures will navigate to the appropriate next or previous content. By calling `setSubsection`, you keep the library informed of these manual changes.

The `emitEvent` parameter determines whether the `onSubsectionEnter` callback should be triggered when `setSubsection` is called.

- **When `emitEvent` is `false`:**
  If your component has its own click handlers and you call `setSubsection` from within these handlers (which notify the outside world of UI changes), you likely don't want the `onSubsectionEnter` callback to be triggered. This is because your `onSubsectionEnter` callback might include logic to change the tab component based on user scroll actions, and triggering it here could create an infinite loop.

- **When `emitEvent` is `true`:**
  If you rely on the `onSubsectionEnter` callback to trigger subsequent UI changes, then you should set `emitEvent` to `true`. This is typically the case when you have attached primary click handlers to subsection controls and call `setSubsection` from those handlers. The provided examples fall into this scenario.

## Working with Subsections

Subsections are virtual parts of a single slide (section). In the simplest case, a slide contains only one subsection, meaning the slide does not have any content that switches with the same scroll events as the main slides.

For example, if a slide contains a horizontal slider that you want to switch slides using vertical scroll gestures, and you want the main slide to transition to the next slide only after the last horizontal slide is shown, these horizontal slides are considered _subsections_. Although their appearance is not controlled by the library, the library provides a callback for when a subsection should start its transition.

If your slides contain such subsections, you need to provide the `subsections` parameter. For example, if you have 4 slides, and the 3rd slide has 3 subsections, you would provide the following data:

```javascript
{
  ...
  subsections: [1,1,3],
  ...
}
```

You may omit trailing subsection counts if they are `1`.

Whenever a section or subsection is switched, the `onSubsectionEnter` callback is called. You can use this callback to initiate UI changes for subsections.

In the `onSubsectionEnter` callback, both `sectionIndex` and `subsectionIndex` are zero-based. This means that when the first slide is shown, `sectionIndex` will be `0` and `subsectionIndex` will also be `0`.

Even if you don't have subsections the `onSubsectionEnter` callback will be called. The `sectionIndex` will be the number of enetring section (zero based) and `subsectionIndex` will be `0`.

## Responsive mode

In some cases, you may need to switch your slides to behave like normally scrollable content. This is often necessary when a user changes the viewport from portrait to landscape mode on a mobile device, and there isn't enough vertical space to fit all the content. You can control this transformation using the `responsiveMediaQuery` parameter. 

By default, `responsiveMediaQuery` is set to `(max-height: 0px)`, which means responsive mode is disabled. For example, you can set it to `(max-height: 600px)`, enabling responsive mode when the viewport height is 600px or less.

Responsive mode is activated by adding the `.fvs-responsive` class to the document **body**. In responsive mode, the `onSubsectionEnter` callback is not triggered. The library does not track scroll position in responsive mode, so when the mode is switched, the content starts from the beginning. This might be an area where the library can be improved in the future.

## Teardown logic

At the moment there is no teardown logic. if you need it - let me know by making [issue](https://github.com/anddorua/fullpage-scroller/issues).