/*
 *  ==============================================================================
 *  File: App.js
 *  Project: client
 *  File Created: Sunday, 12th December 2021 9:00:41 pm
 *  Author: Dillon Koch
 *  -----
 *  Last Modified: Sunday, 12th December 2021 9:07:56 pm
 *  Modified By: Dillon Koch
 *  -----
 * 
 *  -----
 *  Main App file for Popquiznotes v2
 *  ==============================================================================
 */

import React, { useEffect, useState } from 'react';
import Sidebar from "./components/sidebar";
import Quiz from "./components/quiz"
import Notes from "./components/notes";
import axios from 'axios';


function App() {
	const [shownotes, setShownotes] = useState(true);
	const [quizcontent, setQuizcontent] = useState(0);  // 0 = subsection, 1 = section, 2 = class, 3 = everything
	const [classes, setClasses] = useState([]);
	const [classname, setClassname] = useState("STAT 110");
	const [sectionname, setSectionname] = useState("Ch 1 Probability and Counting");
	const [subsectionname, setSubsectionname] = useState("1.1 Why study probability");

	useEffect(() => {
		axios.get("https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Query_Classes").then((res) => {
			// * set classes, class name, section name, subsection name
			console.log('classes res data', res.data);
			setClasses(res.data);
			setClassname(res.data[0]['Name']);
			const section_name = Object.keys(res.data[0]['Sections_dict'])[0];
			setSectionname(section_name);
			setSubsectionname(res.data[0]['Sections_dict'][section_name][0]);
		})
	}, [])

	function handleSubsectionClick(event, val1, val2, val3) {
		// * changing the class/section/subsection names in the App
		setClassname(val1['Name']);
		setSectionname(val2);
		setSubsectionname(val3);
		console.log('updating class: ', val1['Name'], val2, val3)
	}

	return (
		<div>
			<Sidebar classes={classes} handleSubsectionClick={handleSubsectionClick} />

			{shownotes ?
				<Notes
					classes={classes}
					classname={classname}
					sectionname={sectionname}
					subsectionname={subsectionname}
					setShownotes={setShownotes}
					setQuizcontent={setQuizcontent}
				/> :
				<Quiz
					quizcontent={quizcontent}
					classname={classname}
					sectionname={sectionname}
					subsectionname={subsectionname}
					setShownotes={setShownotes}
				/>
			}
		</div>
	)
}

export default App;
