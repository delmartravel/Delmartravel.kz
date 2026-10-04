export type AnimationCleanup = () => void;

export interface AnimationContext {
  reducedMotion: boolean;
}

export interface AnimationAdapter<TTarget = Element> {
  enter(target: TTarget, context: AnimationContext): AnimationCleanup | void;
  leave?(target: TTarget, context: AnimationContext): AnimationCleanup | void;
}

export type ScrollAnimationAdapter<TTarget = Element> = AnimationAdapter<TTarget> & {
  connectScroll(
    target: TTarget,
    context: AnimationContext,
  ): AnimationCleanup | void;
};
