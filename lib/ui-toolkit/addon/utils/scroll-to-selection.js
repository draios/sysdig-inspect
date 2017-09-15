export default function scrollToSelection({
    container,
    index,
    itemHeight,
    paddingTop = 0,
}) {
    const offset = index * itemHeight;
    const topPosition = container.scrollTop;
    const bodyHeight = container.clientHeight;
    const bottomPosition = topPosition + bodyHeight;

    if (offset < topPosition - itemHeight * 0.5) {
        container.scrollTop = paddingTop + offset - itemHeight * 2.5;
    } else if (bottomPosition < offset + itemHeight * 1.5) {
        container.scrollTop = paddingTop + offset + itemHeight * 2.5 - bodyHeight;
    }
}
