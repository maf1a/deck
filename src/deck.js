import React, { Component } from "react";
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager
} from "react-native";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

class Deck extends Component {
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {},
    // renderNoMoreCards: () => {}
  }

  renderCards() {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, i) => {
      if (i < this.state.index) return null;
      if (i == this.state.index) {
        return (
          <Animated.View
            key={item.id}
            style={[this.getCardStyle(), styles.cardStyle, {zIndex:i*-1}]}
            {...this.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }
      return(
        <Animated.View key={item.id} style={[
            styles.cardStyle,
            {
              zIndex: i * -1,
              top:10*(i-this.state.index)
            }
        ]}>
          {this.props.renderCard(item)}
        </Animated.View>
      );
    });
  }

  getCardStyle() {
    const rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    });

    return {
      ...this.position.getLayout(),
      transform: [{ rotate }]
    }
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];

    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.position.setValue({ x: 0, y: 0 });
    this.setState({ index: this.state.index + 1 });
  }

  forseSwipe(direction) {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.position, {
      toValue: { x, y: 0 },
      duration: 250
    }).start(() => this.onSwipeComplete(direction));
  }

  resetPosition() {
    Animated.spring(this.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

  constructor(props) {
    super(props);

    this.state = { index: 0 };

    this.position = new Animated.ValueXY();
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        this.position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forseSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forseSwipe('left');
        } else {
          this.resetPosition()
        }
      }
    });
  }

  componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) this.setState({ index: 0 })
  }

  render() {
    return <View>{this.renderCards()}</View>;
  }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH,
  }
}

export default Deck;
