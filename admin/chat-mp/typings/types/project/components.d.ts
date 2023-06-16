interface FloatMenu extends WechatMiniprogram.Component.TrivialInstance {
  open: (x: number, y: number) => void
  close: () => void
}