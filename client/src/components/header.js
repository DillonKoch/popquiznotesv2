/*
 *  ==============================================================================
 *  File: header.js
 *  Project: client
 *  File Created: Sunday, 12th December 2021 9:42:36 pm
 *  Author: Dillon Koch
 *  -----
 *  Last Modified: Sunday, 12th December 2021 9:42:37 pm
 *  Modified By: Dillon Koch
 *  -----
 * 
 *  -----
 *  Header Component
 *  ==============================================================================
 */

import React from 'react';
import "../App.css"

function Header(props) {
    return (
        <div className="header">
            <div>
                <h1>{props.class} - {props.section} - {props.subsection}</h1>
                {/* <button onClick={(event) => props.saveNotes(event)}>Save</button> */}
                {/* <button onClick={(event) => props.newFirstNote(event)}>New First Note</button> */}
            </div>
        </div>
    )
}

export default Header;
