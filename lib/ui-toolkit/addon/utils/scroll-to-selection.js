/*
Copyright (C) 2017 Draios inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2 as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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
