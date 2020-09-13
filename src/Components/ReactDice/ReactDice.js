import React from 'react'
import DiceContainer from './DiceContainer'

const ReactDice = React.forwardRef((props, ref) => {
  const totalCb = (total, diceValues) => {
    props.rollDone(total, diceValues)
  }

  return <DiceContainer {...props} defaultRoll={6} dieSize={60} margin={15} outline={false} outlineColor={'#000000'} sides={6} totalCb={totalCb} ref={ref} />
});

export default ReactDice;
