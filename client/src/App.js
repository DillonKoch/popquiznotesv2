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
import Header from "./components/header";
import Notes from "./components/notes";
import axios from 'axios';


function App() {
	const [shownotes, setShownotes] = useState(true);
	const [classes, setClasses] = useState([]);

	useEffect(() => {
		axios.get("https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Query_Classes").then((res) => {
			// * set classes
			console.log(res.data);
			setClasses(res.data);
		})
	}, [])

	return (
		<div>
			<Header />
			<Sidebar classes={classes} />
			<Notes />
		</div>
	)
}

export default App;
