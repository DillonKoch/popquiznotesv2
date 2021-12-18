/*
 *  ==============================================================================
 *  File: notes.js
 *  Project: client
 *  File Created: Sunday, 12th December 2021 9:44:35 pm
 *  Author: Dillon Koch
 *  -----
 *  Last Modified: Sunday, 12th December 2021 9:44:36 pm
 *  Modified By: Dillon Koch
 *  -----
 * 
 *  -----
 *  Notes Component
 *  ==============================================================================
 */


import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "../App.css"
import TextareaAutosize from 'react-textarea-autosize';


function Concept(props) {
    const [concept, setConcept] = useState(props.concept)

    function handleChange(event) {
        let newValue = event.target.value;
        setConcept(prevState => {
            let newConcept = { ...prevState, Changed: true };
            newConcept['Concept Name'] = newValue;
            props.handleChange(newConcept, props.concept_sequence);
            return newConcept;
        })

    }

    return (
        <div>
            <TextareaAutosize
                type="text"
                value={concept['Concept Name']}
                className="concept"
                rows="1"
                onChange={(event) => handleChange(event)}
            />
        </div>
    )
}

function Note(props) {
    return (
        <div>
            <TextareaAutosize
                type="text"
                value={props.text}
                className="note"
                rows="1"
            />
        </div>
    )
}

function Notesection(props) {
    return (
        <div>
            {props.notes.map((val, index) => {
                return (
                    <Note text={val['Note']} key={index} />
                )

            })}
        </div>
    )
}

function Question(props) {
    return (
        <div>
            <TextareaAutosize
                type="text"
                value={props.text}
                className="question"
                rows="1"
            />
        </div>
    )
}


function Answer(props) {
    return (
        <div>
            <TextareaAutosize
                type="text"
                value={props.text}
                className="answer"
            />
        </div>
    )
}

function Questionanswers(props) {

    return (
        <div>
            {props.questions.map((val, index) => {
                return (
                    <div key={index}>
                        <Question text={val['Question']} />
                        <Answer text={props.answers[index]['Answer']} />
                    </div>
                )
            })}
        </div>
    )
}

function Notes(props) {
    const [data, setData] = useState([]);
    const [keys, setKeys] = useState([]);


    useEffect(() => {
        // * building URL
        console.log('note class', props.classname, props.sectionname, props.subsectionname)
        var url_base_string = "https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Query_Notes";
        var url_param_string = `?class=${props.classname}&section=${props.sectionname}&subsection=${props.subsectionname}`;
        var url = url_base_string + url_param_string.replace(/ /g, '%20');
        console.log(url)

        // * grabbing data
        axios.get(url).then((res) => {
            console.log('raw data:')
            console.log(res.data);

            // * creating cleaned_data to store concept sequence: obj (obj containing concept, note, question, answer)
            var cleaned_data = [];
            for (var i = 0; i < res.data.length; i++) {
                const document = res.data[i];
                console.log(document)
                if (document['type'] === 'Concept') {
                    const sub_obj = { 'concept': document, 'Notes': [], 'Questions': [], 'Answers': [] }
                    cleaned_data[document['Sequence']] = sub_obj
                }
            }
            console.log('data with concepts added:')
            console.log(cleaned_data);

            // * ---------
            // * going through the documents a second time to add the notes, questions, and answers
            for (var j = 0; j < res.data.length; j++) {
                const document = res.data[j];
                const document_type = document['type'];
                if (document_type !== 'Concept') {
                    const sequence = document['Sequence'];
                    const sequence_vals = sequence.split('.').slice(0, 3);
                    const concept_sequence = sequence_vals.join('.')
                    cleaned_data[concept_sequence][document_type + 's'].push(document)
                }
            }
            console.log('fully cleaned data:')
            console.log(cleaned_data)
            setData(cleaned_data)
            setKeys(Object.keys(cleaned_data));
            console.log('KEYS', keys.length, typeof keys, keys[0])

        })
    }, [props.subsectionname])

    function handleConceptChange(newConcept, sequence) {
        data[sequence]['concept'] = newConcept;
    }

    function handleNoteChange(newNote, sequence) {
        console.log('note change')
    }

    function saveNotes() {
        console.log('save notes')
        // extract out all the documents, loop through them and update the changed ones
        var all_documents = [];
        for (var i = 0; i < keys.length; i++) {
            const key = keys[i];
            const concept = data[key]['concept'];
            const notes = data[key]['Notes'];
            const questions = data[key]['Questions'];
            const answers = data[key]['Answers'];
            all_documents.push(concept)
            all_documents = all_documents.concat(notes, questions, answers)
        }

        // go through all documents, and save the changed ones to mongodb
        for (var i = 0; i < all_documents.length; i++) {
            const document = all_documents[i];
            if (document['Changed']) {
                console.log('changed document:')
                console.log(document)
                axios.post(`https://data.mongodb-api.com/app/popquiznotesv2-0-app-hhapj/endpoint/Update_Document?class=${props.classname}`, document).then((res) => {
                    console.log('body', res.data)
                })
            }
        }
    }

    function newFirstNote() {
        console.log('new first note')
    }

    return (
        <div className="notes">
            <div className="notescontainer">
                <h1>{props.classname} - {props.sectionname} - {props.subsectionname}</h1>
                <button onClick={(event) => saveNotes(event)}>Save</button>
                <button onClick={(event) => newFirstNote(event)}>New First Note</button>
                <br></br>
                <br></br>

                {Object.keys(data).map((val, index) => {
                    return (
                        <div key={index}>
                            <Concept
                                concept={data[val]['concept']}
                                text={data[val]['concept']['Concept Name']}
                                // key={data[val]['concept']['_id']['$oid']}
                                id={data[val]['concept']['_id']['$oid']}
                                concept_sequence={val}
                                handleChange={handleConceptChange} />
                            <Notesection notes={data[val]['Notes']} key={index + 'n'} />
                            <Questionanswers
                                questions={data[val]['Questions']}
                                answers={data[val]['Answers']}
                                key={index + 'qa'} />
                        </div>

                    )
                })}

            </div>
        </div>
    )
}

export default Notes;
