import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Trial from "./Trial";

import { setComponentData } from "../store";
import { create_blocks_singleton } from "../lib/tt_blocks";

var _ = require("lodash");

const TRIAL_NUM = 5;
const BLOCK_START = 12;
const BLOCK_END = 15; // not inclusive

class Trial_TT_5 extends Component {
  constructor(props) {
    super(props);

    this.startTimestamp = new Date().getTime();
    this.state = {
      decibels: _.flatten(
        _.slice(create_blocks_singleton(), BLOCK_START, BLOCK_END),
      ),
    };
  }

  trialCompleteRenderer = (decibels, response) => {
    return <Redirect to="/ThankYou" />;
  };

  dataHandler = (
    decibels,
    response,
    responseTime,
    ratings,
    ratingsRaw,
    timestamps,
  ) => {
    setComponentData(
      TRIAL_NUM,
      decibels,
      response,
      responseTime,
      ratings,
      ratingsRaw,
      timestamps,
      this.startTimestamp,
    );
  };

  render() {
    if (_.isEmpty(this.state.decibels)) {
      return <Redirect to="/Error" />;
    }

    return (
      <Trial
        decibels={this.state.decibels}
        shouldRecordRatings={true}
        trialCompleteRenderer={this.trialCompleteRenderer}
        dataHandler={this.dataHandler}
        blockIdx={TRIAL_NUM} // <--- Pass the block number!
      />
    );
  }
}

export default Trial_TT_5;
