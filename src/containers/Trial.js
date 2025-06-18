import React, { Component } from "react";
import PropTypes from "prop-types";

import "./Trial.css";
import {
  patch,
  auditoryStim,
  playAuditoryStimulus,
  playWhiteNoise,
  playPinkNoise,
  playBrownianNoise,
} from "../lib/Stim.js";
import VisualStimulus from "./VisualStimulus";
import { Redirect } from "react-router-dom";

import { getStore, getEncryptedMetadata, getDataSent } from "../store";

const FIX_CROSS_COLORS = ["gray", "green", "red"];
function shuffle(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
const blockColorOrders = {};

var _ = require("lodash");
const config = require("../config");
var AudioContext = window.AudioContext || window.webkitAudioContext;

const Q_KEY_CODE = 81;
const E_KEY_CODE = 69;
const KEY_CODE_TO_RATING = {
  49: 1,
  50: 2,
  51: 3,
  52: 4,
  53: 5,
};
const RATING_KEY_CODES = _.map(_.keys(KEY_CODE_TO_RATING), (k) =>
  parseInt(k, 10),
);
const VISUAL_STIMULUS_MS = 1000;
const STIMULUS_MS = 1000;
const TRIALS_PER_MINIBLOCK = 30;


class Trial extends Component {
  /********************************
   *                              *
   *        INITIALIZATION        *
   *                              *
   ********************************/

  constructor(props) {
    super(props);

    // --- Fixation Cross Color Logic (added, non-destructive) ---
    if (this.props.constantCrossColor) {
      this.crossColorOrder = [
        this.props.constantCrossColor,
        this.props.constantCrossColor,
        this.props.constantCrossColor,
      ];
    } else if (typeof this.props.blockIdx !== "undefined") {
      if (!blockColorOrders[this.props.blockIdx]) {
        blockColorOrders[this.props.blockIdx] = shuffle([...FIX_CROSS_COLORS]);
      }
      this.crossColorOrder = blockColorOrders[this.props.blockIdx];
    } else {
      // fallback: always gray if no blockIdx or constantCrossColor
      this.crossColorOrder = ["gray", "gray", "gray"];
    }
    // --- End Fixation Cross Color Logic ---

    // set initial states
    this.state = {
      index: 0,
      showContrast: false,
      responseWindow: false,
      ratingWindow: false,
      trialStarted: false,
      complete: false,
      invalid: false,
      readyToStart: false,
      dataSent: getDataSent(),

      // ratings related state
      currentRating: 1,
      stopIncrementingRating: false,
      stopShowingRating: false,
    };

    // class props init
    this.canvasRef = React.createRef();
    this.audioContext = new AudioContext();
    this.initialDelay = 2000; // time until first stimulus, in ms
    this.delay = 2500; // time in between stimuli, in ms
    this.numAttempts = 0;
    this.numAttemptsLimit = 1000;

    // user inputs
    this.response = [];
    this.responseTime = [];
    this.ratings = [];
    this.ratingsRaw = [];
    this.timestamps = [];

    // timers
    this.ratingTimer = undefined;
    this.stimulusTimer = undefined;

    // time keeping
    this.componentStartTime = 0;
    this.startTime = 0;
    this.ratingStartTime = 0;
    this.timebox = null;
    this.numIterations = 0;

    // keydown status
    this.isKeyDown = {
      Q_KEY_CODE: false,
      E_KEY_CODE: false,
    };
    this.prevKey = null;
  }

  render() {
    // Something went wrong, so we redirect to error page.
    if (this.state.invalid) {
      return <Redirect to="/Error" />;
    } else if (this.state.dataSent) {
      // If we already sent out data, we're done.
      return <Redirect to="/ThankYou" />;
    } else if (this.state.complete) {
      // If trial is complete, then we use the renderer passed in as a prop.
      // This renderer should take care of the redirect logic.

      return this.props.trialCompleteRenderer(
        this.props.decibels,
        this.response,
      );
    }

    return (
      <div className={"Trial " + (this.state.trialStarted ? "Trial-gray" : "")}>
        {this.state.trialStarted ? (
          <div className="Trial-stimulus">
            <VisualStimulus
              showContrast={this.state.showContrast}
              showRatings={this.state.ratingWindow}
              currentRating={this.state.currentRating}
              // --- Fixation Cross Color Logic --- //
              crossColor={this.crossColorOrder[Math.floor(this.state.index / TRIALS_PER_MINIBLOCK)]}
            />
          </div>
        ) : (
          <p className="Trial-text">
            {this.state.readyToStart ? (
              <span>Press any key to begin</span>
            ) : (
              <span>Loading...</span>
            )}
          </p>
        )}
      </div>
    );
  } // end render
}

Trial.defaultProps = {
  decibels: config.debug
    ? _.shuffle([65, 65, 65, 65])
    : _.concat([65], _.shuffle([0, 0, 0, 0, 0, 65, 65, 65, 65])),
  shouldRecordRatings: false,
  trialCompleteRenderer: _.noop,
  responseHandler: _.noop,
  dataHandler: _.noop,
};

Trial.propTypes = {
  decibels: PropTypes.array.isRequired,
  shouldRecordRatings: PropTypes.bool,
  trialCompleteRenderer: PropTypes.func,
  responseHandler: PropTypes.func,
  dataHandler: PropTypes.func.isRequired,
  blockIdx: PropTypes.number,
  constantCrossColor: PropTypes.string,
};

export default Trial;
