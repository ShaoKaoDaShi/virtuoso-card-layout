export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ClientRectObject {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
  x: number;
  y: number;
}

export interface VirtualElement {
  getBoundingClientRect(): ClientRectObject;
  contextElement?: Element | null;
}

export interface Coords {
  x: number;
  y: number;
}

export interface GetBoundingClientRectOptions {
  includeScale?: boolean;
  offsetParent?: Element | Window | null;
}

function isElement(value: any): value is Element {
  return value != null && typeof value === "object" && "nodeType" in value && value.nodeType === 1;
}

function isHTMLElement(value: any): value is HTMLElement {
  return isElement(value) && value instanceof HTMLElement;
}

function unwrapElement(element: Element | VirtualElement): Element | null {
  if (isElement(element)) {
    return element;
  }
  return element.contextElement || null;
}

function createCoords(v: number): Coords {
  return { x: v, y: v };
}

function rectToClientRect(rect: Rect): ClientRectObject {
  return {
    width: rect.width,
    height: rect.height,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height,
    left: rect.x,
    x: rect.x,
    y: rect.y,
  };
}

function getWindow(node: any): Window {
  const ownerDocument = node?.ownerDocument || node;
  return ownerDocument?.defaultView || window;
}

function getFrameElement(win: Window): HTMLIFrameElement | null {
  try {
    return win.frameElement as HTMLIFrameElement;
  } catch {
    return null;
  }
}

function getCssDimensions(element: HTMLElement) {
  const computedStyle = getComputedStyle(element);
  const width = parseFloat(computedStyle.width);
  const height = parseFloat(computedStyle.height);

  const $ =
    window.devicePixelRatio > 1 && !Number.isInteger(width) && Number.isInteger(element.getBoundingClientRect().width);

  return { width, height, $ };
}

function getScale(element: Element | VirtualElement): Coords {
  const domElement = unwrapElement(element);

  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }

  const rect = domElement.getBoundingClientRect();
  const { width, height, $ } = getCssDimensions(domElement);
  const round = Math.round;
  let x = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;

  if (!x || !Number.isFinite(x)) {
    x = 1;
  }

  if (!y || !Number.isFinite(y)) {
    y = 1;
  }

  return { x, y };
}

function isWebKit(): boolean {
  return /AppleWebKit/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
}

function getVisualOffsets(domElement: Element): Coords {
  if (!isWebKit()) {
    return createCoords(0);
  }

  const win = getWindow(domElement);

  if (win.visualViewport) {
    const scrollX = win.scrollX || win.pageXOffset;
    const scrollY = win.scrollY || win.pageYOffset;

    const x = scrollX - win.visualViewport.offsetLeft;
    const y = scrollY - win.visualViewport.offsetTop;

    return { x, y };
  }

  return createCoords(0);
}

export function getBoundingClientRect(
  element: Element | VirtualElement,
  options: GetBoundingClientRectOptions = {}
): ClientRectObject {
  const { includeScale = true, offsetParent } = options;

  let clientRect: ClientRectObject;

  if (isElement(element)) {
    clientRect = element.getBoundingClientRect() as ClientRectObject;
  } else {
    clientRect = element.getBoundingClientRect();
  }

  let scale: Coords = createCoords(1);
  const domElement = unwrapElement(element);

  if (includeScale && domElement) {
    scale = getScale(domElement);
  }

  const visualOffsets: Coords = domElement ? getVisualOffsets(domElement) : createCoords(0);

  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;

  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;

    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);

    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle(currentIFrame);

      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;

      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;

      x += left;
      y += top;

      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }

  return rectToClientRect({ width, height, x, y });
}

export function computePosition(targetEl: Element, cardEl: Element) {
  const targetRect = getBoundingClientRect(targetEl);
  const cardRect = getBoundingClientRect(cardEl);

  if (cardEl instanceof HTMLElement) {
    const cardElStyle = getComputedStyle(cardEl);
    const { transform, position, top } = cardElStyle;
    if (transform !== "none" || Boolean(top)) {
      Object.assign(cardEl.style, {
        transform: "none",
        top: "",
      });
    }
  }

  const offsetX = targetRect.x - cardRect.x;
  const offsetY = targetRect.y - cardRect.y;

  return { offsetX, offsetY, targetRect, cardRect };
}
