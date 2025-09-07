/**
 * 获取 node 上的 align 对齐点 相对于页面的坐标
 */

// 根据传入的区域和对齐方式，计算对齐后的偏移量
function getAlignOffset(region, align) {
  // 获取对齐方式的第一个字符，表示垂直方向的对齐方式
  const V = align.charAt(0);
  // 获取对齐方式的第二个字符，表示水平方向的对齐方式
  const H = align.charAt(1);
  // 获取区域的宽度
  const w = region.width;
  // 获取区域的高度
  const h = region.height;

  // 初始化偏移量的x和y坐标
  let x = region.left;
  let y = region.top;

  // 如果垂直方向的对齐方式是居中，则将y坐标加上区域高度的一半
  if (V === 'c') {
    y += h / 2;
    // 如果垂直方向的对齐方式是底部，则将y坐标加上区域高度
  } else if (V === 'b') {
    y += h;
  }

  // 如果水平方向的对齐方式是居中，则将x坐标加上区域宽度的一半
  if (H === 'c') {
    x += w / 2;
    // 如果水平方向的对齐方式是右侧，则将x坐标加上区域宽度
  } else if (H === 'r') {
    x += w;
  }

  // 返回计算后的偏移量
  return {
    left: x,
    top: y,
  };
}

export default getAlignOffset;
