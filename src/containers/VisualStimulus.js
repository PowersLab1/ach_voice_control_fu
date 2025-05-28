import React, { Component } from "react";
import PropTypes from "prop-types";
import RATINGS_1_SRC from "../media/rating_keydown_1.png";
import RATINGS_2_SRC from "../media/rating_keydown_2.png";
import RATINGS_3_SRC from "../media/rating_keydown_3.png";
import RATINGS_4_SRC from "../media/rating_keydown_4.png";
import RATINGS_5_SRC from "../media/rating_keydown_5.png";
import FIX_CROSS_DEFAULT from "../media/fixation_cross.png";
import FIX_CROSS_GREEN from "../media/fixation_cross_green.png";
import FIX_CROSS_RED from "../media/fixation_cross_red.png";
import "./Trial.css";

var _ = require("lodash");
var SimplexNoise = require("simplex-noise");

const CANVAS_LENGTH = 256;

// Map rating numbers to their corresponding image sources
const ratingToImgSrc = {
  0: "", // Default: no image
  1: RATINGS_1_SRC,
  2: RATINGS_2_SRC,
  3: RATINGS_3_SRC,
  4: RATINGS_4_SRC,
  5: RATINGS_5_SRC,
};

// Map fixation cross color names to their image sources
const fixationCrossSrc = {
  default: FIX_CROSS_DEFAULT,
  green: FIX_CROSS_GREEN,
  red: FIX_CROSS_RED,
};

/**
 * VisualStimulus
 *
 * Renders a visual stimulus for an experimental trial, including:
 * - A dynamic checkerboard background (colors configurable)
 * - An optional rating image overlay
 * - An optional fixation cross (color and visibility configurable)
 *
 * Props:
 * - showContrast: bool, whether to show the checkerboard
 * - checkerboardColors: [string, string], colors for the checkerboard tiles
 * - showRatings: bool, whether to display the rating image
 * - currentRating: number, which rating image to show (1-5)
 * - crossColor: string, color of the fixation cross ('default', 'green', 'red')
 * - showFixation: bool, whether to show the fixation cross
 */
class VisualStimulus extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * Draws the checkerboard or black background on the canvas.
   * Uses the two colors provided in checkerboardColors prop.
   */
  drawCanvas() {
    this.resizeCanvas();

    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    // Each checkerboard tile is roughly 1/18th of the canvas height
    const l = Math.max(1, canvas.height / 18);

    // Use checkerboardColors prop or default to brown and black
    const [color1, color2] = this.props.checkerboardColors || [
      "#8B4513",
      "#000000",
    ];

    if (this.props.showContrast) {
      // Draw the checkerboard pattern using fillRect for efficiency
      for (let y = 0; y < h; y += l) {
        for (let x = 0; x < w; x += l) {
          // Alternate colors based on tile position
          const isFirstColor =
            (Math.floor(x / l) + Math.floor(y / l)) % 2 === 0;
          ctx.fillStyle = isFirstColor ? color1 : color2;
          ctx.fillRect(x, y, l, l);
        }
      }
    } else {
      // If not showing contrast, fill the whole canvas with black
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);
    }
  }

  /**
   * Resizes the canvas to fill the window.
   */
  resizeCanvas() {
    const canvas = document.getElementById("c");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /**
   * Draw the checkerboard when the component mounts.
   */
  componentDidMount() {
    this.drawCanvas();
  }

  /**
   * Redraw the checkerboard if props change.
   */
  componentDidUpdate(prevProps) {
    this.drawCanvas();
  }

  /**
   * Renders the component UI:
   * - Rating image (if showRatings)
   * - Overlay to darken background (if showRatings)
   * - Checkerboard canvas
   * - Fixation cross image (if showFixation)
   */
  render() {
    return (
      <div>
        {/* Rating image overlay, shown if showRatings is true */}
        <img
          src={ratingToImgSrc[this.props.currentRating]}
          width={CANVAS_LENGTH}
          height={CANVAS_LENGTH}
          className="center"
          style={{
            zIndex: 101,
            width: "95vh",
            height: "50vh",
            backgroundColor: "black",
            visibility: this.props.showRatings ? "visible" : "hidden",
          }}
        />
        {/* Black overlay to darken background when ratings are shown */}
        <div
          style={{
            zIndex: 100,
            backgroundColor: "black",
            width: "100vw",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            visibility: this.props.showRatings ? "visible" : "hidden",
          }}
        ></div>
        {/* Canvas for checkerboard or black background */}
        <canvas
          id="c"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1,
            width: "100%",
            height: "100%",
          }}
        ></canvas>
        {/* Fixation cross image, centered and shown if showFixation is true */}
        <img
          src={fixationCrossSrc[this.props.crossColor || "default"]}
          alt="Fixation Cross"
          className="fixation-cross"
          style={{
            zIndex: 10,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "64px",
            height: "64px",
            visibility: this.props.showFixation ? "visible" : "hidden",
          }}
        />
      </div>
    );
  }
}

// Default prop values for the component
VisualStimulus.defaultProps = {
  showContrast: false, // Checkerboard off by default
  showRatings: false, // Ratings image off by default
  contrast: 0,
  crossColor: "default", // Default fixation cross color
  showFixation: true, // Show fixation cross by default
  checkerboardColors: ["#8B4513", "#000000"], // Default: brown and dark black
};

// Prop types for validation and documentation
VisualStimulus.propTypes = {
  showContrast: PropTypes.bool.isRequired, // Whether to show checkerboard
  showRatings: PropTypes.bool, // Whether to show ratings image
  currentRating: PropTypes.number, // Which rating image to show
  contrast: PropTypes.number,
  crossColor: PropTypes.oneOf(["default", "green", "red"]), // Fixation cross color
  showFixation: PropTypes.bool, // Whether to show fixation cross
  checkerboardColors: PropTypes.arrayOf(PropTypes.string), // Checkerboard color scheme
};

export default VisualStimulus;
