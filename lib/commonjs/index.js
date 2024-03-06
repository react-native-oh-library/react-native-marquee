"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const {
  UIManager
} = _reactNative.NativeModules;
function wait(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}
const createAnimation = (animatedValue, config, consecutive) => {
  const baseAnimation = _reactNative.Animated.timing(animatedValue, {
    easing: _reactNative.Easing.linear,
    useNativeDriver: true,
    ...config
  });
  if (config.loop) {
    if (consecutive) {
      return _reactNative.Animated.sequence([baseAnimation, _reactNative.Animated.loop(_reactNative.Animated.sequence([_reactNative.Animated.timing(animatedValue, {
        toValue: consecutive.resetToValue,
        duration: 0,
        useNativeDriver: true
      }), _reactNative.Animated.timing(animatedValue, {
        easing: _reactNative.Easing.linear,
        useNativeDriver: true,
        ...config,
        duration: consecutive.duration
      })]))]);
    }
    return _reactNative.Animated.loop(_reactNative.Animated.sequence([baseAnimation, _reactNative.Animated.delay(1000)]));
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
  const [isAnimating, setIsAnimating] = (0, _react.useState)(false);
  const containerWidth = (0, _react.useRef)(null);
  const marqueeTextWidth = (0, _react.useRef)(null);
  const animatedValue = (0, _react.useRef)(new _reactNative.Animated.Value(0));
  const textRef = (0, _react.useRef)(null);
  const containerRef = (0, _react.useRef)(null);
  const animation = (0, _react.useRef)();
  const config = (0, _react.useRef)({
    marqueeOnStart,
    speed,
    loop,
    delay,
    consecutive
  });
  const stopAnimation = (0, _react.useCallback)(() => {
    var _animation$current;
    (_animation$current = animation.current) === null || _animation$current === void 0 || _animation$current.reset();
    setIsAnimating(false);
    invalidateMetrics();
  }, []);
  const startAnimation = (0, _react.useCallback)(async () => {
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
    const baseDuration = _reactNative.PixelRatio.getPixelSizeForLayoutSize(marqueeTextWidth.current) / config.current.speed;
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
  (0, _react.useImperativeHandle)(ref, () => {
    return {
      start: () => {
        startAnimation();
      },
      stop: () => {
        stopAnimation();
      }
    };
  });
  (0, _react.useEffect)(() => {
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
        UIManager.measure((0, _reactNative.findNodeHandle)(component), (_x, _y, w) => {
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
  } = _reactNative.StyleSheet.flatten(style || {});
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.container, {
      width,
      height
    }]
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, _extends({
    numberOfLines: 1
  }, restProps, {
    style: [style, {
      opacity: isAnimating ? 0 : 1
    }]
  }), children), /*#__PURE__*/_react.default.createElement(_reactNative.ScrollView, {
    ref: containerRef,
    style: _reactNative.StyleSheet.absoluteFillObject,
    showsHorizontalScrollIndicator: false,
    horizontal: true,
    scrollEnabled: false,
    onContentSizeChange: calculateMetrics
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Animated.Text, _extends({
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
const styles = _reactNative.StyleSheet.create({
  container: {
    overflow: 'hidden'
  }
});
var _default = exports.default = /*#__PURE__*/_react.default.forwardRef(MarqueeText);
//# sourceMappingURL=index.js.map