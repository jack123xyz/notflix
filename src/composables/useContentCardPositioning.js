import { computed } from "vue";

export function contentCardPositioning(props) {
  const cardStyle = computed(() => {
    if (!props.position) return {};

    const {
      top: itemTop,
      left: itemLeft,
      width: itemWidth,
      height: itemHeight,
      scrollY = 0,
      scrollX = 0,
      isRightEdge,
    } = props.position;

    const scaleFactor = props.overrideScaleFactor ?? 1.45;
    const expandedWidth = itemWidth * scaleFactor;
    const heightIncrease = itemHeight * (scaleFactor - 1);

    let calculatedTopPosition =
      props.overrideVerticalOffset !== null
        ? itemTop + scrollY + props.overrideVerticalOffset
        : itemTop + scrollY - heightIncrease / 2 - itemHeight / 2;

    const viewportWidth = window.innerWidth;
    const bufferSpace = 40;
    const isLeftEdgeTile = itemLeft < 100;

    const centeredCardLeft =
      itemLeft + scrollX - (expandedWidth - itemWidth) / 2;
    const centeredCardWouldOverflow =
      centeredCardLeft + expandedWidth > viewportWidth - bufferSpace;
    const forceRightAlignment =
      isRightEdge || (!isLeftEdgeTile && centeredCardWouldOverflow);

    let calculatedLeftPosition;
    let transformOriginPoint;

    if (isLeftEdgeTile) {
      calculatedLeftPosition = itemLeft + scrollX;
      transformOriginPoint = "left bottom";
    } else if (forceRightAlignment) {
      calculatedLeftPosition = itemLeft + itemWidth + scrollX - expandedWidth;
      transformOriginPoint = "right bottom";
    } else {
      calculatedLeftPosition =
        itemLeft + scrollX - (expandedWidth - itemWidth) / 2;
      transformOriginPoint = "center bottom";
    }

    if (
      calculatedLeftPosition + expandedWidth >
      viewportWidth + scrollX - bufferSpace
    ) {
      calculatedLeftPosition =
        viewportWidth + scrollX - expandedWidth - bufferSpace;
      if (!isLeftEdgeTile) transformOriginPoint = "right bottom";
    }
    if (calculatedLeftPosition < scrollX + bufferSpace) {
      calculatedLeftPosition = scrollX + bufferSpace;
      if (!forceRightAlignment) transformOriginPoint = "left bottom";
    }

    return {
      position: "absolute",
      top: `${calculatedTopPosition}px`,
      left: `${calculatedLeftPosition}px`,
      width: `${expandedWidth}px`,
      zIndex: 1000,
      transform: "scale(1)",
      transformOrigin: transformOriginPoint,
      transition: "all 0.3s cubic-bezier(0.2, 0.89, 0.32, 1.28)",
      opacity: 1,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
    };
  });

  return { cardStyle };
}
