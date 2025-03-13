import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the template SVG URL based on the layout
 */
export function getTemplateSvgUrl(layout: "horizontal" | "vertical" = "horizontal"): string {
  // Use the SVG files from the app directory
  return layout === "horizontal" ? "/horizontal-card.svg" : "/vertical-card.svg"
}

/**
 * Returns the default template SVG as a string
 * @deprecated Use getTemplateSvgUrl instead
 */
export function getDefaultTemplateSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="336" viewBox="0 0 252 180" height="240" version="1.0"><defs><clipPath id="a"><path d="M18 19.898h216v140.25H18Zm0 0"/></clipPath></defs><path fill="#fff" d="M-25.2-18h302.4v216H-25.2z"/><path fill="#fff" d="M-25.2-18h302.4v216H-25.2z"/><g clip-path="url(#a)"><path d="M222.77 19.996H29.23a11.2 11.2 0 0 0-4.296.856q-1.024.421-1.942 1.039-.919.615-1.703 1.394a11 11 0 0 0-1.394 1.703 11.2 11.2 0 0 0-1.68 4.051A11 11 0 0 0 18 31.23v117.586a11.2 11.2 0 0 0 .855 4.297 11 11 0 0 0 1.04 1.946 11.23 11.23 0 0 0 5.04 4.137q1.018.421 2.104.64c.723.14 1.453.215 2.191.215h193.54q1.107-.002 2.19-.215a11.3 11.3 0 0 0 4.048-1.68 11.23 11.23 0 0 0 4.137-5.043 11.2 11.2 0 0 0 .855-4.297V31.23a11.2 11.2 0 0 0-.855-4.3 11 11 0 0 0-1.04-1.942 11 11 0 0 0-1.394-1.703q-.785-.78-1.703-1.394a11.3 11.3 0 0 0-4.047-1.68 11 11 0 0 0-2.191-.215m7.488 128.82c0 .493-.051.977-.145 1.461q-.145.72-.425 1.407a7.48 7.48 0 0 1-4.055 4.05 7.4 7.4 0 0 1-1.403.426 7.4 7.4 0 0 1-1.46.145H29.23c-.492 0-.976-.047-1.46-.145a7.4 7.4 0 0 1-1.403-.426 7.4 7.4 0 0 1-1.297-.691 7.45 7.45 0 0 1-2.758-3.36 8 8 0 0 1-.425-1.406 7.7 7.7 0 0 1-.145-1.46V31.23q.002-.739.145-1.46.145-.72.425-1.407a7.45 7.45 0 0 1 2.758-3.36q.613-.41 1.297-.69a7 7 0 0 1 1.403-.426 7.4 7.4 0 0 1 1.46-.145h193.54q.736-.001 1.46.145.722.139 1.403.425.684.281 1.297.692a7.45 7.45 0 0 1 2.758 3.36 7.6 7.6 0 0 1 .57 2.866Zm0 0"/></g><path d="M41.77 72.965h21.62c.493 0 .977-.047 1.462-.145a7.4 7.4 0 0 0 1.402-.425 7.4 7.4 0 0 0 1.297-.692 7.6 7.6 0 0 0 1.133-.93 7.2 7.2 0 0 0 .93-1.136q.408-.614.695-1.293.28-.686.425-1.406.141-.723.141-1.461V43.793a7.7 7.7 0 0 0-.14-1.461 7.6 7.6 0 0 0-.426-1.402 7.7 7.7 0 0 0-.696-1.297 7.6 7.6 0 0 0-2.062-2.066 7.4 7.4 0 0 0-1.297-.692 7.4 7.4 0 0 0-1.402-.426 7.4 7.4 0 0 0-1.461-.144H41.77q-.735 0-1.458.144a7.3 7.3 0 0 0-1.406.426 7.45 7.45 0 0 0-3.36 2.758q-.41.613-.69 1.297a7 7 0 0 0-.426 1.402 7.4 7.4 0 0 0-.145 1.461v21.684q-.001.739.145 1.46.139.722.425 1.407.281.679.692 1.293a7.43 7.43 0 0 0 3.36 2.758c.452.187.921.332 1.406.425q.722.146 1.457.145m21.656-3.742H54.44V56.508h12.692v8.969q0 .743-.285 1.433-.284.686-.813 1.215a3.7 3.7 0 0 1-1.21.813 3.8 3.8 0 0 1-1.434.285Zm3.746-25.43v8.969h-12.73V40.05h8.949q.743 0 1.433.285c.457.187.864.46 1.211.809q.53.527.813 1.214.286.69.285 1.434Zm-29.145 0q0-.743.285-1.434.286-.687.813-1.214a3.7 3.7 0 0 1 1.215-.81 3.7 3.7 0 0 1 1.43-.284h8.968v29.172H41.77a3.74 3.74 0 0 1-2.645-1.098 3.75 3.75 0 0 1-1.098-2.648Zm.598 47.973v10.539a1.9 1.9 0 0 0 .55 1.324q.266.264.606.406.345.143.719.145a1.88 1.88 0 0 0 1.727-1.157q.145-.344.144-.718v-10.54q0-.374-.144-.718a1.9 1.9 0 0 0-.407-.606 1.88 1.88 0 0 0-1.32-.55 1.9 1.9 0 0 0-1.324.55 1.9 1.9 0 0 0-.55 1.324m15.144.001v10.539q0 .374.14.718c.098.227.23.43.406.606q.264.264.61.406a1.84 1.84 0 0 0 1.429 0q.346-.141.61-.406a1.9 1.9 0 0 0 .406-.606q.14-.344.14-.718v-10.54q0-.374-.14-.718a1.9 1.9 0 0 0-.406-.606 1.8 1.8 0 0 0-.61-.406 1.855 1.855 0 0 0-2.039.406 1.9 1.9 0 0 0-.406.606q-.14.344-.14.719m15.14 0v10.539a1.9 1.9 0 0 0 .55 1.324 1.9 1.9 0 0 0 1.324.55 1.88 1.88 0 0 0 1.728-1.156q.145-.344.144-.718v-10.54q0-.374-.144-.718a1.9 1.9 0 0 0-.407-.606 1.88 1.88 0 0 0-1.32-.55 1.9 1.9 0 0 0-1.324.55 1.9 1.9 0 0 0-.55 1.324m114.179 10.54v-10.54a1.9 1.9 0 0 0-.55-1.324 1.9 1.9 0 0 0-1.324-.55 1.88 1.88 0 0 0-1.728 1.156q-.145.344-.144.719v10.539q0 .374.144.718.141.341.407.606.261.264.605.406.345.143.715.145a1.9 1.9 0 0 0 1.324-.551q.265-.265.406-.606.143-.344.145-.718m15.14 0v-10.54q0-.374-.14-.718a1.9 1.9 0 0 0-.406-.606 1.8 1.8 0 0 0-.61-.406 1.86 1.86 0 0 0-1.43 0q-.345.142-.609.406a1.9 1.9 0 0 0-.406.606q-.14.344-.14.719v10.539q0 .374.14.718c.098.227.23.43.406.606q.264.264.61.406a1.855 1.855 0 0 0 2.039-.406 1.9 1.9 0 0 0 .406-.606q.14-.344.14-.718m15.145 0v-10.54a1.9 1.9 0 0 0-.55-1.324 1.9 1.9 0 0 0-1.324-.55 1.88 1.88 0 0 0-1.728 1.156q-.145.344-.144.719v10.539q0 .374.144.718.141.341.407.606.259.264.605.406.345.143.715.145a1.9 1.9 0 0 0 1.324-.551q.265-.265.406-.606.143-.344.145-.718m-110.098 1.875c.246 0 .489-.051.715-.145q.345-.141.61-.406a1.9 1.9 0 0 0 .406-.606q.14-.344.14-.718v-10.54q0-.374-.14-.718a1.9 1.9 0 0 0-.406-.606 1.8 1.8 0 0 0-.61-.406 1.86 1.86 0 0 0-1.43 0q-.345.142-.609.406a1.9 1.9 0 0 0-.406.606q-.14.344-.14.719v10.539q0 .374.14.718c.098.227.23.43.406.606q.264.264.61.406.339.143.714.145m15.235 0a1.9 1.9 0 0 0 1.324-.551 1.86 1.86 0 0 0 .547-1.324v-10.54q0-.374-.14-.718a1.9 1.9 0 0 0-.407-.606 1.9 1.9 0 0 0-1.324-.55 1.88 1.88 0 0 0-1.727 1.156q-.145.344-.144.719v10.539q-.001.374.144.718.142.341.406.606.259.264.606.406.345.143.715.145m15.07 0a1.88 1.88 0 0 0 1.727-1.157q.145-.344.144-.718v-10.54q0-.374-.144-.718a1.9 1.9 0 0 0-.407-.606 1.88 1.88 0 0 0-1.32-.55 1.9 1.9 0 0 0-1.324.55 1.9 1.9 0 0 0-.55 1.324l-.001 10.54a1.9 1.9 0 0 0 .55 1.324q.266.264.606.406.345.143.719.145m15.141 0c.25 0 .488-.051.714-.145q.346-.141.61-.406a1.9 1.9 0 0 0 .406-.606q.14-.344.14-.718v-10.54q0-.374-.14-.718a1.9 1.9 0 0 0-.406-.606 1.8 1.8 0 0 0-.61-.406 1.855 1.855 0 0 0-2.039.406 1.9 1.9 0 0 0-.406.606q-.14.344-.14.719v10.539q0 .374.14.718c.098.227.23.43.406.606q.264.264.61.406c.226.094.469.145.715.145m1.16 21.418H36.156q-.375 0-.715.144-.345.141-.609.406a1.9 1.9 0 0 0-.406.606 1.9 1.9 0 0 0 0 1.434 1.88 1.88 0 0 0 1.015 1.011q.34.146.715.145h113.727q.374.001.719-.145.34-.141.605-.406a1.8 1.8 0 0 0 .406-.606 1.89 1.89 0 0 0-.406-2.039 1.9 1.9 0 0 0-.605-.406 1.8 1.8 0 0 0-.72-.144m-31.835 14.398h-81.89q-.375-.001-.716.145-.345.14-.609.406a1.9 1.9 0 0 0-.406.605 1.89 1.89 0 0 0 .406 2.04q.264.264.61.406.339.145.714.144h81.89q.37 0 .716-.144.344-.141.605-.407.265-.258.406-.605.146-.346.145-.715.001-.374-.145-.719-.14-.344-.406-.605a1.8 1.8 0 0 0-.605-.406 1.8 1.8 0 0 0-.715-.145m97.797-14.398H175.19q-.374 0-.718.144-.344.141-.606.406a1.88 1.88 0 0 0-.55 1.32v14.364q.001.375.144.715.142.345.406.61c.176.175.375.308.606.405q.344.141.718.141h40.653a1.85 1.85 0 0 0 1.324-.547q.262-.264.406-.61.14-.339.14-.714v-14.363a1.9 1.9 0 0 0-.14-.715 1.88 1.88 0 0 0-1.015-1.012 1.8 1.8 0 0 0-.715-.144m-1.871 14.363h-36.91v-10.617h36.91Zm1.872-103.656H175.19q-.374 0-.718.14a1.88 1.88 0 0 0-1.012 1.016q-.143.346-.145.715a1.9 1.9 0 0 0 .551 1.324 1.9 1.9 0 0 0 1.324.55h40.653q.375-.002.715-.144.345-.14.609-.406a1.9 1.9 0 0 0 .406-.605 1.89 1.89 0 0 0-.406-2.043 1.85 1.85 0 0 0-1.324-.547M104.988 62.312q-1.252-.002-2.564-.203a16.5 16.5 0 0 1-2.5-.547 10.4 10.4 0 0 1-2.11-.89q-.656-.374-.937-.954a2.05 2.05 0 0 1-.187-1.171q.077-.61.453-1.079.374-.466.953-.593.591-.14 1.312.218c.82.461 1.72.797 2.688 1.016q1.452.328 2.89.328 2.186 0 3.11-.672.937-.668.937-1.687 0-.873-.656-1.375-.657-.514-2.312-.875l-3.391-.719q-2.876-.61-4.281-2.062c-.93-.97-1.39-2.243-1.39-3.829q-.002-1.5.624-2.718a6.4 6.4 0 0 1 1.783-2.126q1.135-.903 2.72-1.39 1.575-.482 3.468-.484 1.67 0 3.281.406 1.623.409 2.86 1.187c.406.243.68.547.828.922q.216.549.14 1.11a1.72 1.72 0 0 1-.437.968 1.73 1.73 0 0 1-.953.547q-.564.11-1.375-.281a8.5 8.5 0 0 0-2.094-.734q-1.111-.248-2.281-.25-1.266 0-2.157.328c-.586.218-1.03.531-1.343.937a2.16 2.16 0 0 0-.47 1.375q0 .878.626 1.422.639.532 2.203.86l3.39.718q2.936.626 4.376 2.031 1.436 1.394 1.437 3.672 0 1.5-.61 2.72a5.9 5.9 0 0 1-1.734 2.077q-1.14.878-2.734 1.344-1.582.451-3.562.453m14.097-.328q-1.173.001-1.813-.625-.626-.64-.625-1.812V43.264q-.001-1.17.625-1.797.64-.639 1.813-.64h5.843q5.438.001 8.39 2.75c1.97 1.836 2.954 4.437 2.954 7.812 0 1.7-.258 3.203-.766 4.516q-.767 1.969-2.203 3.328-1.438 1.345-3.547 2.047-2.097.704-4.828.704Zm2.217-3.812h3.36c1.132 0 2.125-.141 2.968-.422.844-.282 1.54-.696 2.094-1.25q.845-.844 1.266-2.11.422-1.276.422-3-.002-3.42-1.703-5.078-1.69-1.67-5.047-1.672h-3.36Zm25.947 4.078q-1.142-.002-1.75-.625c-.399-.414-.594-1.004-.594-1.766V44.672h-5.313c-.617 0-1.093-.165-1.437-.5q-.516-.515-.516-1.422 0-.92.516-1.422c.344-.332.82-.5 1.437-.5h15.266q.936.001 1.438.5.515.502.515 1.422 0 .907-.515 1.422-.502.501-1.438.5h-5.312v15.187c0 .762-.196 1.352-.579 1.766q-.58.623-1.718.625m0 0"/></svg>`
}

/**
 * Returns the default template SVG as a data URL
 * @deprecated Use getTemplateSvgUrl instead
 */
export function getDefaultTemplateSvgUrl(): string {
  return `data:image/svg+xml;base64,${btoa(getDefaultTemplateSvg())}`
}
