function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Easing, findNodeHandle, NativeModules, PixelRatio, ScrollView, StyleSheet, Text, View } from 'react-native';
const {
  UIManager
} = NativeModules;
function wait(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}
const createAnimation = (animatedValue, config, consecutive) => {
  const baseAnimation = Animated.timing(animatedValue, {
    easing: Easing.linear,
    useNativeDriver: true,
    ...config
  });
  if (config.loop) {
    if (consecutive) {
      return Animated.sequence([baseAnimation, Animated.loop(Animated.sequence([Animated.timing(animatedValue, {
        toValue: consecutive.resetToValue,
        duration: 0,
        useNativeDriver: true
      }), Animated.timing(animatedValue, {
        easing: Easing.linear,
        useNativeDriver: true,
        ...config,
        duration: consecutive.duration
      })]))]);
    }
    return Animated.loop(Animated.sequence([baseAnimation, Animated.delay(1000)]));
  }
  return baseAnimation;
};
const MarqueeText = (props, ref) => {
  const {
    style,
    marqueeOnStart = true,
    speed = 1,
    loop = true,
    delay = 0,
    consecutive = false,
    onMarqueeComplete,
    children,
    ...restProps
  } = props;
  const [isAnimating, setIsAnimating] = useState(false);
  const containerWidth = useRef(null);
  const marqueeTextWidth = useRef(null);
  const animatedValue = useRef(new Animated.Value(0));
  const textRef = useRef(null);
  const containerRef = useRef(null);
  const animation = useRef();
  const config = useRef({
    marqueeOnStart,
    speed,
    loop,
    delay,
    consecutive
  });
  const stopAnimation = useCallback(() => {
    var _animation$current;
    (_animation$current = animation.current) === null || _animation$current === void 0 || _animation$current.reset();
    setIsAnimating(false);
    invalidateMetrics();
  }, []);
  const startAnimation = useCallback(async () => {
    setIsAnimating(true);
    await wait(100);
    await calculateMetrics();
    if (!containerWidth.current || !marqueeTextWidth.current) {
      return;
    }
    const distance = marqueeTextWidth.current - containerWidth.current;
    if (distance < 0) {
      return;
    }
    const baseDuration = PixelRatio.getPixelSizeForLayoutSize(marqueeTextWidth.current) / config.current.speed;
    const {
      consecutive: isConsecutive
    } = config.current;
    animation.current = createAnimation(animatedValue.current, {
      ...config.current,
      toValue: isConsecutive ? -marqueeTextWidth.current : -distance,
      duration: isConsecutive ? baseDuration * (marqueeTextWidth.current / distance) : baseDuration
    }, isConsecutive ? {
      resetToValue: containerWidth.current,
      duration: baseDuration * ((containerWidth.current + marqueeTextWidth.current) / distance)
    } : undefined);
    animation.current.start(() => {
      setIsAnimating(false);
      onMarqueeComplete === null || onMarqueeComplete === void 0 || onMarqueeComplete();
    });
  }, [onMarqueeComplete]);
  useImperativeHandle(ref, () => {
    return {
      start: () => {
        startAnimation();
      },
      stop: () => {
        stopAnimation();
      }
    };
  });
  useEffect(() => {
    if (!config.current.marqueeOnStart) {
      return;
    }
    stopAnimation();
    startAnimation();
  }, [children, startAnimation, stopAnimation]);
  const calculateMetrics = async () => {
    try {
      if (!containerRef.current || !textRef.current) {
        return;
      }
      const measureWidth = component => new Promise(resolve => {
        UIManager.measure(findNodeHandle(component), (_x, _y, w) => {
          return resolve(w);
        });
      });
      const [wrapperWidth, textWidth] = await Promise.all([measureWidth(containerRef.current), measureWidth(textRef.current)]);
      containerWidth.current = wrapperWidth;
      marqueeTextWidth.current = textWidth;
    } catch (error) {
      // console.warn(error);
    }
  };

  // Null distance is the special value to allow recalculation
  const invalidateMetrics = () => {
    containerWidth.current = null;
    marqueeTextWidth.current = null;
  };
  const {
    width,
    height
  } = StyleSheet.flatten(style || {});
  return /*#__PURE__*/React.createElement(View, {
    style: [styles.container, {
      width,
      height
    }]
  }, /*#__PURE__*/React.createElement(Text, _extends({
    numberOfLines: 1
  }, restProps, {
    style: [style, {
      opacity: isAnimating ? 0 : 1
    }]
  }), children), /*#__PURE__*/React.createElement(ScrollView, {
    ref: containerRef,
    style: StyleSheet.absoluteFillObject,
    showsHorizontalScrollIndicator: false,
    horizontal: true,
    scrollEnabled: false,
    onContentSizeChange: calculateMetrics
  }, /*#__PURE__*/React.createElement(Animated.Text, _extends({
    ref: textRef,
    numberOfLines: 1
  }, restProps, {
    style: [style, {
      transform: [{
        translateX: animatedValue.current
      }],
      opacity: isAnimating ? 1 : 0,
      width: '100%'
    }]
  }), children)));
};
const styles = StyleSheet.create({
  container: {
    overflow: 'hidden'
  }
});
export default /*#__PURE__*/React.forwardRef(MarqueeText);
//# sourceMappingURL=index.js.map