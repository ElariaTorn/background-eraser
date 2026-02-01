## Packages
@imgly/background-removal | Client-side background removal
react-compare-slider | For comparing original and processed images side-by-side
framer-motion | For beautiful animations and transitions
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging tailwind classes

## Notes
The application uses `@imgly/background-removal` which relies on fetching WASM and model files.
We will configure it to use the default CDN to avoid copying large assets to `public/` manually.
The flow involves uploading the original image first, processing it in the browser, then uploading the result.
