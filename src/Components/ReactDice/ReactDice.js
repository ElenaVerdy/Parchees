import React from 'react'
import DiceContainer from './DiceContainer'

// eslint-disable-next-line react/display-name
const ReactDice = React.forwardRef((props, ref) => {
    return (
        <DiceContainer
            {...props}
            defaultRoll={6}
            dieSize={60}
            margin={15}
            outline={false}
            outlineColor={'#000000'}
            sides={6}
            ref={ref}
            numDice={2}
            disableIndividual={true}
            rollTime={1}
            dotColor={'#272727'}
            disableRandom={true}
            faceColor={'#ffffff'}
        />
    )
})

export default ReactDice
