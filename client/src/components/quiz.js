/*
 *  ==============================================================================
 *  File: quiz.js
 *  Project: client
 *  File Created: Monday, 20th December 2021 1:31:09 pm
 *  Author: Dillon Koch
 *  -----
 *  Last Modified: Monday, 20th December 2021 1:31:11 pm
 *  Modified By: Dillon Koch
 *  -----
 * 
 *  -----
 *  Putting the quiz in Popquiznotes
 *  ==============================================================================
 */

import React from 'react';

function Quiz(props) {

    function handleBacktoNotesClick(event) {
        props.setShownotes(true);
    }

    return (
        <div className="quiz">
            <button onClick={(event) => handleBacktoNotesClick(event)}>Back to Notes</button>
            <h1>Quiz</h1>
        </div>
    )
}

export default Quiz;
